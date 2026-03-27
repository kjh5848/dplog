package kr.co.nomadlab.nomadrank.domain.payment.enums;

import com.fasterxml.jackson.annotation.JsonCreator;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;

/**
 * 구독 해지 사유 코드
 */
public enum SubscriptionCancelReasonCode {
    PRICE,
    USAGE_LOW,
    FEATURE_LACK,
    BUGS,
    SUPPORT,
    SWITCH,
    ETC;

    @JsonCreator
    public static SubscriptionCancelReasonCode from(String value) {
        if (value == null) {
            return null;
        }
        try {
            return SubscriptionCancelReasonCode.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("지원하지 않는 구독 해지 사유 코드입니다: " + value);
        }
    }
}
