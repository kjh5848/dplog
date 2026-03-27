package kr.co.nomadlab.nomadrank.domain.payment.enums;

/**
     * 구독 상태 열거형
     */
    public enum SubscriptionStatus {
        PENDING,        // 결제 대기
        ACTIVE,         // 활성
        CANCELLED,      // 취소됨
        SUSPENDED,      // 일시정지 (결제 실패로 인한)
        EXPIRED,        // 만료
        PENDING_CANCEL  // 취소 예약 (다음 결제일까지 유효)
    }
