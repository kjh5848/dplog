package kr.co.nomadlab.nomadrank.domain.subscription.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 구독 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionResponse {

    private String subscriptionId;
    private String billingKeyId;
    private String productName;
    private BigDecimal amount;
    private String billingCycle;
    private String status;
    private LocalDate startDate;
    private LocalDate nextBillingDate;
    private FirstPaymentResult firstPaymentResult;
    private CardInfo cardInfo;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FirstPaymentResult {
        private boolean success;
        private String paymentId;
        private BigDecimal amount;
        private LocalDateTime paidAt;
        private String membershipLevel;
        private String status;
        private Long membershipId;
        private Long membershipUserId;
        private String errorMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CardInfo {
        private String last4Digits;
        private String issuerName;
        private String cardType;
    }

    /**
     * Entity를 DTO로 변환
     */
    public static SubscriptionResponse from(SubscriptionEntity entity, FirstPaymentResult firstPayment, CardInfo cardInfo) {
        return SubscriptionResponse.builder()
                .subscriptionId(entity.getSubscriptionId())
                .billingKeyId(entity.getIssueId())
                .productName(entity.getMembershipName())
                .amount(entity.getAmount())
                .billingCycle(entity.getBillingCycle().name())
                .status(entity.getStatus().name())
                .startDate(entity.getStartDate())
                .nextBillingDate(entity.getNextBillingDate())
                .firstPaymentResult(firstPayment)
                .cardInfo(cardInfo)
                .build();
    }
}
