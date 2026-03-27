package kr.co.nomadlab.nomadrank.domain.payment.dto.response;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingKeyFailResponse {
    private boolean retryAvailable;
    private int remainingRetries;
    private String message;
}

