CREATE TABLE IF NOT EXISTS review_metric_updates (
  id VARCHAR(36) PRIMARY KEY,
  review_id VARCHAR(36) NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id VARCHAR(36) NOT NULL,
  scoring_version VARCHAR(30) NOT NULL DEFAULT 'QUALITY_V1',
  before_snapshot JSON NULL,
  after_snapshot JSON NULL,
  processed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_review_metric_updates_review (review_id),
  KEY ix_review_metric_updates_target (target_type, target_id),
  CONSTRAINT fk_review_metric_updates_review
    FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS customer_quality_metrics (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 5,
  completed_jobs INT NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  safety_score DECIMAL(5,2) NOT NULL DEFAULT 100,
  work_condition_score DECIMAL(5,2) NOT NULL DEFAULT 100,
  risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_customer_quality_customer (customer_id),
  KEY ix_customer_quality_risk (risk_level),
  CONSTRAINT fk_customer_quality_customer
    FOREIGN KEY (customer_id)
    REFERENCES customer_profiles(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS relationship_preferences (
  id VARCHAR(36) PRIMARY KEY,
  customer_id VARCHAR(36) NOT NULL,
  worker_id VARCHAR(36) NOT NULL,
  set_by_party VARCHAR(20) NOT NULL,
  preference_type VARCHAR(20) NOT NULL DEFAULT 'NEUTRAL',
  reason VARCHAR(500) NULL,
  source_job_id VARCHAR(36) NULL,
  active INT NOT NULL DEFAULT 1,
  created_by_user_id VARCHAR(36) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_relationship_party (
    customer_id,
    worker_id,
    set_by_party
  ),
  KEY ix_relationship_matching (
    customer_id,
    worker_id,
    preference_type,
    active
  ),
  CONSTRAINT fk_relationship_customer
    FOREIGN KEY (customer_id)
    REFERENCES customer_profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_relationship_worker
    FOREIGN KEY (worker_id)
    REFERENCES worker_profiles(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_relationship_source_job
    FOREIGN KEY (source_job_id) REFERENCES jobs(id),
  CONSTRAINT fk_relationship_created_by
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rehire_links (
  id VARCHAR(36) PRIMARY KEY,
  source_job_id VARCHAR(36) NOT NULL,
  new_job_id VARCHAR(36) NOT NULL,
  preferred_worker_id VARCHAR(36) NULL,
  requested_by_user_id VARCHAR(36) NOT NULL,
  inherited_fields JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ux_rehire_links_new_job (new_job_id),
  KEY ix_rehire_links_source (source_job_id),
  CONSTRAINT fk_rehire_source_job
    FOREIGN KEY (source_job_id) REFERENCES jobs(id),
  CONSTRAINT fk_rehire_new_job
    FOREIGN KEY (new_job_id) REFERENCES jobs(id),
  CONSTRAINT fk_rehire_worker
    FOREIGN KEY (preferred_worker_id) REFERENCES worker_profiles(id),
  CONSTRAINT fk_rehire_requested_by
    FOREIGN KEY (requested_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
