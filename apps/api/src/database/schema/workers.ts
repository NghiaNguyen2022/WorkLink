import {
  boolean,
  date,
  decimal,
  index,
  int,
  json,
  mysqlTable,
  time,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import { users } from './users';

export const workerProfiles = mysqlTable(
  'worker_profiles',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    dateOfBirth: date('date_of_birth'),
    gender: varchar('gender', { length: 20 }),
    identityNumber: varchar('identity_number', { length: 50 }),
    verificationLevel: varchar('verification_level', { length: 10 })
      .notNull()
      .default('V0'),
    verificationStatus: varchar('verification_status', { length: 30 })
      .notNull()
      .default('PENDING'),
    biography: varchar('biography', { length: 500 }),
    currentAddress: varchar('current_address', { length: 255 }),
    currentDistrict: varchar('current_district', { length: 100 }),
    currentCity: varchar('current_city', { length: 100 }),
    latitude: decimal('latitude', {
      precision: 10,
      scale: 7,
      mode: 'number',
    }),
    longitude: decimal('longitude', {
      precision: 10,
      scale: 7,
      mode: 'number',
    }),
    transportType: varchar('transport_type', { length: 30 }),
    maxTravelKm: int('max_travel_km').notNull().default(10),
    minimumHourlyRate: decimal('minimum_hourly_rate', {
      precision: 12,
      scale: 2,
      mode: 'number',
    }),
    rating: decimal('rating', {
      precision: 3,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(5),
    completedJobs: int('completed_jobs').notNull().default(0),
    cancellationRate: decimal('cancellation_rate', {
      precision: 5,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    onTimeRate: decimal('on_time_rate', {
      precision: 5,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(100),
    available: boolean('available').notNull().default(true),
    isSuspended: boolean('is_suspended').notNull().default(false),
    emergencyContactName: varchar('emergency_contact_name', {
      length: 150,
    }),
    emergencyContactPhone: varchar('emergency_contact_phone', {
      length: 30,
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    userUnique: uniqueIndex('ux_worker_profiles_user').on(table.userId),
    identityUnique: uniqueIndex('ux_worker_profiles_identity').on(
      table.identityNumber,
    ),
    availabilityIndex: index('ix_worker_profiles_availability').on(
      table.available,
      table.isSuspended,
    ),
    areaIndex: index('ix_worker_profiles_area').on(
      table.currentCity,
      table.currentDistrict,
    ),
  }),
);

export const workerSkills = mysqlTable(
  'worker_skills',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    workerId: varchar('worker_id', { length: 36 })
      .notNull()
      .references(() => workerProfiles.id, { onDelete: 'cascade' }),
    skillCode: varchar('skill_code', { length: 80 }).notNull(),
    skillName: varchar('skill_name', { length: 150 }).notNull(),
    proficiencyLevel: varchar('proficiency_level', { length: 30 })
      .notNull()
      .default('BASIC'),
    verificationStatus: varchar('verification_status', { length: 30 })
      .notNull()
      .default('SELF_DECLARED'),
    verifiedAt: timestamp('verified_at'),
    certificateName: varchar('certificate_name', { length: 200 }),
    certificateExpiresAt: date('certificate_expires_at'),
    completedJobs: int('completed_jobs').notNull().default(0),
    averageRating: decimal('average_rating', {
      precision: 3,
      scale: 2,
      mode: 'number',
    }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    workerSkillUnique: uniqueIndex('ux_worker_skills_worker_code').on(
      table.workerId,
      table.skillCode,
    ),
    skillIndex: index('ix_worker_skills_code_status').on(
      table.skillCode,
      table.verificationStatus,
    ),
  }),
);

export const workerAvailability = mysqlTable(
  'worker_availability',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    workerId: varchar('worker_id', { length: 36 })
      .notNull()
      .references(() => workerProfiles.id, { onDelete: 'cascade' }),
    availabilityType: varchar('availability_type', { length: 30 })
      .notNull()
      .default('ONE_TIME'),
    dayOfWeek: int('day_of_week'),
    specificDate: date('specific_date'),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    serviceAreas: json('service_areas').$type<string[]>(),
    isAvailable: boolean('is_available').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    workerIndex: index('ix_worker_availability_worker').on(table.workerId),
    dateIndex: index('ix_worker_availability_date').on(
      table.specificDate,
      table.dayOfWeek,
    ),
  }),
);
