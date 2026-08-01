import type { Provider } from '@nestjs/common';
import {
  drizzle,
  type MySql2Database,
} from 'drizzle-orm/mysql2';
import {
  createPool,
  type Pool,
} from 'mysql2/promise';

import { getMySqlPoolOptions } from './database.config';
import * as schema from './schema/index';

export const MYSQL_POOL = Symbol('WORKLINK_MYSQL_POOL');
export const DATABASE = Symbol('WORKLINK_DATABASE');

export type WorkLinkDatabase = MySql2Database<typeof schema>;

export const databaseProviders: Provider[] = [
  {
    provide: MYSQL_POOL,
    useFactory: (): Pool => {
      return createPool(getMySqlPoolOptions());
    },
  },
  {
    provide: DATABASE,
    inject: [MYSQL_POOL],
    useFactory: (pool: Pool): WorkLinkDatabase => {
      return drizzle(pool, {
        schema,
        mode: 'default',
      });
    },
  },
];
