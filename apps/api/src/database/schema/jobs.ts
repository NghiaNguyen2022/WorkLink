import {
  boolean,
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

import { customerLocations, customerProfiles } from './customers';
import { users } from './users';

export const jobCategories = mysqlTable(
  'job_categories',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    code: varchar('code', { length: 80 }).notNull(),
    name: varchar('name', { length: 150 }).notNull(),
    description: varchar('description', { length: 500 }),
    pricingUnit: varchar('pricing_unit', { length: 30 })
      .notNull()
      .default('HOUR'),
    minimumHours: decimal('minimum_hours', {
      precision: 5,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(1),
    baseRate: decimal('base_rate', {
      precision: 12,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    riskLevel: varchar('risk_level', { length: 20 })
      .notNull()
      .default('LOW'),
    matchingMode: varchar('matching_mode', { length: 30 })
      .notNull()
      .default('ASSISTED'),
    requiresVerification: boolean('requires_verification')
      .notNull()
      .default(true),
    requiresTraining: boolean('requires_training')
      .notNull()
      .default(false),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    codeUnique: uniqueIndex('ux_job_categories_code').on(table.code),
    activeIndex: index('ix_job_categories_active').on(table.active),
  }),
);

export const jobs = mysqlTable(
  'jobs',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobCode: varchar('job_code', { length: 30 }).notNull(),
    customerId: varchar('customer_id', { length: 36 })
      .notNull()
      .references(() => customerProfiles.id),
    categoryId: varchar('category_id', { length: 36 })
      .notNull()
      .references(() => jobCategories.id),
    locationId: varchar('location_id', { length: 36 })
      .notNull()
      .references(() => customerLocations.id),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description').notNull(),
    status: varchar('status', { length: 40 })
      .notNull()
      .default('DRAFT'),
    matchingMode: varchar('matching_mode', { length: 30 })
      .notNull()
      .default('ASSISTED'),
    riskLevel: varchar('risk_level', { length: 20 })
      .notNull()
      .default('LOW'),
    headcount: int('headcount').notNull().default(1),
    startAt: timestamp('start_at').notNull(),
    endAt: timestamp('end_at').notNull(),
    breakMinutes: int('break_minutes').notNull().default(0),
    customerBudget: decimal('customer_budget', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }),
    suggestedPrice: decimal('suggested_price', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }),
    agreedPrice: decimal('agreed_price', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }),
    workerPayoutRate: decimal('worker_payout_rate', {
      precision: 5,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(75),
    workerPayoutAmount: decimal('worker_payout_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }),
    platformFeeAmount: decimal('platform_fee_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }),
    dressCode: varchar('dress_code', { length: 255 }),
    toolsProvidedBy: varchar('tools_provided_by', { length: 30 }),
    specialNotes: text('special_notes'),
    publishedAt: timestamp('published_at'),
    verifiedAt: timestamp('verified_at'),
    verifiedByUserId: varchar('verified_by_user_id', { length: 36 }).references(
      () => users.id,
    ),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    jobCodeUnique: uniqueIndex('ux_jobs_job_code').on(table.jobCode),
    customerIndex: index('ix_jobs_customer').on(table.customerId),
    categoryIndex: index('ix_jobs_category').on(table.categoryId),
    statusStartIndex: index('ix_jobs_status_start').on(
      table.status,
      table.startAt,
    ),
  }),
);

export const jobRequirements = mysqlTable(
  'job_requirements',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    requirementType: varchar('requirement_type', { length: 40 }).notNull(),
    requirementCode: varchar('requirement_code', { length: 80 }),
    description: varchar('description', { length: 500 }).notNull(),
    mandatory: boolean('mandatory').notNull().default(true),
    minimumLevel: varchar('minimum_level', { length: 30 }),
    metadata: json('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    jobIndex: index('ix_job_requirements_job').on(table.jobId),
    typeIndex: index('ix_job_requirements_type').on(table.requirementType),
  }),
);

export const pricingQuotes = mysqlTable(
  'pricing_quotes',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    jobId: varchar('job_id', { length: 36 })
      .notNull()
      .references(() => jobs.id, { onDelete: 'cascade' }),
    quoteVersion: int('quote_version').notNull().default(1),
    quoteStatus: varchar('quote_status', { length: 30 })
      .notNull()
      .default('PROPOSED'),
    baseAmount: decimal('base_amount', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    timeSurcharge: decimal('time_surcharge', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    locationSurcharge: decimal('location_surcharge', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    skillSurcharge: decimal('skill_surcharge', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    urgencySurcharge: decimal('urgency_surcharge', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    riskSurcharge: decimal('risk_surcharge', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    retentionFee: decimal('retention_fee', {
      precision: 14,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    customerTotal: decimal('customer_total', {
      precision: 14,
      scale: 2,
      mode: 'number',
    }).notNull(),
    workerPayoutRate: decimal('worker_payout_rate', {
      precision: 5,
      scale: 2,
      mode: 'number',
    }).notNull(),
    workerPayoutAmount: decimal('worker_payout_amount', {
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
    createdByUserId: varchar('created_by_user_id', {
      length: 36,
    }).references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    jobVersionUnique: uniqueIndex('ux_pricing_quotes_job_version').on(
      table.jobId,
      table.quoteVersion,
    ),
    jobIndex: index('ix_pricing_quotes_job').on(table.jobId),
  }),
);
