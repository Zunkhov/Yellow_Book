# Background Jobs Design Document: Embedding Generation

## Feature Selection: AI Embeddings

We selected the **embedding generation** feature for background job implementation because it involves expensive external API calls to Google Gemini that can take several seconds per business entry.

---

## 1. Job Design Overview

### Job Name: `generate-embedding`

### Trigger
- **When**: A new Yellow Book business entry is created or updated via API
- **Where**: POST `/api/yellow-books` or PATCH `/api/yellow-books/:id` endpoints
- **Condition**: Only triggered when `description` field is provided/changed

### Payload
```typescript
interface EmbeddingJobPayload {
  businessId: string;        // UUID of the business entry
  text: string;              // Combined text (name + description + categories + city)
  attempt: number;           // Current retry attempt (starts at 1)
  enqueuedAt: string;        // ISO timestamp when job was queued
}
```

### Outcome
- **Success**: 
  - Embedding vector (768 floats) saved to `YellowBookEntry.embedding` field
  - Job marked as completed
  - Log success metrics
  
- **Failure**: 
  - Job retried according to backoff strategy
  - After max retries: moved to Dead Letter Queue (DLQ)
  - Business entry remains searchable via keyword fallback

---

## 2. Why Async is Essential

### Current Synchronous Problems
1. **User Experience**: API calls block for 2-5 seconds while waiting for Gemini response
2. **API Timeouts**: HTTP requests may timeout before embedding completes
3. **Resource Waste**: Server threads blocked waiting for external API
4. **No Retry Logic**: If Gemini fails (quota/network), embedding is lost
5. **Rate Limiting**: Can't easily implement intelligent rate limiting

### Benefits of Async Approach
- ✅ **Immediate Response**: API returns instantly with 201 Created
- ✅ **Better UX**: Users don't wait for AI processing
- ✅ **Resilience**: Automatic retries on failure
- ✅ **Rate Limiting**: Control Gemini API calls to avoid quota
- ✅ **Scalability**: Multiple workers can process embeddings in parallel
- ✅ **Monitoring**: Centralized job queue for observability

---

## 3. Retry & Backoff Strategy

### Retry Configuration
```typescript
const RETRY_CONFIG = {
  maxAttempts: 5,
  backoffType: 'exponential',
  baseDelay: 2000,      // 2 seconds
  maxDelay: 300000,     // 5 minutes
  jitter: true,         // Add randomness to prevent thundering herd
};
```

### Backoff Schedule
| Attempt | Delay (seconds) | Cumulative Time |
|---------|-----------------|-----------------|
| 1       | 0               | 0s              |
| 2       | ~2              | 2s              |
| 3       | ~4              | 6s              |
| 4       | ~8              | 14s             |
| 5       | ~16             | 30s             |
| 6 (DLQ) | -               | Failed          |

### Retry Decision Logic
```typescript
function shouldRetry(error: Error, attempt: number): boolean {
  // Retry on transient errors
  if (error.status === 429) return true;  // Rate limit
  if (error.status === 500) return true;  // Server error
  if (error.status === 503) return true;  // Service unavailable
  if (error.code === 'ETIMEDOUT') return true;  // Timeout
  if (error.code === 'ECONNREFUSED') return true;  // Network error
  
  // Don't retry on permanent errors
  if (error.status === 400) return false;  // Bad request
  if (error.status === 401) return false;  // Invalid API key
  if (error.status === 404) return false;  // Model not found
  
  // Retry if under max attempts
  return attempt < RETRY_CONFIG.maxAttempts;
}
```

### Exponential Backoff with Jitter
```typescript
function calculateDelay(attempt: number): number {
  const exponentialDelay = RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, RETRY_CONFIG.maxDelay);
  
  // Add jitter: +/- 20% randomness
  const jitter = RETRY_CONFIG.jitter 
    ? cappedDelay * 0.2 * (Math.random() - 0.5)
    : 0;
  
  return Math.floor(cappedDelay + jitter);
}
```

