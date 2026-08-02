import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  createPool,
  type Pool,
  type RowDataPacket,
} from 'mysql2/promise';

import { getMySqlPoolOptions } from './database.config';

interface CountRow extends RowDataPacket {
  itemCount: number;
}

interface ColumnDefinition {
  tableName: string;
  columnName: string;
  definition: string;
}

const REQUIRED_COLUMNS: readonly ColumnDefinition[] = [
  {
    tableName: 'jobs',
    columnName: 'submitted_at',
    definition: 'TIMESTAMP NULL AFTER `published_at`',
  },
  {
    tableName: 'jobs',
    columnName: 'cancelled_at',
    definition: 'TIMESTAMP NULL AFTER `verified_by_user_id`',
  },
  {
    tableName: 'jobs',
    columnName: 'cancellation_reason',
    definition: 'VARCHAR(500) NULL AFTER `cancelled_at`',
  },
  {
    tableName: 'pricing_quotes',
    columnName: 'accepted_at',
    definition: 'TIMESTAMP NULL AFTER `created_by_user_id`',
  },
  {
    tableName: 'pricing_quotes',
    columnName: 'accepted_by_user_id',
    definition: 'VARCHAR(36) NULL AFTER `accepted_at`',
  },
] as const;

function assertIdentifier(value: string): string {
  if (!/^[a-zA-Z0-9_]+$/.test(value)) {
    throw new Error(`Invalid SQL identifier: ${value}`);
  }

  return value;
}

async function tableExists(
  pool: Pool,
  tableName: string,
): Promise<boolean> {
  const [rows] = await pool.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS itemCount
      FROM information_schema.tables
      WHERE table_schema = DATABASE()
        AND table_name = ?
    `,
    [tableName],
  );

  return Number(rows[0]?.itemCount ?? 0) > 0;
}

async function columnExists(
  pool: Pool,
  tableName: string,
  columnName: string,
): Promise<boolean> {
  const [rows] = await pool.execute<CountRow[]>(
    `
      SELECT COUNT(*) AS itemCount
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?
    `,
    [tableName, columnName],
  );

  return Number(rows[0]?.itemCount ?? 0) > 0;
}

async function ensureColumn(
  pool: Pool,
  column: ColumnDefinition,
): Promise<void> {
  const tableName = assertIdentifier(column.tableName);
  const columnName = assertIdentifier(column.columnName);

  if (!(await tableExists(pool, tableName))) {
    console.log(
      `Skipped column ${tableName}.${columnName}: table does not exist`,
    );
    return;
  }

  if (!(await columnExists(pool, tableName, columnName))) {
    await pool.query(
      `ALTER TABLE \`${tableName}\`
       ADD COLUMN \`${columnName}\` ${column.definition}`,
    );
  }

  console.log(`Ensured column: ${tableName}.${columnName}`);
}

async function runSqlFiles(
  pool: Pool,
  migrationDirectory: string,
): Promise<void> {
  const migrationFiles = (await readdir(migrationDirectory))
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort();

  for (const fileName of migrationFiles) {
    const migrationFile = resolve(
      migrationDirectory,
      fileName,
    );

    const sql = await readFile(migrationFile, 'utf8');

    if (!sql.trim()) {
      continue;
    }

    console.log(`Running migration: ${fileName}`);
    await pool.query(sql);
  }
}

async function runMigration(): Promise<void> {
  const pool = createPool(getMySqlPoolOptions(true));
  const migrationDirectory = resolve(
    process.cwd(),
    'drizzle',
  );

  try {
    await runSqlFiles(pool, migrationDirectory);

    for (const column of REQUIRED_COLUMNS) {
      await ensureColumn(pool, column);
    }

    console.log(
      'WorkLink database migration completed successfully.',
    );
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
