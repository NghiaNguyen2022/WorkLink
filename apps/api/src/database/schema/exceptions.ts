import {
  decimal,
  index,
  json,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import {
  assignments,
  payments,
  supportCases,
} from './operations';
import { jobs } from './jobs';
import { users } from './users';
import { workerProfiles } from './workers';

export const cancellationAssessments = mysqlTable(
  'cancellation_assessments',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id),
    assignmentId: varchar('assignment_id', {
      length: 36,
    }).references(() => assignments.id),
    eventType: varchar('event_type', { length: 30 }).notNull(),
    cancelledByParty: varchar('cancelled_by_party', {
      length: 20,
    }).notNull(),
    minutesBeforeStart: decimal('minutes_before_start', {
      precision: 12,
      scale: 2,
      mode: 'number',
    }).notNull(),
    policyVersion: varchar('policy_version', {
      length: 30,
    }).notNull(),
    customerFeeAmount: decimal('customer_fee_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    workerCompensationAmount: decimal(
      'worker_compensation_amount',
      {
        precision: 14,
        scale: 2,
        mode: 'number',
      },
    )
      .notNull()
      .default(0),
    platformFeeAmount: decimal('platform_fee_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('ASSESSED'),
    reason: varchar('reason', { length: 500 }).notNull(),
    calculationDetails: json('calculation_details').$type<
      Record<string, unknown>
    >(),
    assessedByUserId: varchar('assessed_by_user_id', {
      length: 36,
    })
      .notNull()
      .references(() => users.id),
    approvedByUserId: varchar('approved_by_user_id', {
      length: 36,
    }).references(() => users.id),
    assessedAt: timestamp('assessed_at').notNull().defaultNow(),
    approvedAt: timestamp('approved_at'),
  },
  (table) => ({
    assignmentUnique: uniqueIndex(
      'ux_cancellation_assessment_assignment',
    ).on(table.assignmentId, table.eventType),
    jobIndex: index('ix_cancellation_assessments_job').on(
      table.jobId,
    ),
  }),
);

export const replacementRequests = mysqlTable(
  'replacement_requests',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id),
    originalAssignmentId: varchar(
      'original_assignment_id',
      { length: 36 },
    )
      .notNull()
      .references(() => assignments.id),
    replacementWorkerId: varchar('replacement_worker_id', {
      length: 36,
    }).references(() => workerProfiles.id),
    replacementAssignmentId: varchar(
      'replacement_assignment_id',
      { length: 36 },
    ).references(() => assignments.id),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('OPEN'),
    priority: varchar('priority', { length: 20 })
      .notNull()
      .default('HIGH'),
    reason: varchar('reason', { length: 500 }).notNull(),
    requestedByUserId: varchar('requested_by_user_id', {
      length: 36,
    })
      .notNull()
      .references(() => users.id),
    assignedByUserId: varchar('assigned_by_user_id', {
      length: 36,
    }).references(() => users.id),
    requestedAt: timestamp('requested_at').notNull().defaultNow(),
    fulfilledAt: timestamp('fulfilled_at'),
    cancelledAt: timestamp('cancelled_at'),
  },
  (table) => ({
    originalUnique: uniqueIndex(
      'ux_replacement_requests_original_open',
    ).on(table.originalAssignmentId, table.status),
    jobIndex: index('ix_replacement_requests_job').on(
      table.jobId,
      table.status,
    ),
  }),
);

export const disputeEvents = mysqlTable(
  'dispute_events',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    supportCaseId: varchar('support_case_id', { length: 36 })
      .notNull()
      .references(() => supportCases.id, {
        onDelete: 'cascade',
      }),
    eventType: varchar('event_type', { length: 40 }).notNull(),
    fromStatus: varchar('from_status', { length: 30 }),
    toStatus: varchar('to_status', { length: 30 }),
    note: text('note').notNull(),
    evidence: json('evidence').$type<
      Array<{ type: string; url: string }>
    >(),
    actorUserId: varchar('actor_user_id', {
      length: 36,
    })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    caseIndex: index('ix_dispute_events_case').on(
      table.supportCaseId,
    ),
  }),
);

export const financialAdjustments = mysqlTable(
  'financial_adjustments',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    supportCaseId: varchar('support_case_id', { length: 36 })
      .notNull()
      .references(() => supportCases.id),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id),
    originalPaymentId: varchar('original_payment_id', {
      length: 36,
    }).references(() => payments.id),
    generatedPaymentId: varchar('generated_payment_id', {
      length: 36,
    }).references(() => payments.id),
    adjustmentType: varchar('adjustment_type', {
      length: 30,
    }).notNull(),
    amount: decimal('amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    currency: varchar('currency', { length: 10 })
      .notNull()
      .default('VND'),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('PROPOSED'),
    reason: varchar('reason', { length: 500 }).notNull(),
    proposedByUserId: varchar('proposed_by_user_id', {
      length: 36,
    })
      .notNull()
      .references(() => users.id),
    approvedByUserId: varchar('approved_by_user_id', {
      length: 36,
    }).references(() => users.id),
    proposedAt: timestamp('proposed_at').notNull().defaultNow(),
    approvedAt: timestamp('approved_at'),
  },
  (table) => ({
    caseIndex: index('ix_financial_adjustments_case').on(
      table.supportCaseId,
      table.status,
    ),
  }),
);
