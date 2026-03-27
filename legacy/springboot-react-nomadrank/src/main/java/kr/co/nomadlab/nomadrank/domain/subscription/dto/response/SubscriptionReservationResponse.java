package kr.co.nomadlab.nomadrank.domain.subscription.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * 정기 결제 예약 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionReservationResponse {

    private String reservationId;
    private String status;
    private OffsetDateTime scheduleAt;
    private String interval;
    private Integer intervalCount;
    private String message;
}