---

## 4. Idempotency Strategy

### Problem
A job might be processed multiple times due to:
- Worker crashes mid-processing
- Network failures causing duplicate delivery
- Manual job replay for debugging

### Solution: Multi-Layer Idempotency

#### Layer 1: Deduplication Key
```typescript
interface Job {
  id: string;                    // Unique job ID
  deduplicationKey: string;      // `embedding:${businessId}`
  payload: EmbeddingJobPayload;
}
```
- Queue prevents duplicate jobs with same deduplication key within 24 hours
- If duplicate arrives, return existing job ID

#### Layer 2: Database Check
```typescript
async function processEmbedding(payload: EmbeddingJobPayload) {
  // Check if embedding already exists
  const business = await prisma.yellowBookEntry.findUnique({
    where: { id: payload.businessId },
    select: { embedding: true, updatedAt: true },
  });
  
  // Skip if embedding is fresh (created after job was queued)
  if (business.embedding && business.updatedAt > new Date(payload.enqueuedAt)) {
    console.log('⏭️ Skipping: embedding already generated');
    return { skipped: true };
  }
  
  // Generate embedding...
}
```

#### Layer 3: Conditional Update
```typescript
// Use optimistic locking to prevent race conditions
const result = await prisma.yellowBookEntry.updateMany({
  where: {
    id: payload.businessId,
    // Only update if embedding is still null or older
    OR: [
      { embedding: null },
      { updatedAt: { lt: new Date(payload.enqueuedAt) } }
    ]
  },
  data: {
    embedding: embeddingVector,
    updatedAt: new Date(),
  },
});

if (result.count === 0) {
  console.log('⏭️ Skipping: another job already updated this entry');
  return { skipped: true };
}
```

### Idempotency Guarantees
- ✅ Same input → same output (embedding is deterministic for same text)
- ✅ Multiple executions → single side effect (only one DB update)
- ✅ Safe to replay jobs manually
- ✅ No duplicate API calls for same business

---

## 5. Dead Letter Queue (DLQ) Strategy

### What Goes to DLQ?

#### Permanent Failures
1. **Invalid API Key**: 401 Unauthorized
2. **Model Not Found**: 404 (e.g., wrong model name)
3. **Invalid Input**: 400 Bad Request (text too long, invalid format)
4. **Business Deleted**: Entry no longer exists in database

#### Exhausted Retries
5. **Max Attempts Reached**: Failed 5 times with transient errors
6. **Quota Exceeded**: 429 errors persisting beyond retry window

### DLQ Schema
```typescript
interface DLQEntry {
  id: string;
  jobId: string;
  jobType: 'generate-embedding';
  payload: EmbeddingJobPayload;
  error: {
    message: string;
    code?: string;
    status?: number;
    stack?: string;
  };
  failedAt: Date;
  attempts: number;
  lastAttemptAt: Date;
  reason: 'permanent_error' | 'max_retries_exceeded';
}
```

### How to Handle DLQ Entries

#### 1. Monitoring & Alerting
```typescript
// Alert when DLQ exceeds threshold
if (await getDLQCount() > 10) {
  await sendAlert({
    severity: 'warning',
    message: `${count} embedding jobs in DLQ`,
    action: 'Check Gemini API status and quotas',
  });
}
```

#### 2. Manual Review Dashboard
- **View DLQ entries** sorted by failure reason
- **Inspect error details** and payload
- **Replay individual jobs** after fixing root cause
- **Bulk replay** after API key rotation or quota reset

#### 3. Automated Recovery
```typescript
// Cron job: retry DLQ entries for quota errors after 24h
async function retryQuotaErrors() {
  const entries = await prisma.dLQEntry.findMany({
    where: {
      reason: 'max_retries_exceeded',
      error: { path: ['message'], string_contains: 'quota' },
      failedAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  
  for (const entry of entries) {
    await queue.add('generate-embedding', entry.payload);
    await prisma.dLQEntry.delete({ where: { id: entry.id } });
  }
}
```

