package kr.co.nomadlab.nomadrank.domain.subscription.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import kr.co.nomadlab.nomadrank.model.subscription.SubscriptionEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 구독 상태 조회 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionStatusResponse {

    private boolean hasActiveSubscription;
    private SubscriptionInfo subscription;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubscriptionInfo {
        private String subscriptionId;
        private String membershipName;
        private String status;
        private BigDecimal amount;
        private String billingCycle;
        private LocalDate startDate;
        private LocalDate nextBillingDate;
        private CardInfo cardInfo;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class CardInfo {
            private String last4Digits;
            private String issuerName;
        }
    }

    /**
     * 활성 구독이 없는 경우
     */
    public static SubscriptionStatusResponse noActiveSubscription() {
        return SubscriptionStatusResponse.builder()
                .hasActiveSubscription(false)
                .subscription(null)
                .build();
    }

    /**
     * Entity를 DTO로 변환
     */
    public static SubscriptionStatusResponse from(SubscriptionEntity entity, String maskedCardNumber, String issuerName, boolean hasActive) {
        SubscriptionInfo.CardInfo cardInfo = SubscriptionInfo.CardInfo.builder()
                .last4Digits(maskedCardNumber != null ? maskedCardNumber.substring(maskedCardNumber.length() - 4) : null)
                .issuerName(issuerName)
                .build();

        SubscriptionInfo subscriptionInfo = SubscriptionInfo.builder()
                .subscriptionId(entity.getSubscriptionId())
                .membershipName(entity.getMembershipName())
                .status(entity.getStatus().name())
                .amount(entity.getAmount())
                .billingCycle(entity.getBillingCycle().name())
                .startDate(entity.getStartDate())
                .nextBillingDate(entity.getNextBillingDate())
                .cardInfo(cardInfo)
                .build();

        return SubscriptionStatusResponse.builder()
                .hasActiveSubscription(hasActive)
                .subscription(subscriptionInfo)
                .build();
    }
}
