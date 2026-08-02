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
import {
  assignments,
  payments,
} from './operations';
import { users } from './users';
import { workerProfiles } from './workers';

export const settlements = mysqlTable(
  'settlements',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    settlementCode: varchar('settlement_code', {
      length: 30,
    }).notNull(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('DRAFT'),
    currency: varchar('currency', { length: 10 })
      .notNull()
      .default('VND'),
    customerBaseAmount: decimal('customer_base_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    customerAdjustmentAmount: decimal(
      'customer_adjustment_amount',
      {
        precision: 14,
        scale: 2,
        mode: 'number',
      },
    )
      .notNull()
      .default(0),
    customerTotalAmount: decimal('customer_total_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    workerBaseAmount: decimal('worker_base_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    workerOvertimeAmount: decimal('worker_overtime_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    workerAdjustmentAmount: decimal(
      'worker_adjustment_amount',
      {
        precision: 14,
        scale: 2,
        mode: 'number',
      },
    )
      .notNull()
      .default(0),
    retentionAmount: decimal('retention_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    workerPayableAmount: decimal('worker_payable_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    platformFeeAmount: decimal('platform_fee_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    calculationDetails: json('calculation_details').$type<
      Record<string, unknown>
    >(),
    preparedByUserId: varchar('prepared_by_user_id', {
      length: 36,
    }).references(() => users.id),
    approvedByUserId: varchar('approved_by_user_id', {
      length: 36,
    }).references(() => users.id),
    preparedAt: timestamp('prepared_at').notNull().defaultNow(),
    approvedAt: timestamp('approved_at'),
    settledAt: timestamp('settled_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    codeUnique: uniqueIndex('ux_settlements_code').on(
      table.settlementCode,
    ),
    jobUnique: uniqueIndex('ux_settlements_job').on(table.jobId),
    statusIndex: index('ix_settlements_status').on(table.status),
  }),
);

export const settlementLines = mysqlTable(
  'settlement_lines',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    settlementId: varchar('settlement_id', { length: 36 })
      .notNull()
      .references(() => settlements.id, {
        onDelete: 'cascade',
      }),
    assignmentId: varchar('assignment_id', {
      length: 36,
    }).references(() => assignments.id),
    workerId: varchar('worker_id', { length: 36 }).references(
      () => workerProfiles.id,
    ),
    lineType: varchar('line_type', { length: 40 }).notNull(),
    description: varchar('description', {
      length: 500,
    }).notNull(),
    quantity: decimal('quantity', {
      precision: 12,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(1),
    unitAmount: decimal('unit_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    amount: decimal('amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    direction: varchar('direction', {
      length: 20,
    }).notNull(),
    metadata: json('metadata').$type<Record<string, unknown>>(),
    createdByUserId: varchar('created_by_user_id', {
      length: 36,
    }).references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    settlementIndex: index('ix_settlement_lines_settlement').on(
      table.settlementId,
    ),
    workerIndex: index('ix_settlement_lines_worker').on(
      table.workerId,
    ),
  }),
);

export const paymentEvents = mysqlTable(
  'payment_events',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    paymentId: varchar('payment_id', { length: 36 })
      .notNull()
      .references(() => payments.id, {
        onDelete: 'cascade',
      }),
    eventType: varchar('event_type', {
      length: 40,
    }).notNull(),
    fromStatus: varchar('from_status', { length: 30 }),
    toStatus: varchar('to_status', { length: 30 }),
    providerReference: varchar('provider_reference', {
      length: 150,
    }),
    note: text('note'),
    actorUserId: varchar('actor_user_id', {
      length: 36,
    }).references(() => users.id),
    metadata: json('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    paymentIndex: index('ix_payment_events_payment').on(
      table.paymentId,
    ),
  }),
);
