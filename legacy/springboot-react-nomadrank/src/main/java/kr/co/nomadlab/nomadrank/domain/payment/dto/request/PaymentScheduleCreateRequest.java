package kr.co.nomadlab.nomadrank.domain.payment.dto.request;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * PortOne V2 결제 예약 생성 요청 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentScheduleCreateRequest {

    private String paymentId;                      // PortOne 결제 ID (예약 기준)
    private String billingKey;                     // 빌링키
    private String orderName;                      // 주문명
    private BigDecimal amount;                     // 결제 금액
    @Builder.Default
    private String currency = "KRW";               // 통화
    private Map<String, Object> customer;          // 고객 정보
    @Builder.Default
    private Integer productCount = 1;              // 상품 개수
    private OffsetDateTime timeToPay;              // 결제 예정 시각
}
