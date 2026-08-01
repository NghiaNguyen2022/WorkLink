import { defineConfig } from 'drizzle-kit';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function dbPort(): number {
  const value = Number(process.env.DB_PORT ?? 3306);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('DB_PORT must be a positive integer');
  }
  return value;
}

export default defineConfig({
  schema: './src/database/schema.ts',
  out: './drizzle',
  dialect: 'mysql',
  dbCredentials: {
    host: required('DB_HOST'),
    port: dbPort(),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
  },
  verbose: true,
  strict: true,
});
