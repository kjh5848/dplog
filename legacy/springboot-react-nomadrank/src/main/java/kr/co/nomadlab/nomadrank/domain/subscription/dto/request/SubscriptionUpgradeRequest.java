package kr.co.nomadlab.nomadrank.domain.subscription.dto.request;

import jakarta.validation.constraints.NotNull;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 구독 업그레이드 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionUpgradeRequest {

    /** 목표 멤버십 레벨 (MembershipEntity.level) */
    @NotNull(message = "업그레이드할 멤버십 레벨은 필수입니다.")
    private Integer targetMembershipLevel;

    /** 적용할 결제 주기 */
    @NotNull(message = "결제 주기는 필수입니다.")
    private BillingCycle billingCycle;

    /** 결제 수단 (옵션, 추후 확장 대비) */
    private String paymentMethod;

    /** 멱등 처리를 위한 요청 식별자 (프런트에서 생성/재사용) */
    private String operationId;
}
