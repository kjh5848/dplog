package kr.co.nomadlab.nomadrank.domain.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 단건 결제 응답 DTO (현재는 스텁)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentChargeResponse {

    private String status;
    private String message;
}
