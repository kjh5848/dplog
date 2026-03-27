package kr.co.nomadlab.nomadrank.domain.payment.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 구독 해지 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionCancelResponse {

    private String status;
    private OffsetDateTime canceledAt;
    private boolean scheduleRemoved;
    private OffsetDateTime scheduleRevokedAt;
    private Boolean refundEligible;
    private BigDecimal refundAmount;
    private String refundStatus;
    private String refundMessage;
    private OffsetDateTime refundedAt;
}
