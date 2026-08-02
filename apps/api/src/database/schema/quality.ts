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

import { customerProfiles } from './customers';
import { jobs } from './jobs';
import { reviews } from './operations';
import { users } from './users';
import { workerProfiles } from './workers';

export const reviewMetricUpdates = mysqlTable(
  'review_metric_updates',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    reviewId: varchar('review_id', { length: 36 })
      .notNull()
      .references(() => reviews.id, { onDelete: 'cascade' }),
    targetType: varchar('target_type', { length: 20 }).notNull(),
    targetId: varchar('target_id', { length: 36 }).notNull(),
    scoringVersion: varchar('scoring_version', { length: 30 })
      .notNull()
      .default('QUALITY_V1'),
    beforeSnapshot: json('before_snapshot').$type<Record<string, unknown>>(),
    afterSnapshot: json('after_snapshot').$type<Record<string, unknown>>(),
    processedAt: timestamp('processed_at').notNull().defaultNow(),
  },
  (table) => ({
    reviewUnique: uniqueIndex('ux_review_metric_updates_review').on(
      table.reviewId,
    ),
    targetIndex: index('ix_review_metric_updates_target').on(
      table.targetType,
      table.targetId,
    ),
  }),
);

export const customerQualityMetrics = mysqlTable(
  'customer_quality_metrics',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    customerId: varchar('customer_id', { length: 36 })
      .notNull()
      .references(() => customerProfiles.id, { onDelete: 'cascade' }),
    rating: decimal('rating', {
      precision: 3,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(5),
    completedJobs: int('completed_jobs').notNull().default(0),
    reviewCount: int('review_count').notNull().default(0),
    safetyScore: decimal('safety_score', {
      precision: 5,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(100),
    workConditionScore: decimal('work_condition_score', {
      precision: 5,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(100),
    riskLevel: varchar('risk_level', { length: 20 })
      .notNull()
      .default('LOW'),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    customerUnique: uniqueIndex('ux_customer_quality_customer').on(
      table.customerId,
    ),
    riskIndex: index('ix_customer_quality_risk').on(table.riskLevel),
  }),
);

export const relationshipPreferences = mysqlTable(
  'relationship_preferences',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    customerId: varchar('customer_id', { length: 36 })
      .notNull()
      .references(() => customerProfiles.id, { onDelete: 'cascade' }),
    workerId: varchar('worker_id', { length: 36 })
      .notNull()
      .references(() => workerProfiles.id, { onDelete: 'cascade' }),
    setByParty: varchar('set_by_party', { length: 20 }).notNull(),
    preferenceType: varchar('preference_type', { length: 20 })
      .notNull()
      .default('NEUTRAL'),
    reason: varchar('reason', { length: 500 }),
    sourceJobId: varchar('source_job_id', { length: 36 }).references(
      () => jobs.id,
    ),
    active: int('active').notNull().default(1),
    createdByUserId: varchar('created_by_user_id', {
      length: 36,
    })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    partyUnique: uniqueIndex('ux_relationship_party').on(
      table.customerId,
      table.workerId,
      table.setByParty,
    ),
    matchingIndex: index('ix_relationship_matching').on(
      table.customerId,
      table.workerId,
      table.preferenceType,
      table.active,
    ),
  }),
);

export const rehireLinks = mysqlTable(
  'rehire_links',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    sourceJobId: varchar('source_job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id),
    newJobId: varchar('new_job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id),
    preferredWorkerId: varchar('preferred_worker_id', {
      length: 36,
    }).references(() => workerProfiles.id),
    requestedByUserId: varchar('requested_by_user_id', {
      length: 36,
    })
      .notNull()
      .references(() => users.id),
    inheritedFields: json('inherited_fields').$type<string[]>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    newJobUnique: uniqueIndex('ux_rehire_links_new_job').on(
      table.newJobId,
    ),
    sourceIndex: index('ix_rehire_links_source').on(
      table.sourceJobId,
    ),
  }),
);
