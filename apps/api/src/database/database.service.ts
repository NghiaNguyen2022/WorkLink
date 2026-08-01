import {
  Inject,
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';
import type { Pool } from 'mysql2/promise';

import {
  DATABASE,
  MYSQL_POOL,
  type WorkLinkDatabase,
} from './database.provider';

/**
 * Cổng truy cập database duy nhất dành cho các module nghiệp vụ.
 *
 * Các service bên ngoài `src/database` chỉ được inject class này.
 * Không inject trực tiếp Pool, DATABASE hoặc MYSQL_POOL.
 */
@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  constructor(
    @Inject(DATABASE)
    public readonly db: WorkLinkDatabase,

    @Inject(MYSQL_POOL)
    private readonly pool: Pool,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
