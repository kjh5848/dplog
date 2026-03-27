-- Invoice / InvoiceLine 테이블
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id VARCHAR(100) PRIMARY KEY,
    subscription_id VARCHAR(100) NOT NULL,
    user_id BIGINT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    amount_due DECIMAL(12,0) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    due_at TIMESTAMP NULL,
    paid_at TIMESTAMP NULL,
    voided_at TIMESTAMP NULL,
    refunded_at TIMESTAMP NULL,
    INDEX idx_invoices_subscription (subscription_id),
    INDEX idx_invoices_user (user_id),
    INDEX idx_invoices_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoice_lines (
    line_id VARCHAR(120) PRIMARY KEY,
    invoice_id VARCHAR(100) NOT NULL,
    line_type VARCHAR(30) NOT NULL,
    description VARCHAR(255),
    amount DECIMAL(12,0) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    INDEX idx_invoice_lines_invoice (invoice_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
