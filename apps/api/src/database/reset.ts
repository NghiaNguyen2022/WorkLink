import { createPool } from 'mysql2/promise';

import { getMySqlPoolOptions } from './database.config';

const TABLES = [
  'audit_logs',
  'support_cases',
  'reviews',
  'payments',
  'work_sessions',
  'assignments',
  'job_candidates',
  'pricing_quotes',
  'job_requirements',
  'jobs',
  'job_categories',
  'worker_availability',
  'worker_skills',
  'worker_profiles',
  'customer_locations',
  'customer_profiles',
  'users',
] as const;

async function resetDatabase(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Database reset is disabled in production.');
  }

  const pool = createPool(getMySqlPoolOptions());

  try {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const tableName of TABLES) {
      await pool.query(`DROP TABLE IF EXISTS \`${tableName}\``);
      console.log(`Dropped ${tableName}`);
    }

    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('WorkLink database reset completed.');
  } finally {
    await pool.end();
  }
}

void resetDatabase();
