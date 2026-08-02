CREATE TABLE IF NOT EXISTS cancellation_assessments (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  assignment_id VARCHAR(36) NULL,
  event_type VARCHAR(30) NOT NULL,
  cancelled_by_party VARCHAR(20) NOT NULL,
  minutes_before_start DECIMAL(12,2) NOT NULL,
  policy_version VARCHAR(30) NOT NULL,
  customer_fee_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  worker_compensation_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  platform_fee_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'ASSESSED',
  reason VARCHAR(500) NOT NULL,
  calculation_details JSON NULL,
  assessed_by_user_id VARCHAR(36) NOT NULL,
  approved_by_user_id VARCHAR(36) NULL,
  assessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  UNIQUE KEY ux_cancellation_assessment_assignment (
    assignment_id,
    event_type
  ),
  KEY ix_cancellation_assessments_job (job_id),
  CONSTRAINT fk_cancellation_job
    FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_cancellation_assignment
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  CONSTRAINT fk_cancellation_assessed_by
    FOREIGN KEY (assessed_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_cancellation_approved_by
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS replacement_requests (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  original_assignment_id VARCHAR(36) NOT NULL,
  replacement_worker_id VARCHAR(36) NULL,
  replacement_assignment_id VARCHAR(36) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  priority VARCHAR(20) NOT NULL DEFAULT 'HIGH',
  reason VARCHAR(500) NOT NULL,
  requested_by_user_id VARCHAR(36) NOT NULL,
  assigned_by_user_id VARCHAR(36) NULL,
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fulfilled_at TIMESTAMP NULL,
  cancelled_at TIMESTAMP NULL,
  UNIQUE KEY ux_replacement_requests_original_open (
    original_assignment_id,
    status
  ),
  KEY ix_replacement_requests_job (job_id, status),
  CONSTRAINT fk_replacement_job
    FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_replacement_original_assignment
    FOREIGN KEY (original_assignment_id) REFERENCES assignments(id),
  CONSTRAINT fk_replacement_worker
    FOREIGN KEY (replacement_worker_id) REFERENCES worker_profiles(id),
  CONSTRAINT fk_replacement_assignment
    FOREIGN KEY (replacement_assignment_id) REFERENCES assignments(id),
  CONSTRAINT fk_replacement_requested_by
    FOREIGN KEY (requested_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_replacement_assigned_by
    FOREIGN KEY (assigned_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dispute_events (
  id VARCHAR(36) PRIMARY KEY,
  support_case_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(40) NOT NULL,
  from_status VARCHAR(30) NULL,
  to_status VARCHAR(30) NULL,
  note TEXT NOT NULL,
  evidence JSON NULL,
  actor_user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_dispute_events_case (support_case_id),
  CONSTRAINT fk_dispute_event_case
    FOREIGN KEY (support_case_id)
    REFERENCES support_cases(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_dispute_event_actor
    FOREIGN KEY (actor_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS financial_adjustments (
  id VARCHAR(36) PRIMARY KEY,
  support_case_id VARCHAR(36) NOT NULL,
  job_id VARCHAR(36) NOT NULL,
  original_payment_id VARCHAR(36) NULL,
  generated_payment_id VARCHAR(36) NULL,
  adjustment_type VARCHAR(30) NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'VND',
  status VARCHAR(30) NOT NULL DEFAULT 'PROPOSED',
  reason VARCHAR(500) NOT NULL,
  proposed_by_user_id VARCHAR(36) NOT NULL,
  approved_by_user_id VARCHAR(36) NULL,
  proposed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  KEY ix_financial_adjustments_case (support_case_id, status),
  CONSTRAINT fk_adjustment_case
    FOREIGN KEY (support_case_id) REFERENCES support_cases(id),
  CONSTRAINT fk_adjustment_job
    FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_adjustment_original_payment
    FOREIGN KEY (original_payment_id) REFERENCES payments(id),
  CONSTRAINT fk_adjustment_generated_payment
    FOREIGN KEY (generated_payment_id) REFERENCES payments(id),
  CONSTRAINT fk_adjustment_proposed_by
    FOREIGN KEY (proposed_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_adjustment_approved_by
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
