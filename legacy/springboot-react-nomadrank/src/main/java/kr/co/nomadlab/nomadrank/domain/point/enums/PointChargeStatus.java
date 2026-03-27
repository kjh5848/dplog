package kr.co.nomadlab.nomadrank.domain.point.enums;

import lombok.Getter;

@Getter
public enum PointChargeStatus {
    WAIT("대기"),
    CONFIRM("승인"),
    REJECT("거부"),
    DEPOSIT("충전"),
    WITHDRAW("차감"),
    USE("사용");

    private final String value;

    PointChargeStatus(String value) {
        this.value = value;
    }
}
