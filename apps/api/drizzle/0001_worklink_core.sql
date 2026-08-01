SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NULL,
  role VARCHAR(30) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_users_email (email),
  KEY ix_users_phone (phone),
  KEY ix_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  customer_type VARCHAR(30) NOT NULL,
  display_name VARCHAR(150) NOT NULL,
  company_name VARCHAR(200) NULL,
  tax_code VARCHAR(50) NULL,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  rating DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  completed_jobs INT NOT NULL DEFAULT 0,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_customer_profiles_user (user_id),
  KEY ix_customer_profiles_type (customer_type),
  KEY ix_customer_profiles_verification (verification_status),
  CONSTRAINT fk_customer_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_locations (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  label VARCHAR(100) NOT NULL,
  contact_name VARCHAR(150) NOT NULL,
  contact_phone VARCHAR(30) NOT NULL,
  address_line VARCHAR(255) NOT NULL,
  ward VARCHAR(100) NULL,
  district VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_customer_locations_customer (customer_id),
  KEY ix_customer_locations_area (city, district),
  CONSTRAINT fk_customer_locations_customer
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS worker_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  date_of_birth DATE NULL,
  gender VARCHAR(20) NULL,
  identity_number VARCHAR(50) NULL,
  verification_level VARCHAR(10) NOT NULL DEFAULT 'V0',
  verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  biography VARCHAR(500) NULL,
  current_address VARCHAR(255) NULL,
  current_district VARCHAR(100) NULL,
  current_city VARCHAR(100) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  transport_type VARCHAR(30) NULL,
  max_travel_km INT NOT NULL DEFAULT 10,
  minimum_hourly_rate DECIMAL(12,2) NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  completed_jobs INT NOT NULL DEFAULT 0,
  cancellation_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  on_time_rate DECIMAL(5,2) NOT NULL DEFAULT 100.00,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  emergency_contact_name VARCHAR(150) NULL,
  emergency_contact_phone VARCHAR(30) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_worker_profiles_user (user_id),
  UNIQUE KEY ux_worker_profiles_identity (identity_number),
  KEY ix_worker_profiles_availability (available, is_suspended),
  KEY ix_worker_profiles_area (current_city, current_district),
  CONSTRAINT fk_worker_profiles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS worker_skills (
  id VARCHAR(36) PRIMARY KEY,
  worker_id VARCHAR(36) NOT NULL,
  skill_code VARCHAR(80) NOT NULL,
  skill_name VARCHAR(150) NOT NULL,
  proficiency_level VARCHAR(30) NOT NULL DEFAULT 'BASIC',
  verification_status VARCHAR(30) NOT NULL DEFAULT 'SELF_DECLARED',
  verified_at TIMESTAMP NULL,
  certificate_name VARCHAR(200) NULL,
  certificate_expires_at DATE NULL,
  completed_jobs INT NOT NULL DEFAULT 0,
  average_rating DECIMAL(3,2) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_worker_skills_worker_code (worker_id, skill_code),
  KEY ix_worker_skills_code_status (skill_code, verification_status),
  CONSTRAINT fk_worker_skills_worker
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS worker_availability (
  id VARCHAR(36) PRIMARY KEY,
  worker_id VARCHAR(36) NOT NULL,
  availability_type VARCHAR(30) NOT NULL DEFAULT 'ONE_TIME',
  day_of_week INT NULL,
  specific_date DATE NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  service_areas JSON NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_worker_availability_worker (worker_id),
  KEY ix_worker_availability_date (specific_date, day_of_week),
  CONSTRAINT fk_worker_availability_worker
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_categories (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(80) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description VARCHAR(500) NULL,
  pricing_unit VARCHAR(30) NOT NULL DEFAULT 'HOUR',
  minimum_hours DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  base_rate DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
  matching_mode VARCHAR(30) NOT NULL DEFAULT 'ASSISTED',
  requires_verification BOOLEAN NOT NULL DEFAULT TRUE,
  requires_training BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_job_categories_code (code),
  KEY ix_job_categories_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS jobs (
  id VARCHAR(36) PRIMARY KEY,
  job_code VARCHAR(30) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  category_id VARCHAR(36) NOT NULL,
  location_id VARCHAR(36) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'DRAFT',
  matching_mode VARCHAR(30) NOT NULL DEFAULT 'ASSISTED',
  risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
  headcount INT NOT NULL DEFAULT 1,
  start_at TIMESTAMP NOT NULL,
  end_at TIMESTAMP NOT NULL,
  break_minutes INT NOT NULL DEFAULT 0,
  customer_budget DECIMAL(14,2) NULL,
  suggested_price DECIMAL(14,2) NULL,
  agreed_price DECIMAL(14,2) NULL,
  worker_payout_rate DECIMAL(5,2) NOT NULL DEFAULT 75.00,
  worker_payout_amount DECIMAL(14,2) NULL,
  platform_fee_amount DECIMAL(14,2) NULL,
  dress_code VARCHAR(255) NULL,
  tools_provided_by VARCHAR(30) NULL,
  special_notes TEXT NULL,
  published_at TIMESTAMP NULL,
  verified_at TIMESTAMP NULL,
  verified_by_user_id VARCHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_jobs_job_code (job_code),
  KEY ix_jobs_customer (customer_id),
  KEY ix_jobs_category (category_id),
  KEY ix_jobs_status_start (status, start_at),
  CONSTRAINT fk_jobs_customer FOREIGN KEY (customer_id) REFERENCES customer_profiles(id),
  CONSTRAINT fk_jobs_category FOREIGN KEY (category_id) REFERENCES job_categories(id),
  CONSTRAINT fk_jobs_location FOREIGN KEY (location_id) REFERENCES customer_locations(id),
  CONSTRAINT fk_jobs_verified_by FOREIGN KEY (verified_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_requirements (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  requirement_type VARCHAR(40) NOT NULL,
  requirement_code VARCHAR(80) NULL,
  description VARCHAR(500) NOT NULL,
  mandatory BOOLEAN NOT NULL DEFAULT TRUE,
  minimum_level VARCHAR(30) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_job_requirements_job (job_id),
  KEY ix_job_requirements_type (requirement_type),
  CONSTRAINT fk_job_requirements_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pricing_quotes (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  quote_version INT NOT NULL DEFAULT 1,
  quote_status VARCHAR(30) NOT NULL DEFAULT 'PROPOSED',
  base_amount DECIMAL(14,2) NOT NULL,
  time_surcharge DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  location_surcharge DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  skill_surcharge DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  urgency_surcharge DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  risk_surcharge DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  retention_fee DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  customer_total DECIMAL(14,2) NOT NULL,
  worker_payout_rate DECIMAL(5,2) NOT NULL,
  worker_payout_amount DECIMAL(14,2) NOT NULL,
  platform_fee_amount DECIMAL(14,2) NOT NULL,
  calculation_details JSON NULL,
  created_by_user_id VARCHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_pricing_quotes_job_version (job_id, quote_version),
  KEY ix_pricing_quotes_job (job_id),
  CONSTRAINT fk_pricing_quotes_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_pricing_quotes_created_by FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS job_candidates (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  worker_id VARCHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PROPOSED',
  rank_order INT NULL,
  total_score DECIMAL(6,2) NULL,
  score_breakdown JSON NULL,
  reasons JSON NULL,
  warnings JSON NULL,
  proposed_payout DECIMAL(14,2) NULL,
  responded_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_job_candidates_job_worker (job_id, worker_id),
  KEY ix_job_candidates_job_status (job_id, status),
  CONSTRAINT fk_job_candidates_job FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_job_candidates_worker FOREIGN KEY (worker_id) REFERENCES worker_profiles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  worker_id VARCHAR(36) NOT NULL,
  candidate_id VARCHAR(36) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'CONFIRMED',
  agreed_payout DECIMAL(14,2) NOT NULL,
  retention_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  confirmed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP NULL,
  cancellation_reason VARCHAR(500) NULL,
  replacement_for_assignment_id VARCHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_assignments_job_worker (job_id, worker_id),
  KEY ix_assignments_status (status),
  CONSTRAINT fk_assignments_job FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_assignments_worker FOREIGN KEY (worker_id) REFERENCES worker_profiles(id),
  CONSTRAINT fk_assignments_candidate FOREIGN KEY (candidate_id) REFERENCES job_candidates(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS work_sessions (
  id VARCHAR(36) PRIMARY KEY,
  assignment_id VARCHAR(36) NOT NULL,
  check_in_at TIMESTAMP NULL,
  check_in_latitude DECIMAL(10,7) NULL,
  check_in_longitude DECIMAL(10,7) NULL,
  check_in_method VARCHAR(30) NULL,
  check_out_at TIMESTAMP NULL,
  check_out_latitude DECIMAL(10,7) NULL,
  check_out_longitude DECIMAL(10,7) NULL,
  check_out_method VARCHAR(30) NULL,
  actual_minutes INT NULL,
  overtime_minutes INT NOT NULL DEFAULT 0,
  evidence JSON NULL,
  customer_confirmed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_work_sessions_assignment (assignment_id),
  CONSTRAINT fk_work_sessions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  assignment_id VARCHAR(36) NULL,
  payment_type VARCHAR(30) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  amount DECIMAL(14,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'VND',
  provider VARCHAR(50) NULL,
  provider_reference VARCHAR(150) NULL,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_payments_job (job_id),
  KEY ix_payments_status (status),
  CONSTRAINT fk_payments_job FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_payments_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  assignment_id VARCHAR(36) NULL,
  reviewer_user_id VARCHAR(36) NOT NULL,
  reviewee_user_id VARCHAR(36) NOT NULL,
  reviewer_type VARCHAR(20) NOT NULL,
  overall_rating INT NOT NULL,
  criteria JSON NULL,
  comment TEXT NULL,
  would_hire_again INT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PUBLISHED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_reviews_job_reviewer (job_id, reviewer_user_id),
  CONSTRAINT fk_reviews_job FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_reviews_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  CONSTRAINT fk_reviews_reviewer FOREIGN KEY (reviewer_user_id) REFERENCES users(id),
  CONSTRAINT fk_reviews_reviewee FOREIGN KEY (reviewee_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS support_cases (
  id VARCHAR(36) PRIMARY KEY,
  case_code VARCHAR(30) NOT NULL,
  job_id VARCHAR(36) NULL,
  opened_by_user_id VARCHAR(36) NOT NULL,
  assigned_to_user_id VARCHAR(36) NULL,
  case_type VARCHAR(40) NOT NULL,
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  subject VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  resolution TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_support_cases_code (case_code),
  KEY ix_support_cases_queue (status, priority),
  CONSTRAINT fk_support_cases_job FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_support_cases_opened_by FOREIGN KEY (opened_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_support_cases_assigned_to FOREIGN KEY (assigned_to_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  actor_user_id VARCHAR(36) NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(80) NOT NULL,
  entity_id VARCHAR(36) NULL,
  before_data JSON NULL,
  after_data JSON NULL,
  ip_address VARCHAR(45) NULL,
  user_agent VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_audit_logs_entity (entity_type, entity_id),
  KEY ix_audit_logs_actor (actor_user_id),
  CONSTRAINT fk_audit_logs_actor FOREIGN KEY (actor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
