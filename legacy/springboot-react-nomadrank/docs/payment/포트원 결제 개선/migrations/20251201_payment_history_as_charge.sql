-- Charge 전환 DDL (옵션: rename + 백호환 VIEW)

-- 1) 테이블 리네이밍 (다운타임/락 주의)
RENAME TABLE PAYMENT_HISTORY TO CHARGE;

-- 2) 백호환 VIEW(필요 시) - 기존 코드/쿼리에서 PAYMENT_HISTORY 참조 시 사용
-- CREATE VIEW PAYMENT_HISTORY AS SELECT * FROM CHARGE;

-- 3) 인덱스 재확인 (invoice_id, charge_type)
CREATE INDEX IF NOT EXISTS idx_charges_invoice ON CHARGE(invoice_id);
CREATE INDEX IF NOT EXISTS idx_charges_charge_type ON CHARGE(charge_type);

-- 백업/검증 가이드
-- - 적용 전 전체 백업/스냅샷
-- - 적용 후 CHARGE/VIEW 레코드 COUNT 비교
-- - 결제/정기/업다운/환불 샘플 시나리오 수동 검증
