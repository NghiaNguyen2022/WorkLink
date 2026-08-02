import {
  decimal,
  index,
  json,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';

import {
  assignments,
  workSessions,
} from './operations';
import { users } from './users';

export const assignmentEvents = mysqlTable(
  'assignment_events',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    assignmentId: varchar('assignment_id', { length: 36 })
      .notNull()
      .references(() => assignments.id, {
        onDelete: 'cascade',
      }),
    eventType: varchar('event_type', { length: 50 }).notNull(),
    fromStatus: varchar('from_status', { length: 30 }),
    toStatus: varchar('to_status', { length: 30 }),
    actorUserId: varchar('actor_user_id', {
      length: 36,
    }).references(() => users.id),
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
    note: varchar('note', { length: 500 }),
    metadata: json('metadata').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    assignmentIndex: index('ix_assignment_events_assignment').on(
      table.assignmentId,
    ),
    eventIndex: index('ix_assignment_events_type').on(
      table.eventType,
    ),
  }),
);

export const workIncidents = mysqlTable(
  'work_incidents',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    assignmentId: varchar('assignment_id', { length: 36 })
      .notNull()
      .references(() => assignments.id, {
        onDelete: 'cascade',
      }),
    workSessionId: varchar('work_session_id', {
      length: 36,
    }).references(() => workSessions.id, {
      onDelete: 'set null',
    }),
    incidentType: varchar('incident_type', {
      length: 40,
    }).notNull(),
    severity: varchar('severity', { length: 20 })
      .notNull()
      .default('NORMAL'),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('OPEN'),
    description: text('description').notNull(),
    evidence: json('evidence').$type<
      Array<{ type: string; url: string }>
    >(),
    reportedByUserId: varchar('reported_by_user_id', {
      length: 36,
    })
      .notNull()
      .references(() => users.id),
    assignedToUserId: varchar('assigned_to_user_id', {
      length: 36,
    }).references(() => users.id),
    resolution: text('resolution'),
    resolvedAt: timestamp('resolved_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    assignmentIndex: index('ix_work_incidents_assignment').on(
      table.assignmentId,
    ),
    queueIndex: index('ix_work_incidents_queue').on(
      table.status,
      table.severity,
    ),
  }),
);
