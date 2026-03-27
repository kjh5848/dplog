package kr.co.nomadlab.nomadrank.model.payment.entity;

public enum InvoiceStatus {
    PENDING("대기"),
    PAID("결제완료"),
    VOID("무효"),
    REFUNDED("환불완료");

    private final String label;

    InvoiceStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static InvoiceStatus fromName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        try {
            return InvoiceStatus.valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
