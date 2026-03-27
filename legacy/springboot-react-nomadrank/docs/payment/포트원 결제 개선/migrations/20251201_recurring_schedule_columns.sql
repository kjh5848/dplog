-- 포트원 정기결제 예약 메타데이터 컬럼 추가 (MySQL 8 기준)
ALTER TABLE SUBSCRIPTIONS
    ADD COLUMN schedule_id VARCHAR(100) NULL AFTER cancel_scheduled_at,
    ADD COLUMN schedule_status VARCHAR(30) DEFAULT 'UNKNOWN' AFTER schedule_id,
    ADD COLUMN schedule_last_synced_at DATETIME NULL AFTER schedule_status,
    ADD COLUMN next_billing_at DATETIME NULL AFTER schedule_last_synced_at;

-- 기본값/초기값 채우기
UPDATE SUBSCRIPTIONS
SET schedule_status = 'UNKNOWN',
    schedule_last_synced_at = NOW()
WHERE schedule_status IS NULL;

-- next_billing_at 초기화 (next_billing_date가 있는 경우 KST 09:00을 UTC로 변환해 설정)
UPDATE SUBSCRIPTIONS
SET next_billing_at = CONVERT_TZ(CONCAT(next_billing_date, ' 09:00:00'), 'Asia/Seoul', 'UTC')
WHERE next_billing_date IS NOT NULL
  AND next_billing_at IS NULL;

-- 점검: 스키마 반영 여부 확인
DESC SUBSCRIPTIONS;
