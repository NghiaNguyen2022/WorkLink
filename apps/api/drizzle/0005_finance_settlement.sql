CREATE TABLE IF NOT EXISTS settlements (
  id VARCHAR(36) PRIMARY KEY,
  settlement_code VARCHAR(30) NOT NULL,
  job_id VARCHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  currency VARCHAR(10) NOT NULL DEFAULT 'VND',
  customer_base_amount DECIMAL(14,2) NOT NULL,
  customer_adjustment_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  customer_total_amount DECIMAL(14,2) NOT NULL,
  worker_base_amount DECIMAL(14,2) NOT NULL,
  worker_overtime_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  worker_adjustment_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  retention_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
  worker_payable_amount DECIMAL(14,2) NOT NULL,
  platform_fee_amount DECIMAL(14,2) NOT NULL,
  calculation_details JSON NULL,
  prepared_by_user_id VARCHAR(36) NULL,
  approved_by_user_id VARCHAR(36) NULL,
  prepared_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  settled_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_settlements_code (settlement_code),
  UNIQUE KEY ux_settlements_job (job_id),
  KEY ix_settlements_status (status),
  CONSTRAINT fk_settlements_job
    FOREIGN KEY (job_id) REFERENCES jobs(id),
  CONSTRAINT fk_settlements_prepared_by
    FOREIGN KEY (prepared_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_settlements_approved_by
    FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settlement_lines (
  id VARCHAR(36) PRIMARY KEY,
  settlement_id VARCHAR(36) NOT NULL,
  assignment_id VARCHAR(36) NULL,
  worker_id VARCHAR(36) NULL,
  line_type VARCHAR(40) NOT NULL,
  description VARCHAR(500) NOT NULL,
  quantity DECIMAL(12,2) NOT NULL DEFAULT 1,
  unit_amount DECIMAL(14,2) NOT NULL,
  amount DECIMAL(14,2) NOT NULL,
  direction VARCHAR(20) NOT NULL,
  metadata JSON NULL,
  created_by_user_id VARCHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_settlement_lines_settlement (settlement_id),
  KEY ix_settlement_lines_worker (worker_id),
  CONSTRAINT fk_settlement_lines_settlement
    FOREIGN KEY (settlement_id)
    REFERENCES settlements(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_settlement_lines_assignment
    FOREIGN KEY (assignment_id) REFERENCES assignments(id),
  CONSTRAINT fk_settlement_lines_worker
    FOREIGN KEY (worker_id) REFERENCES worker_profiles(id),
  CONSTRAINT fk_settlement_lines_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payment_events (
  id VARCHAR(36) PRIMARY KEY,
  payment_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(40) NOT NULL,
  from_status VARCHAR(30) NULL,
  to_status VARCHAR(30) NULL,
  provider_reference VARCHAR(150) NULL,
  note TEXT NULL,
  actor_user_id VARCHAR(36) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_payment_events_payment (payment_id),
  CONSTRAINT fk_payment_events_payment
    FOREIGN KEY (payment_id)
    REFERENCES payments(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_payment_events_actor
    FOREIGN KEY (actor_user_id) REFERENCES users(id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
