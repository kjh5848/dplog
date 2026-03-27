package kr.co.nomadlab.nomadrank.domain.payment.enums;

public enum PaymentStatus {
    PENDING, // 결제 대기
    PAID, // 결제 완료
    FAILED, // 결제 실패
    CANCELLED, // 결제 취소
    PARTIAL_CANCELLED, // 부분 취소
    REFUNDED // 환불 완료
}
