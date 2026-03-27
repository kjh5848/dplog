package kr.co.nomadlab.nomadrank.domain.subscription.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class SubscriptionDowngradeRequest {

    @NotNull(message = "변경할 멤버십 레벨은 필수입니다.")
    private Integer targetMembershipLevel;

    @NotNull(message = "변경할 결제 주기는 필수입니다.")
    private BillingCycle targetBillingCycle;

    @Size(max = 200, message = "사유는 200자 이하여야 합니다.")
    private String reason;

    /** 멱등 처리를 위한 요청 식별자 (프런트에서 생성/재사용) */
    @Size(max = 191, message = "operationId는 191자 이하여야 합니다.")
    private String operationId;
}
