package kr.co.nomadlab.nomadrank.domain.subscription.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 정기 결제 예약 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionRequest {

    @NotBlank(message = "빌링키 발급 ID는 필수입니다")
    private String issueId;

    @NotBlank(message = "주문 ID는 필수입니다")
    private String orderId;

    @NotNull(message = "결제 금액은 필수입니다")
    @Min(value = 1, message = "결제 금액은 1원 이상이어야 합니다")
    private Long amount;

    /**
     * ISO-8601 OffsetDateTime(예: 2025-01-02T09:00:00+09:00).
     * 프런트가 비워두면 서버가 타임존/청구 시각을 사용해 계산한다.
     */
    private String scheduleAt;

    @NotBlank(message = "반복 주기는 필수입니다")
    private String interval;

    @NotNull(message = "반복 주기 횟수는 필수입니다")
    @Min(value = 1, message = "반복 주기 횟수는 1 이상이어야 합니다")
    private Integer intervalCount;

    @NotBlank(message = "고객 ID는 필수입니다")
    private String customerId;

    private String orderName;

    private String productId;

    /**
     * 사용자의 선호 타임존(IANA, 예: Asia/Seoul). 비어 있으면 기본 타임존을 사용한다.
     */
    private String timezone;

    /**
     * 선호 청구 시각(HH:mm, 예: 09:00). 비어 있으면 기본 청구 시각을 사용한다.
     */
    private String billingTime;
}
