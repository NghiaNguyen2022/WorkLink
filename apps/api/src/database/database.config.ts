import type { PoolOptions } from 'mysql2/promise';

function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function positiveInteger(name: string, fallback: number): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return fallback;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }

  return value;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  timezone: string;
}

export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: required('DB_HOST'),
    port: positiveInteger('DB_PORT', 3306),
    user: required('DB_USER'),
    password: required('DB_PASSWORD'),
    database: required('DB_NAME'),
    connectionLimit: positiveInteger('DB_CONNECTION_LIMIT', 10),
    timezone: process.env.DB_TIMEZONE?.trim() || 'Z',
  };
}

export function getMySqlPoolOptions(
  multipleStatements = false,
): PoolOptions {
  const config = getDatabaseConfig();

  return {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    connectionLimit: config.connectionLimit,
    timezone: config.timezone,
    waitForConnections: true,
    queueLimit: 0,
    charset: 'utf8mb4',
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    multipleStatements,
  };
}
