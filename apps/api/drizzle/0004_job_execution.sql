CREATE TABLE IF NOT EXISTS assignment_events (
  id VARCHAR(36) PRIMARY KEY,
  assignment_id VARCHAR(36) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  from_status VARCHAR(30) NULL,
  to_status VARCHAR(30) NULL,
  actor_user_id VARCHAR(36) NULL,
  latitude DECIMAL(10,7) NULL,
  longitude DECIMAL(10,7) NULL,
  note VARCHAR(500) NULL,
  metadata JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY ix_assignment_events_assignment (assignment_id),
  KEY ix_assignment_events_type (event_type),
  CONSTRAINT fk_assignment_events_assignment
    FOREIGN KEY (assignment_id)
    REFERENCES assignments(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_assignment_events_actor
    FOREIGN KEY (actor_user_id)
    REFERENCES users(id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS work_incidents (
  id VARCHAR(36) PRIMARY KEY,
  assignment_id VARCHAR(36) NOT NULL,
  work_session_id VARCHAR(36) NULL,
  incident_type VARCHAR(40) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  description TEXT NOT NULL,
  evidence JSON NULL,
  reported_by_user_id VARCHAR(36) NOT NULL,
  assigned_to_user_id VARCHAR(36) NULL,
  resolution TEXT NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  KEY ix_work_incidents_assignment (assignment_id),
  KEY ix_work_incidents_queue (status, severity),
  CONSTRAINT fk_work_incidents_assignment
    FOREIGN KEY (assignment_id)
    REFERENCES assignments(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_work_incidents_session
    FOREIGN KEY (work_session_id)
    REFERENCES work_sessions(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_work_incidents_reporter
    FOREIGN KEY (reported_by_user_id)
    REFERENCES users(id),
  CONSTRAINT fk_work_incidents_assignee
    FOREIGN KEY (assigned_to_user_id)
    REFERENCES users(id)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;
