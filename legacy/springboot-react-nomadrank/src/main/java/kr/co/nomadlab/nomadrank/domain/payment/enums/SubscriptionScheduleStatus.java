package kr.co.nomadlab.nomadrank.domain.payment.enums;

/**
 * 정기 결제 예약 상태
 */
public enum SubscriptionScheduleStatus {
    PENDING,
    CONFIRMED,
    FAILED,
    CANCELLED,
    MISSING,
    UNKNOWN
}
