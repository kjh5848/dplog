-- Subscription 재시도 필드 추가
ALTER TABLE SUBSCRIPTIONS
    ADD COLUMN IF NOT EXISTS retry_count INT NOT NULL DEFAULT 0 AFTER failure_count,
    ADD COLUMN IF NOT EXISTS next_retry_at DATETIME NULL AFTER retry_count;

CREATE INDEX IF NOT EXISTS idx_subscriptions_next_retry ON SUBSCRIPTIONS(next_retry_at);
