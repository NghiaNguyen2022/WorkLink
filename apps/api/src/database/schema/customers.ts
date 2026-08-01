import {
  boolean,
  decimal,
  index,
  mysqlTable,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

import { users } from './users';

export const customerProfiles = mysqlTable(
  'customer_profiles',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    userId: varchar('user_id', { length: 36 })
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    customerType: varchar('customer_type', { length: 30 }).notNull(),
    displayName: varchar('display_name', { length: 150 }).notNull(),
    companyName: varchar('company_name', { length: 200 }),
    taxCode: varchar('tax_code', { length: 50 }),
    verificationStatus: varchar('verification_status', { length: 30 })
      .notNull()
      .default('PENDING'),
    rating: decimal('rating', {
      precision: 3,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(5),
    completedJobs: decimal('completed_jobs', {
      precision: 10,
      scale: 0,
      mode: 'number',
    })
      .notNull()
      .default(0),
    isBlocked: boolean('is_blocked').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    userUnique: uniqueIndex('ux_customer_profiles_user').on(table.userId),
    typeIndex: index('ix_customer_profiles_type').on(table.customerType),
    verificationIndex: index('ix_customer_profiles_verification').on(
      table.verificationStatus,
    ),
  }),
);

export const customerLocations = mysqlTable(
  'customer_locations',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    customerId: varchar('customer_id', { length: 36 })
      .notNull()
      .references(() => customerProfiles.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 100 }).notNull(),
    contactName: varchar('contact_name', { length: 150 }).notNull(),
    contactPhone: varchar('contact_phone', { length: 30 }).notNull(),
    addressLine: varchar('address_line', { length: 255 }).notNull(),
    ward: varchar('ward', { length: 100 }),
    district: varchar('district', { length: 100 }).notNull(),
    city: varchar('city', { length: 100 }).notNull(),
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
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    customerIndex: index('ix_customer_locations_customer').on(
      table.customerId,
    ),
    areaIndex: index('ix_customer_locations_area').on(
      table.city,
      table.district,
    ),
  }),
);
