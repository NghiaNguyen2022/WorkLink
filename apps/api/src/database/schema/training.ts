import {
  boolean,
  date,
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

import { users } from './users';
import { workerProfiles } from './workers';

export const trainingCourses = mysqlTable(
  'training_courses',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    courseCode: varchar('course_code', { length: 50 }).notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    description: text('description'),
    skillCode: varchar('skill_code', { length: 80 }),
    certificationCode: varchar('certification_code', {
      length: 80,
    }),
    deliveryMode: varchar('delivery_mode', {
      length: 30,
    })
      .notNull()
      .default('ONLINE'),
    durationMinutes: int('duration_minutes')
      .notNull()
      .default(60),
    passingScore: decimal('passing_score', {
      precision: 5,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(70),
    certificateValidityDays: int(
      'certificate_validity_days',
    ),
    active: boolean('active').notNull().default(true),
    metadata: json('metadata').$type<
      Record<string, unknown>
    >(),
    createdByUserId: varchar('created_by_user_id', {
      length: 36,
    }).references(() => users.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    codeUnique: uniqueIndex('ux_training_courses_code').on(
      table.courseCode,
    ),
    certificationIndex: index(
      'ix_training_courses_certification',
    ).on(table.certificationCode, table.active),
  }),
);

export const courseEnrollments = mysqlTable(
  'course_enrollments',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    courseId: varchar('course_id', { length: 36 })
      .notNull()
      .references(() => trainingCourses.id, {
        onDelete: 'cascade',
      }),
    workerId: varchar('worker_id', { length: 36 })
      .notNull()
      .references(() => workerProfiles.id, {
        onDelete: 'cascade',
      }),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('ENROLLED'),
    progressPercent: decimal('progress_percent', {
      precision: 5,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(0),
    enrolledByUserId: varchar('enrolled_by_user_id', {
      length: 36,
    }).references(() => users.id),
    enrolledAt: timestamp('enrolled_at').notNull().defaultNow(),
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    uniqueEnrollment: uniqueIndex(
      'ux_course_enrollments_course_worker',
    ).on(table.courseId, table.workerId),
    workerIndex: index('ix_course_enrollments_worker').on(
      table.workerId,
      table.status,
    ),
  }),
);

export const courseAssessments = mysqlTable(
  'course_assessments',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    courseId: varchar('course_id', { length: 36 })
      .notNull()
      .references(() => trainingCourses.id, {
        onDelete: 'cascade',
      }),
    title: varchar('title', { length: 200 }).notNull(),
    timeLimitMinutes: int('time_limit_minutes'),
    maximumAttempts: int('maximum_attempts')
      .notNull()
      .default(3),
    active: boolean('active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    courseIndex: index('ix_course_assessments_course').on(
      table.courseId,
      table.active,
    ),
  }),
);

export const assessmentQuestions = mysqlTable(
  'assessment_questions',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    assessmentId: varchar('assessment_id', { length: 36 })
      .notNull()
      .references(() => courseAssessments.id, {
        onDelete: 'cascade',
      }),
    questionText: text('question_text').notNull(),
    questionType: varchar('question_type', { length: 30 })
      .notNull()
      .default('SINGLE_CHOICE'),
    options: json('options').$type<
      Array<{ code: string; label: string }>
    >(),
    correctAnswers: json('correct_answers').$type<string[]>(),
    weight: decimal('weight', {
      precision: 8,
      scale: 2,
      mode: 'number',
    })
      .notNull()
      .default(1),
    sortOrder: int('sort_order').notNull().default(0),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    assessmentIndex: index(
      'ix_assessment_questions_assessment',
    ).on(table.assessmentId, table.sortOrder),
  }),
);

export const assessmentAttempts = mysqlTable(
  'assessment_attempts',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    assessmentId: varchar('assessment_id', { length: 36 })
      .notNull()
      .references(() => courseAssessments.id),
    enrollmentId: varchar('enrollment_id', { length: 36 })
      .notNull()
      .references(() => courseEnrollments.id),
    workerId: varchar('worker_id', { length: 36 })
      .notNull()
      .references(() => workerProfiles.id),
    attemptNumber: int('attempt_number').notNull(),
    answers: json('answers').$type<
      Record<string, string[]>
    >(),
    score: decimal('score', {
      precision: 5,
      scale: 2,
      mode: 'number',
    }),
    passed: boolean('passed'),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('SUBMITTED'),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    submittedAt: timestamp('submitted_at'),
    gradedAt: timestamp('graded_at'),
  },
  (table) => ({
    attemptUnique: uniqueIndex(
      'ux_assessment_attempt_number',
    ).on(table.assessmentId, table.workerId, table.attemptNumber),
    workerIndex: index('ix_assessment_attempts_worker').on(
      table.workerId,
      table.passed,
    ),
  }),
);

export const workerCertificates = mysqlTable(
  'worker_certificates',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    certificateCode: varchar('certificate_code', {
      length: 80,
    }).notNull(),
    workerId: varchar('worker_id', { length: 36 })
      .notNull()
      .references(() => workerProfiles.id, {
        onDelete: 'cascade',
      }),
    courseId: varchar('course_id', { length: 36 }).references(
      () => trainingCourses.id,
    ),
    assessmentAttemptId: varchar(
      'assessment_attempt_id',
      { length: 36 },
    ).references(() => assessmentAttempts.id),
    status: varchar('status', { length: 30 })
      .notNull()
      .default('ACTIVE'),
    certificateNumber: varchar('certificate_number', {
      length: 60,
    }).notNull(),
    issuedAt: timestamp('issued_at').notNull().defaultNow(),
    expiresAt: date('expires_at'),
    revokedAt: timestamp('revoked_at'),
    revocationReason: varchar('revocation_reason', {
      length: 500,
    }),
    issuedByUserId: varchar('issued_by_user_id', {
      length: 36,
    }).references(() => users.id),
    metadata: json('metadata').$type<
      Record<string, unknown>
    >(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .onUpdateNow(),
  },
  (table) => ({
    numberUnique: uniqueIndex(
      'ux_worker_certificates_number',
    ).on(table.certificateNumber),
    workerCertificateIndex: index(
      'ix_worker_certificates_worker_code',
    ).on(table.workerId, table.certificateCode, table.status),
  }),
);

export const workerBadges = mysqlTable(
  'worker_badges',
  {
    id: varchar('id', { length: 36 }).primaryKey(),
    workerId: varchar('worker_id', { length: 36 })
      .notNull()
      .references(() => workerProfiles.id, {
        onDelete: 'cascade',
      }),
    badgeCode: varchar('badge_code', { length: 80 }).notNull(),
    badgeName: varchar('badge_name', { length: 150 }).notNull(),
    sourceType: varchar('source_type', { length: 30 })
      .notNull()
      .default('CERTIFICATE'),
    sourceId: varchar('source_id', { length: 36 }),
    active: boolean('active').notNull().default(true),
    awardedAt: timestamp('awarded_at').notNull().defaultNow(),
    expiresAt: date('expires_at'),
  },
  (table) => ({
    badgeUnique: uniqueIndex('ux_worker_badges_source').on(
      table.workerId,
      table.badgeCode,
      table.sourceId,
    ),
  }),
);
