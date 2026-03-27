package kr.co.nomadlab.nomadrank.domain.payment.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 단건 결제 요청 DTO (현재는 스텁)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentChargeRequest {

    @NotBlank(message = "빌링키 발급 ID는 필수입니다")
    private String issueId;

    @NotBlank(message = "주문 ID는 필수입니다")
    private String orderId;

    @NotNull(message = "결제 금액은 필수입니다")
    @Min(value = 1, message = "결제 금액은 1원 이상이어야 합니다")
    private Long amount;

    @NotBlank(message = "고객 ID는 필수입니다")
    private String customerId;

    private String orderName;
}
