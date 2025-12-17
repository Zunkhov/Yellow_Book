import PgBoss from 'pg-boss';

// Job queue singleton
let boss: PgBoss | null = null;

/**
 * Initialize the job queue
 */
export async function initializeJobQueue(): Promise<PgBoss> {
  if (boss) {
    return boss;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  boss = new PgBoss({
    connectionString,
    schema: 'pgboss', // Separate schema for pg-boss tables
    retryLimit: 5, // Max retry attempts
    retryDelay: 2, // Initial retry delay in seconds
    retryBackoff: true, // Use exponential backoff
    expireInHours: 24, // Jobs expire after 24 hours
    archiveCompletedAfterSeconds: 3600, // Archive completed jobs after 1 hour
  });

  boss.on('error', (error) => {
    console.error('❌ Job queue error:', error);
  });

  await boss.start();
  console.log('✅ Job queue initialized');

  return boss;
}

/**
 * Get the job queue instance
 */
export function getJobQueue(): PgBoss {
  if (!boss) {
    throw new Error('Job queue not initialized. Call initializeJobQueue() first');
  }
  return boss;
}

/**
 * Stop the job queue gracefully
 */
export async function stopJobQueue(): Promise<void> {
  if (boss) {
    await boss.stop();
    boss = null;
    console.log('👋 Job queue stopped');
  }
}

// Job type definitions
export interface EmbeddingJobPayload {
  businessId: string;
  text: string;
  attempt: number;
  enqueuedAt: string;
}

export const JobTypes = {
  GENERATE_EMBEDDING: 'generate-embedding',
} as const;

export type JobType = (typeof JobTypes)[keyof typeof JobTypes];
