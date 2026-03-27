package kr.co.nomadlab.nomadrank.domain.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private boolean success;
    private String paymentId;
    private String status;
    private BigDecimal amount;
    private String paidAt;
    private String errorMessage;
    private String pgResponseCode;
}