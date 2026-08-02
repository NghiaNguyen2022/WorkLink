import {
  decimal,
  index,
  int,
  json,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import { jobs } from './jobs';
import { jobCandidates } from './operations';
import { users } from './users';

export const matchingRuns = mysqlTable(
  'matching_runs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('COMPLETED'),
    totalWorkers: int('total_workers').notNull().default(0),
    eligibleWorkers: int('eligible_workers').notNull().default(0),
    proposedWorkers: int('proposed_workers').notNull().default(0),
    minimumScore: decimal('minimum_score', {
      precision: 6,
      scale: 2,
      mode: 'number',
    }).notNull(),
    parameters: json('parameters').$type<Record<string, unknown>>(),
    createdByUserId: varchar('created_by_user_id', {
      length: 36,
    }).references(() => users.id),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    jobIndex: index('ix_matching_runs_job').on(table.jobId),
  }),
);

export const candidateOffers = mysqlTable(
  'candidate_offers',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    candidateId: varchar('candidate_id', { length: 36 })
      .notNull()
      .references(() => jobCandidates.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('OFFERED'),
    proposedPayout: decimal('proposed_payout', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    responseNote: varchar('response_note', { length: 500 }),
    offeredByUserId: varchar('offered_by_user_id', {
      length: 36,
    }).references(() => users.id),
    confirmedByUserId: varchar('confirmed_by_user_id', {
      length: 36,
    }).references(() => users.id),
    offeredAt: timestamp('offered_at').notNull().defaultNow(),
    expiresAt: timestamp('expires_at').notNull(),
    respondedAt: timestamp('responded_at'),
    confirmedAt: timestamp('confirmed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    activeUnique: uniqueIndex('ux_candidate_offers_candidate').on(
      table.candidateId,
    ),
    expiryIndex: index('ix_candidate_offers_expiry').on(
      table.status,
      table.expiresAt,
    ),
  }),
);
