import {
  Inject,
  Injectable,
  OnApplicationShutdown,
} from '@nestjs/common';
import { sql } from 'drizzle-orm';
import type { Pool } from 'mysql2/promise';

import {
  DATABASE,
  MYSQL_POOL,
  type WorkLinkDatabase,
} from './database.provider';

/**
 * Cổng truy cập database duy nhất của các module nghiệp vụ.
 *
 * Module bên ngoài src/database không được inject pool hoặc token database.
 * Tất cả truy vấn nghiệp vụ đi qua `database.db`.
 */
@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  constructor(
    @Inject(DATABASE)
    public readonly db: WorkLinkDatabase,

    @Inject(MYSQL_POOL)
    private readonly pool: Pool,
  ) {}

  async ping(): Promise<boolean> {
    try {
      await this.db.execute(sql`SELECT 1`);
      return true;
    } catch {
      return false;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
