import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { createPool } from 'mysql2/promise';

import { getMySqlPoolOptions } from './database.config';

async function runMigration(): Promise<void> {
  const pool = createPool(getMySqlPoolOptions(true));
  const migrationFile = resolve(
    process.cwd(),
    'drizzle',
    '0001_worklink_core.sql',
  );

  try {
    const sql = await readFile(migrationFile, 'utf8');

    console.log(`Running migration: ${migrationFile}`);

    await pool.query(sql);

    console.log('WorkLink database migration completed successfully.');
  } catch (error: unknown) {
    console.error('WorkLink database migration failed.');

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error.stack);
    } else {
      console.error(error);
    }

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void runMigration();
