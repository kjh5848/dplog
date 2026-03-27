package kr.co.nomadlab.nomadrank.domain.payment.enums;

public enum PaymentType {
    INITIAL,      // 최초 결제 (빌링키 발급 시)
    RECURRING,    // 정기 결제
    RETRY,        // 재시도 결제
    ONE_TIME,     // 일회성 결제
    UPGRADE,      // 업그레이드 차액 결제
    DOWNGRADE     // 다운그레이드/크레딧 발생 결제
}
