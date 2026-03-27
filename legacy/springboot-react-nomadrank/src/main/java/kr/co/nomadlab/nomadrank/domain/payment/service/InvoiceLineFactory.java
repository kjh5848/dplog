package kr.co.nomadlab.nomadrank.domain.payment.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Component;

import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceLineEntity;
import kr.co.nomadlab.nomadrank.model.payment.entity.InvoiceLineType;

@Component
public class InvoiceLineFactory {

    public InvoiceLineEntity membershipLine(String invoiceId, String description, BigDecimal amount, String currency) {
        return base(invoiceId, InvoiceLineType.MEMBERSHIP, description, amount, currency);
    }

    public InvoiceLineEntity prorationLine(String invoiceId, String description, BigDecimal amount, String currency) {
        return base(invoiceId, InvoiceLineType.PRORATION, description, amount, currency);
    }

    public InvoiceLineEntity creditLine(String invoiceId, String description, BigDecimal amount, String currency) {
        return base(invoiceId, InvoiceLineType.CREDIT, description, amount.negate(), currency);
    }

    public InvoiceLineEntity adjustmentLine(String invoiceId, String description, BigDecimal amount, String currency) {
        return base(invoiceId, InvoiceLineType.ADJUSTMENT, description, amount, currency);
    }

    public InvoiceLineEntity refundLine(String invoiceId, String description, BigDecimal amount, String currency) {
        // 환불은 음수 라인으로 기록
        return base(invoiceId, InvoiceLineType.REFUND, description, amount.negate(), currency);
    }

    private InvoiceLineEntity base(String invoiceId, InvoiceLineType type, String description, BigDecimal amount,
            String currency) {
        return InvoiceLineEntity.builder()
                .lineId(generateLineId(invoiceId))
                .invoiceId(invoiceId)
                .lineType(type)
                .description(description)
                .amount(amount)
                .currency(currency != null ? currency : "KRW")
                .build();
    }

    private String generateLineId(String invoiceId) {
        String base = invoiceId != null ? invoiceId : LocalDate.now().toString();
        return "line-" + base + "-" + UUID.randomUUID();
    }
}
