package kr.co.nomadlab.nomadrank.domain.payment.dto.request;

import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingKeyFailRequest {
    private String paymentId;
    private String issueId;
    private String errorCode;
    private String errorMessage;
    private String failedAt;
}