#### 4. Fallback Strategy
For businesses with failed embeddings:
- **Keyword search still works** (no AI dependency)
- **Manual trigger button** in admin UI: "Regenerate Embedding"
- **Batch regeneration script** for multiple entries

#### 5. Root Cause Analysis
```typescript
// Aggregate DLQ entries by error type
const errorStats = await prisma.dLQEntry.groupBy({
  by: ['error.status', 'reason'],
  _count: true,
});

// Example output:
// { status: 429, reason: 'max_retries_exceeded', count: 45 }  → Quota issue
// { status: 401, reason: 'permanent_error', count: 3 }        → API key problem
// { status: null, reason: 'max_retries_exceeded', count: 7 }  → Network issues
```

### DLQ Cleanup Policy
- **Keep entries for 30 days** for debugging
- **Archive to cold storage** after 30 days
- **Permanent delete** after 90 days
- **Exception**: Keep failed entries for deleted businesses (audit trail)

---

## 6. Implementation Architecture

### Components

```
┌─────────────────┐
│   API Handler   │
│  POST /api/yb   │
└────────┬────────┘
         │ 1. Save to DB
         │ 2. Enqueue job
         ▼
┌─────────────────┐
│   Job Queue     │
│    (pg-boss)    │
│                 │
│ ┌─────────────┐ │
│ │   Pending   │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │   Active    │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │   Retrying  │ │
│ └─────────────┘ │
│ ┌─────────────┐ │
│ │     DLQ     │ │
│ └─────────────┘ │
└────────┬────────┘
         │ Poll for jobs
         ▼
┌─────────────────┐
│  Worker Process │
│                 │
│ 1. Fetch job    │
│ 2. Check idempot│
│ 3. Call Gemini  │
│ 4. Save embed   │
│ 5. ACK job      │
└─────────────────┘
```

### Technology Choice: **pg-boss**

**Why pg-boss?**
- ✅ Uses existing PostgreSQL (no Redis needed)
- ✅ ACID guarantees (jobs can't be lost)
- ✅ Built-in retry, backoff, DLQ
- ✅ Simple API, low overhead
- ✅ TypeScript support

**Alternative considered**: BullMQ (requires Redis)

### Database Tables

pg-boss creates these tables automatically:
- `pgboss.job` - Active and pending jobs
- `pgboss.archive` - Completed jobs (auto-cleanup)
- `pgboss.schedule` - Recurring jobs (future use)

---

## 7. Monitoring & Metrics

### Key Metrics to Track
1. **Job throughput**: Jobs/minute processed
2. **Success rate**: % of jobs completed successfully
3. **Retry rate**: % of jobs requiring retries
4. **DLQ size**: Number of permanently failed jobs
5. **Processing time**: p50, p95, p99 latency
6. **Queue depth**: Pending jobs waiting to process

### Logging Strategy
```typescript
// Structured logs for observability
logger.info('embedding_job_started', {
  jobId: job.id,
  businessId: payload.businessId,
  attempt: payload.attempt,
});

logger.info('embedding_job_completed', {
  jobId: job.id,
  businessId: payload.businessId,
  duration: Date.now() - startTime,
  embeddingSize: embedding.length,
});

logger.error('embedding_job_failed', {
  jobId: job.id,
  businessId: payload.businessId,
  attempt: payload.attempt,
  error: error.message,
  willRetry: shouldRetry(error, payload.attempt),
});
```

---

## Summary

This design ensures:
- ✅ **Async processing** improves API response time from 5s → <100ms
- ✅ **Automatic retries** with exponential backoff handle transient failures
- ✅ **Idempotency** prevents duplicate processing and wasted API calls
- ✅ **DLQ handling** provides visibility and recovery for failed jobs
- ✅ **Monitoring** enables proactive issue detection
- ✅ **Graceful degradation** via keyword search fallback

**Result**: Robust, production-ready embedding generation system that scales reliably.
