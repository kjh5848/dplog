package kr.co.nomadlab.nomadrank.domain.subscription.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 구독 업그레이드 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionUpgradeResponse {

    private BigDecimal differenceAmount;
    private String currency;
    private String paymentId;
    private LocalDate nextBillingDate;
    private long remainingDays;
    private BigDecimal currentPlanPrice;
    private BigDecimal targetPlanPrice;
    private boolean paymentRequested;
    private String message;
}

