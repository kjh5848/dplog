package kr.co.nomadlab.nomadrank.domain.payment.dto.response;

import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * PortOne V2 결제 예약 생성 응답 DTO
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentScheduleCreateResponse {

    private boolean success;                       // 성공 여부
    private String scheduleId;                     // 결제 예약 ID
    private String status;                         // 예약 상태
    private OffsetDateTime timeToPay;              // 예약 실행 예정 시각
    private String paymentId;                      // PortOne 결제 ID
    private String rawResponse;                    // 원본 응답
    private String errorCode;                      // 에러 코드
    private String errorMessage;                   // 에러 메시지
}
