import { randomUUID } from 'node:crypto';
import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  fullName: varchar('full_name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 30 }),
  role: mysqlEnum('role', ['ADMIN', 'CUSTOMER', 'WORKER', 'OPERATOR']).notNull(),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().onUpdateNow(),
});

export const customerProfiles = mysqlTable('customer_profiles', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  customerType: mysqlEnum('customer_type', ['INDIVIDUAL', 'BUSINESS'])
    .notNull()
    .default('INDIVIDUAL'),
  companyName: varchar('company_name', { length: 255 }),
  verified: boolean('verified').notNull().default(false),
  defaultLocation: varchar('default_location', { length: 500 }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().onUpdateNow(),
});

export const workerProfiles = mysqlTable('worker_profiles', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
  userId: varchar('user_id', { length: 36 })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  verificationLevel: mysqlEnum('verification_level', ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'])
    .notNull()
    .default('V0'),
  skills: json('skills').$type<string[]>().notNull(),
  serviceAreas: json('service_areas').$type<string[]>().notNull(),
  rating: int('rating').notNull().default(0),
  completedJobs: int('completed_jobs').notNull().default(0),
  available: boolean('available').notNull().default(false),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow().onUpdateNow(),
});

export type UserRecord = typeof users.$inferSelect;
export type NewUserRecord = typeof users.$inferInsert;
export type CustomerProfileRecord = typeof customerProfiles.$inferSelect;
export type WorkerProfileRecord = typeof workerProfiles.$inferSelect;
