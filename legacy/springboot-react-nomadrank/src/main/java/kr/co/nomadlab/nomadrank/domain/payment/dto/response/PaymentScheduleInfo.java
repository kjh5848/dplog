package kr.co.nomadlab.nomadrank.domain.payment.dto.response;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 포트원 결제 예약 스케줄 정보
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentScheduleInfo {

    private String id;
    private String status;
    private OffsetDateTime scheduleAt;
    private OffsetDateTime executedAt;
    private BigDecimal totalAmount;
}
