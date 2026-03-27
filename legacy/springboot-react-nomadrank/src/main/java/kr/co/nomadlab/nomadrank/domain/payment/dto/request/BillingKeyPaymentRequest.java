package kr.co.nomadlab.nomadrank.domain.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * ✅ 빌링키 기반 결제 요청 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingKeyPaymentRequest {

    private String paymentId;            // 결제 ID
    private String billingKey;           // 빌링키
    private String orderName;            // 주문명
    private BigDecimal amount;           // 결제 금액
    @Builder.Default
    private String currency = "KRW";     // 통화
    private Map<String, Object> customer; // 고객 정보 (이메일, 이름, 전화번호 등)
}