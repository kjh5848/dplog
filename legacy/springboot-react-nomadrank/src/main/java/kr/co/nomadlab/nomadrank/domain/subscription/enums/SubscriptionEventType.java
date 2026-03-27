package kr.co.nomadlab.nomadrank.domain.subscription.enums;

/**
 * 구독 관련 이벤트 유형
 */
public enum SubscriptionEventType {
    PAYMENT_PAID,
    PAYMENT_FAILED,
    SCHEDULE_CREATED,
    SCHEDULE_DELETED,
    USER_CANCEL_REQUESTED,
    DOWNGRADE_SCHEDULED,
    UPGRADE_REQUESTED,
    BILLING_KEY_DELETED,
    EXPIRE,
    MANUAL_SUSPEND,
    MANUAL_RESUME
}
