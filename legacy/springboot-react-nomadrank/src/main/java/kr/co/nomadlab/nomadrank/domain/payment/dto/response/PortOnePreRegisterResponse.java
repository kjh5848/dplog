package kr.co.nomadlab.nomadrank.domain.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * ✅ PortOne 사전결제(Pre-register) 응답 DTO
 * PortOneV2Client 내부 클래스에서 외부 DTO로 분리된 버전
 */
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortOnePreRegisterResponse {

    private boolean success;              // 성공 여부
    private String paymentId;             // 결제 ID
    private String status;                // 결제 상태 (PREPARED 등)
    private BigDecimal totalAmount;       // 총 결제 금액
    private String currency;              // 통화 코드 (기본: KRW)
    private OffsetDateTime preparedAt;    // 사전결제 완료 시각
    private String rawResponse;           // 포트원 API 원문 응답 (디버깅용)

    
}