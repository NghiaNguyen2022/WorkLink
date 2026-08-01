import {
  decimal,
  index,
  int,
  json,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import { jobs } from './jobs';
import { users } from './users';
import { workerProfiles } from './workers';

export const jobCandidates = mysqlTable(
  'job_candidates',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    workerId: varchar('worker_id', { length: 36 })
      .notNull()
      .references(() => workerProfiles.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('PROPOSED'),
    rankOrder: int('rank_order'),
    totalScore: decimal('total_score', {
      precision: 6,
      scale: 2,
      mode: 'number',
    }),
    scoreBreakdown: json('score_breakdown').$type<Record<string, number>>(),
    reasons: json('reasons').$type<string[]>(),
    warnings: json('warnings').$type<string[]>(),
    proposedPayout: decimal('proposed_payout', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }),
    respondedAt: timestamp('responded_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    jobWorkerUnique: uniqueIndex('ux_job_candidates_job_worker').on(
      table.jobId,
      table.workerId,
    ),
    jobStatusIndex: index('ix_job_candidates_job_status').on(
      table.jobId,
      table.status,
    ),
  }),
);

export const assignments = mysqlTable(
  'assignments',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id),
    workerId: varchar('worker_id', { length: 36 })
      .notNull()
      .references(() => workerProfiles.id),
    candidateId: varchar('candidate_id', { length: 36 }).references(
      () => jobCandidates.id,
    ),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('CONFIRMED'),
    agreedPayout: decimal('agreed_payout', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    retentionAmount: decimal('retention_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    confirmedAt: timestamp('confirmed_at').notNull().defaultNow(),
    cancelledAt: timestamp('cancelled_at'),
    cancellationReason: varchar('cancellation_reason', { length: 500 }),
    replacementForAssignmentId: varchar('replacement_for_assignment_id', {
      length: 36,
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    jobWorkerUnique: uniqueIndex('ux_assignments_job_worker').on(
      table.jobId,
      table.workerId,
    ),
    statusIndex: index('ix_assignments_status').on(table.status),
  }),
);

export const workSessions = mysqlTable(
  'work_sessions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    assignmentId: varchar('assignment_id', { length: 36 })
      .notNull()
      .references(() => assignments.id, { onDelete: 'cascade' }),
    checkInAt: timestamp('check_in_at'),
    checkInLatitude: decimal('check_in_latitude', {
      precision: 10,
      scale: 7,
      mode: 'number',
    }),
    checkInLongitude: decimal('check_in_longitude', {
      precision: 10,
      scale: 7,
      mode: 'number',
    }),
    checkInMethod: varchar('check_in_method', { length: 30 }),
    checkOutAt: timestamp('check_out_at'),
    checkOutLatitude: decimal('check_out_latitude', {
      precision: 10,
      scale: 7,
      mode: 'number',
    }),
    checkOutLongitude: decimal('check_out_longitude', {
      precision: 10,
      scale: 7,
      mode: 'number',
    }),
    checkOutMethod: varchar('check_out_method', { length: 30 }),
    actualMinutes: int('actual_minutes'),
    overtimeMinutes: int('overtime_minutes').notNull().default(0),
    evidence: json('evidence').$type<
      Array<{ type: string; url: string }>
    >(),
    customerConfirmedAt: timestamp('customer_confirmed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    assignmentUnique: uniqueIndex('ux_work_sessions_assignment').on(
      table.assignmentId,
    ),
  }),
);

export const payments = mysqlTable(
  'payments',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id),
    assignmentId: varchar('assignment_id', { length: 36 }).references(
      () => assignments.id,
    ),
    paymentType: varchar('payment_type', { length: 30 }).notNull(),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('PENDING'),
    amount: decimal('amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    currency: varchar('currency', { length: 10 })
      .notNull()
      .default('VND'),
    provider: varchar('provider', { length: 50 }),
    providerReference: varchar('provider_reference', { length: 150 }),
    paidAt: timestamp('paid_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    jobIndex: index('ix_payments_job').on(table.jobId),
    statusIndex: index('ix_payments_status').on(table.status),
  }),
);

export const reviews = mysqlTable(
  'reviews',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id),
    assignmentId: varchar('assignment_id', { length: 36 }).references(
      () => assignments.id,
    ),
    reviewerUserId: varchar('reviewer_user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    revieweeUserId: varchar('reviewee_user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    reviewerType: varchar('reviewer_type', { length: 20 }).notNull(),
    overallRating: int('overall_rating').notNull(),
    criteria: json('criteria').$type<Record<string, number>>(),
    comment: text('comment'),
    wouldHireAgain: int('would_hire_again'),
    status: varchar('status', { length: 20 })
      .notNull()
      .default('PUBLISHED'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    reviewerUnique: uniqueIndex('ux_reviews_job_reviewer').on(
      table.jobId,
      table.reviewerUserId,
    ),
  }),
);

export const supportCases = mysqlTable(
  'support_cases',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    caseCode: varchar('case_code', { length: 30 }).notNull(),
    jobId: varchar('job_id', { length: 36 }).references(() => jobs.id),
    openedByUserId: varchar('opened_by_user_id', { length: 36 })
      .notNull()
      .references(() => users.id),
    assignedToUserId: varchar('assigned_to_user_id', {
      length: 36,
    }).references(() => users.id),
    caseType: varchar('case_type', { length: 40 }).notNull(),
    priority: varchar('priority', { length: 20 })
      .notNull()
      .default('NORMAL'),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('OPEN'),
    subject: varchar('subject', { length: 200 }).notNull(),
    description: text('description').notNull(),
    resolution: text('resolution'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    resolvedAt: timestamp('resolved_at'),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    caseCodeUnique: uniqueIndex('ux_support_cases_code').on(table.caseCode),
    queueIndex: index('ix_support_cases_queue').on(
      table.status,
      table.priority,
    ),
  }),
);

export const auditLogs = mysqlTable(
  'audit_logs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    actorUserId: varchar('actor_user_id', { length: 36 }).references(
      () => users.id,
    ),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 80 }).notNull(),
    entityId: varchar('entity_id', { length: 36 }),
    beforeData: json('before_data').$type<Record<string, unknown>>(),
    afterData: json('after_data').$type<Record<string, unknown>>(),
    ipAddress: varchar('ip_address', { length: 45 }),
    userAgent: varchar('user_agent', { length: 500 }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    entityIndex: index('ix_audit_logs_entity').on(
      table.entityType,
      table.entityId,
    ),
    actorIndex: index('ix_audit_logs_actor').on(table.actorUserId),
  }),
);
