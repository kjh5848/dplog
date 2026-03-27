package kr.co.nomadlab.nomadrank.domain.payment.dto.response;

import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentScheduleDeleteResponse {

    private OffsetDateTime revokedAt;
}
