-- payment_schedule_events table
CREATE TABLE IF NOT EXISTS payment_schedule_events (
    event_id VARCHAR(150) PRIMARY KEY,
    schedule_id VARCHAR(100),
    issue_id VARCHAR(100),
    user_id BIGINT,
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_code VARCHAR(50),
    error_message VARCHAR(500),
    occurred_at TIMESTAMP NOT NULL,
    payload TEXT,
    INDEX idx_payment_schedule_events_issue (issue_id),
    INDEX idx_payment_schedule_events_schedule (schedule_id),
    INDEX idx_payment_schedule_events_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- webhook_events table
CREATE TABLE IF NOT EXISTS webhook_events (
    event_id VARCHAR(150) PRIMARY KEY,
    source VARCHAR(50) NOT NULL,
    idempotency_key VARCHAR(150),
    status VARCHAR(20) NOT NULL,
    processed_at TIMESTAMP NOT NULL,
    payload TEXT,
    error_message VARCHAR(500),
    INDEX idx_webhook_events_source (source),
    INDEX idx_webhook_events_idem (idempotency_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- user timezone column
ALTER TABLE `USER`
    ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Seoul' COMMENT '사용자 타임존 (IANA)';
