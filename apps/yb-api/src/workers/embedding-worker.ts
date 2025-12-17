/**
 * Background Job Worker: Embedding Generation
 * 
 * This worker processes embedding generation jobs from the queue.
 * It's currently in LOG-ONLY mode for demonstration purposes.
 * 
 * To run: npx tsx apps/yb-api/src/workers/embedding-worker.ts
 */

import { PrismaClient } from '@prisma/client';
import { initializeJobQueue, JobTypes, EmbeddingJobPayload } from '../services/job-queue.service';

const prisma = new PrismaClient();

/**
 * Main worker function - processes embedding generation jobs
 */
async function processEmbeddingJob(job: { id: string; data: EmbeddingJobPayload }) {
  const startTime = Date.now();
  const { businessId, text, attempt, enqueuedAt } = job.data;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 JOB RECEIVED');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🆔 Job ID: ${job.id}`);
  console.log(`🏢 Business ID: ${businessId}`);
  console.log(`🔢 Attempt: ${attempt}/5`);
  console.log(`⏰ Enqueued At: ${enqueuedAt}`);
  console.log(`📝 Text to Embed (${text.length} chars):`);
  console.log(`   "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
  console.log('');

  try {
    // Step 1: Check if business still exists
    console.log('🔍 Step 1: Checking if business exists...');
    const business = await prisma.yellowBookEntry.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        embedding: true,
        updatedAt: true,
      },
    });

    if (!business) {
      console.log('❌ Business not found - job will be marked as failed');
      console.log('   Reason: Business was deleted before job could process');
      throw new Error('Business no longer exists');
    }

    console.log(`✅ Business found: "${business.name}"`);

    // Step 2: Check idempotency - skip if embedding already exists
    if (business.embedding && business.updatedAt > new Date(enqueuedAt)) {
      console.log('⏭️  SKIPPING: Embedding already generated');
      console.log(`   Generated at: ${business.updatedAt.toISOString()}`);
      console.log(`   Job enqueued at: ${enqueuedAt}`);
      console.log(`   ℹ️  This is idempotency in action - job was already processed`);
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return; // Success - no need to process again
    }

    console.log('🔄 Embedding not found or outdated - proceeding with generation');
    console.log('');

    // Step 3: Generate embedding (SIMULATED in log-only mode)
    console.log('🤖 Step 2: Generating embedding (SIMULATED)...');
    console.log('   📡 Would call: GoogleGenerativeAI.embedContent()');
    console.log(`   📊 Model: embedding-001`);
    console.log(`   📝 Input: "${text}"`);
    console.log('   ⏳ Simulating API call delay (2 seconds)...');
    
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Simulate embedding vector (768 dimensions)
    const mockEmbedding = Array.from({ length: 768 }, () => Math.random());
    console.log(`   ✅ Generated embedding: [${mockEmbedding.slice(0, 5).map(n => n.toFixed(4)).join(', ')}, ..., ${mockEmbedding[767].toFixed(4)}]`);
    console.log(`   📏 Dimensions: ${mockEmbedding.length}`);
    console.log('');

    // Step 4: Save embedding to database (SIMULATED)
    console.log('💾 Step 3: Saving embedding to database (SIMULATED)...');
    console.log('   📡 Would execute: prisma.yellowBookEntry.updateMany()');
    console.log(`   🎯 WHERE: id = "${businessId}" AND (embedding IS NULL OR updatedAt < "${enqueuedAt}")`);
    console.log(`   📦 DATA: embedding = [768 floats], updatedAt = NOW()`);
    
    // In production, this would be:
    // const result = await prisma.yellowBookEntry.updateMany({
    //   where: {
    //     id: businessId,
    //     OR: [
    //       { embedding: null },
    //       { updatedAt: { lt: new Date(enqueuedAt) } },
    //     ],
    //   },
    //   data: {
    //     embedding: mockEmbedding,
    //     updatedAt: new Date(),
    //   },
    // });
    
    console.log('   ✅ Database update successful (simulated)');
    console.log('');

    // Success!
    const duration = Date.now() - startTime;
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ JOB COMPLETED SUCCESSFULLY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`🎯 Business: ${business.name}`);
    console.log(`📊 Embedding: ${mockEmbedding.length} dimensions saved`);
    console.log('');

  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ JOB FAILED');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`❌ Error: ${error.message}`);
    console.log(`📊 Stack: ${error.stack?.substring(0, 200)}...`);
    console.log('');

    // Determine if error is retryable
    const isRetryable = shouldRetryError(error);
    console.log(`🔄 Retryable: ${isRetryable ? 'YES' : 'NO'}`);
    
    if (isRetryable && attempt < 5) {
      const nextDelay = calculateBackoffDelay(attempt);
      console.log(`⏰ Next retry in: ${nextDelay}ms (${(nextDelay / 1000).toFixed(1)}s)`);
      console.log(`🔢 Next attempt: ${attempt + 1}/5`);
    } else if (attempt >= 5) {
      console.log('🪦 Max retries exceeded - job will move to DLQ');
      console.log('   Action needed: Manual review in DLQ dashboard');
    } else {
      console.log('🚫 Permanent error - job will move to DLQ immediately');
      console.log('   Action needed: Fix root cause and replay job');
    }
    console.log('');

    // Re-throw error so pg-boss can handle retry logic
    throw error;
  }
}

/**
 * Determine if an error should be retried
 */
function shouldRetryError(error: any): boolean {
  // Retry on transient errors
  if (error.status === 429) return true; // Rate limit
  if (error.status === 500) return true; // Server error
  if (error.status === 503) return true; // Service unavailable
  if (error.code === 'ETIMEDOUT') return true; // Timeout
  if (error.code === 'ECONNREFUSED') return true; // Network error

  // Don't retry on permanent errors
  if (error.status === 400) return false; // Bad request
  if (error.status === 401) return false; // Invalid API key
  if (error.status === 404) return false; // Model not found
  if (error.message?.includes('no longer exists')) return false; // Business deleted

  // Default: retry
  return true;
}

/**
 * Calculate exponential backoff delay
 */
function calculateBackoffDelay(attempt: number): number {
  const baseDelay = 2000; // 2 seconds
  const maxDelay = 300000; // 5 minutes
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);
  
  // Add jitter: +/- 20% randomness
  const jitter = cappedDelay * 0.2 * (Math.random() - 0.5);
  
  return Math.floor(cappedDelay + jitter);
}

/**
 * Start the worker
 */
async function main() {
  console.log('');
  console.log('🚀 ═══════════════════════════════════════════════════════');
  console.log('🚀 EMBEDDING WORKER STARTING');
  console.log('🚀 ═══════════════════════════════════════════════════════');
  console.log('📦 Mode: LOG-ONLY (demonstration)');
  console.log('🔧 To enable real processing:');
  console.log('   1. Uncomment Gemini API calls in processEmbeddingJob()');
  console.log('   2. Uncomment Prisma database updates');
  console.log('   3. Set GEMINI_API_KEY environment variable');
  console.log('');
  console.log('⚙️  Initializing job queue...');

  try {
    // Initialize job queue
    const boss = await initializeJobQueue();
    console.log('✅ Job queue connected');
    console.log('');

    // Register job handler
    console.log(`👂 Listening for jobs: ${JobTypes.GENERATE_EMBEDDING}`);
    console.log('🔄 Polling interval: 2 seconds');
    console.log('⏳ Waiting for jobs...');
    console.log('');

    await boss.work(
      JobTypes.GENERATE_EMBEDDING,
      {
        teamSize: 1, // Process 1 job at a time
        teamConcurrency: 1, // 1 concurrent job per worker
      },
      async (job) => {
        await processEmbeddingJob(job);
      }
    );

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('');
      console.log('👋 Received SIGTERM - shutting down gracefully...');
      await boss.stop();
      await prisma.$disconnect();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      console.log('');
      console.log('👋 Received SIGINT - shutting down gracefully...');
      await boss.stop();
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start worker:', error);
    process.exit(1);
  }
}

// Start worker
main();
