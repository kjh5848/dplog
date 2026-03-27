-- PAYMENT_HISTORY 확장: invoice_id, charge_type
ALTER TABLE PAYMENT_HISTORY
    ADD COLUMN IF NOT EXISTS invoice_id VARCHAR(100) NULL AFTER subscription_id,
    ADD COLUMN IF NOT EXISTS charge_type VARCHAR(30) NULL AFTER payment_type;

CREATE INDEX IF NOT EXISTS idx_payment_history_invoice ON PAYMENT_HISTORY(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_charge_type ON PAYMENT_HISTORY(charge_type);
