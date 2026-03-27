package kr.co.nomadlab.nomadrank.domain.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycleType;


/**
 * 결제 사전등록 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentPreRegisterResponse {
    
    private boolean success;
    private String paymentId;
    private String merchantUid;
    private BigDecimal totalAmount;
    private String currency;
    private String status;
    private OffsetDateTime preparedAt;
    private BillingCycleType billingCycle;
    private String portOneRawResponse;

    public static PaymentPreRegisterResponse of(String paymentId,
                                                String merchantUid,
                                                BigDecimal totalAmount,
                                                String currency,
                                                String status,
                                                OffsetDateTime preparedAt,
                                                BillingCycleType billingCycle,
                                                String portOneRawResponse) {
        return PaymentPreRegisterResponse.builder()
                .paymentId(paymentId)
                .merchantUid(merchantUid)
                .totalAmount(totalAmount)
                .currency(currency)
                .status(status)
                .preparedAt(preparedAt)
                .billingCycle(billingCycle)
                .portOneRawResponse(portOneRawResponse)
                .build();
    }
}
