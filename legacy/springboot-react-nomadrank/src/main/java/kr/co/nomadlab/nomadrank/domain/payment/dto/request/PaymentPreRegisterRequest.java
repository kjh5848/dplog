package kr.co.nomadlab.nomadrank.domain.payment.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 결제 사전등록 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentPreRegisterRequest {

    @NotNull(message = "멤버십 레벨은 필수입니다")
    private Integer membershipLevel;

    @NotNull(message = "결제 수단은 필수입니다")
    private String paymentMethod;

    private Long couponId;

    @NotNull(message = "결제 금액은 필수입니다")
    @Positive(message = "결제 금액은 0보다 커야 합니다")
    private Long expectedAmount;

    @Builder.Default
    private String currency = "KRW";

    @Builder.Default
    @NotNull(message = "결제 주기는 필수입니다")
    private BillingCycleType billingCycle = BillingCycleType.MONTHLY;

    /**
     * 결제 ID 생성
     */
    public String generatePaymentId(Long userId) {
        String randomToken = java.util.UUID.randomUUID().toString().replace("-", "");
        return "mbsp-" + userId + "-" + System.currentTimeMillis() + "-" + randomToken;
    }

    /**
     * 가맹점 주문번호 생성
     */
    public String generateMerchantUid(Long userId) {
        String randomToken = java.util.UUID.randomUUID().toString().replace("-", "");
        return "nomadrank-" + userId + "-" + System.currentTimeMillis() + "-" + randomToken;
    }
}
