package kr.co.nomadlab.nomadrank.domain.payment.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 인보이스 응답 DTO 모음
 */
public final class InvoiceDtos {

    private InvoiceDtos() {
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceListItem {
        private String invoiceId;
        private String subscriptionId;
        private Long userId;
        private String status;
        private String statusLabel;
        private BigDecimal amountDue;
        private String currency;
        private String issuedAt;
        private String dueAt;
        private String paidAt;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceLineResponse {
        private String lineId;
        private String invoiceId;
        private String lineType;
        private String lineTypeLabel;
        private String description;
        private BigDecimal amount;
        private String currency;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceDetailResponse {
        private InvoiceListItem invoice;
        private List<InvoiceLineResponse> lines;
        private List<ChargeResponse> charges;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChargeResponse {
        private String paymentId;
        private String invoiceId;
        private Long userId;
        private String chargeType;
        private String paymentType;
        private String status;
        private BigDecimal amount;
        private String currency;
        private String paidAt;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceSummaryResponse {
        private String month;
        private BigDecimal totalAmount;
        private long count;
        private String status;
        private String statusLabel;
    }
}
