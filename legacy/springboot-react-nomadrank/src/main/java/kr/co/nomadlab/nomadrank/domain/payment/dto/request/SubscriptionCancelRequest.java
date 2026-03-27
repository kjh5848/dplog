package kr.co.nomadlab.nomadrank.domain.payment.dto.request;

import org.springframework.util.StringUtils;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionCancelReasonCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 구독 해지 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
public class SubscriptionCancelRequest {

    @NotNull(message = "해지 사유 코드는 필수입니다.")
    private SubscriptionCancelReasonCode reasonCode;

    @Size(max = 200, message = "해지 사유 추가 설명은 200자 이하여야 합니다.")
    private String reasonDetail;

    @Size(max = 191, message = "operationId는 191자 이하여야 합니다.")
    private String operationId;

    public String buildPortOneReason() {
        if (!StringUtils.hasText(reasonDetail)) {
            return reasonCode.name();
        }
        return reasonCode.name() + ":" + reasonDetail.trim();
    }
}
