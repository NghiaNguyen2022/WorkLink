CREATE TABLE IF NOT EXISTS training_courses (
  id VARCHAR(36) PRIMARY KEY,
  course_code VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NULL,
  skill_code VARCHAR(80) NULL,
  certification_code VARCHAR(80) NULL,
  delivery_mode VARCHAR(30) NOT NULL DEFAULT 'ONLINE',
  duration_minutes INT NOT NULL DEFAULT 60,
  passing_score DECIMAL(5,2) NOT NULL DEFAULT 70,
  certificate_validity_days INT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  metadata JSON NULL,
  created_by_user_id VARCHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_training_courses_code (course_code),
  KEY ix_training_courses_certification (
    certification_code,
    active
  ),
  CONSTRAINT fk_training_courses_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_enrollments (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL,
  worker_id VARCHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ENROLLED',
  progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  enrolled_by_user_id VARCHAR(36) NULL,
  enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_course_enrollments_course_worker (
    course_id,
    worker_id
  ),
  KEY ix_course_enrollments_worker (worker_id, status),
  CONSTRAINT fk_course_enrollments_course
    FOREIGN KEY (course_id)
    REFERENCES training_courses(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_course_enrollments_worker
    FOREIGN KEY (worker_id)
    REFERENCES worker_profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_course_enrollments_enrolled_by
    FOREIGN KEY (enrolled_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_assessments (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  time_limit_minutes INT NULL,
  maximum_attempts INT NOT NULL DEFAULT 3,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_course_assessments_course (course_id, active),
  CONSTRAINT fk_course_assessments_course
    FOREIGN KEY (course_id)
    REFERENCES training_courses(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assessment_questions (
  id VARCHAR(36) PRIMARY KEY,
  assessment_id VARCHAR(36) NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(30) NOT NULL DEFAULT 'SINGLE_CHOICE',
  options JSON NULL,
  correct_answers JSON NULL,
  weight DECIMAL(8,2) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_assessment_questions_assessment (
    assessment_id,
    sort_order
  ),
  CONSTRAINT fk_assessment_questions_assessment
    FOREIGN KEY (assessment_id)
    REFERENCES course_assessments(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id VARCHAR(36) PRIMARY KEY,
  assessment_id VARCHAR(36) NOT NULL,
  enrollment_id VARCHAR(36) NOT NULL,
  worker_id VARCHAR(36) NOT NULL,
  attempt_number INT NOT NULL,
  answers JSON NULL,
  score DECIMAL(5,2) NULL,
  passed BOOLEAN NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMP NULL,
  graded_at TIMESTAMP NULL,
  UNIQUE KEY ux_assessment_attempt_number (
    assessment_id,
    worker_id,
    attempt_number
  ),
  KEY ix_assessment_attempts_worker (worker_id, passed),
  CONSTRAINT fk_assessment_attempt_assessment
    FOREIGN KEY (assessment_id) REFERENCES course_assessments(id),
  CONSTRAINT fk_assessment_attempt_enrollment
    FOREIGN KEY (enrollment_id) REFERENCES course_enrollments(id),
  CONSTRAINT fk_assessment_attempt_worker
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS worker_certificates (
  id VARCHAR(36) PRIMARY KEY,
  certificate_code VARCHAR(80) NOT NULL,
  worker_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NULL,
  assessment_attempt_id VARCHAR(36) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  certificate_number VARCHAR(60) NOT NULL,
  issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATE NULL,
  revoked_at TIMESTAMP NULL,
  revocation_reason VARCHAR(500) NULL,
  issued_by_user_id VARCHAR(36) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_worker_certificates_number (certificate_number),
  KEY ix_worker_certificates_worker_code (
    worker_id,
    certificate_code,
    status
  ),
  CONSTRAINT fk_worker_certificates_worker
    FOREIGN KEY (worker_id)
    REFERENCES worker_profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_worker_certificates_course
    FOREIGN KEY (course_id) REFERENCES training_courses(id),
  CONSTRAINT fk_worker_certificates_attempt
    FOREIGN KEY (assessment_attempt_id)
    REFERENCES assessment_attempts(id),
  CONSTRAINT fk_worker_certificates_issued_by
    FOREIGN KEY (issued_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS worker_badges (
  id VARCHAR(36) PRIMARY KEY,
  worker_id VARCHAR(36) NOT NULL,
  badge_code VARCHAR(80) NOT NULL,
  badge_name VARCHAR(150) NOT NULL,
  source_type VARCHAR(30) NOT NULL DEFAULT 'CERTIFICATE',
  source_id VARCHAR(36) NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATE NULL,
  UNIQUE KEY ux_worker_badges_source (
    worker_id,
    badge_code,
    source_id
  ),
  CONSTRAINT fk_worker_badges_worker
    FOREIGN KEY (worker_id)
    REFERENCES worker_profiles(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
