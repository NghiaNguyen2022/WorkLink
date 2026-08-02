CREATE TABLE IF NOT EXISTS matching_runs (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
  total_workers INT NOT NULL DEFAULT 0,
  eligible_workers INT NOT NULL DEFAULT 0,
  proposed_workers INT NOT NULL DEFAULT 0,
  minimum_score DECIMAL(6,2) NOT NULL,
  parameters JSON NULL,
  created_by_user_id VARCHAR(36) NULL,
  completed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_matching_runs_job (job_id),
  CONSTRAINT fk_matching_runs_job
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_matching_runs_user
    FOREIGN KEY (created_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS candidate_offers (
  id VARCHAR(36) PRIMARY KEY,
  job_id VARCHAR(36) NOT NULL,
  candidate_id VARCHAR(36) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OFFERED',
  proposed_payout DECIMAL(14,2) NOT NULL,
  response_note VARCHAR(500) NULL,
  offered_by_user_id VARCHAR(36) NULL,
  confirmed_by_user_id VARCHAR(36) NULL,
  offered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  responded_at TIMESTAMP NULL,
  confirmed_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY ux_candidate_offers_candidate (candidate_id),
  KEY ix_candidate_offers_expiry (status, expires_at),
  CONSTRAINT fk_candidate_offers_job
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  CONSTRAINT fk_candidate_offers_candidate
    FOREIGN KEY (candidate_id) REFERENCES job_candidates(id) ON DELETE CASCADE,
  CONSTRAINT fk_candidate_offers_offered_by
    FOREIGN KEY (offered_by_user_id) REFERENCES users(id),
  CONSTRAINT fk_candidate_offers_confirmed_by
    FOREIGN KEY (confirmed_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
