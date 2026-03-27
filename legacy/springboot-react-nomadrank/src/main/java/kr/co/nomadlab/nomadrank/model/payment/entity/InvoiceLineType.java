package kr.co.nomadlab.nomadrank.model.payment.entity;

public enum InvoiceLineType {
    MEMBERSHIP("멤버십"),
    PRORATION("일할차액"),
    DISCOUNT("할인"),
    CREDIT("크레딧"),
    ADJUSTMENT("조정"),
    REFUND("환불");

    private final String label;

    InvoiceLineType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public static InvoiceLineType fromName(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        try {
            return InvoiceLineType.valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
