package kr.co.nomadlab.nomadrank.domain.auth.enums;

import lombok.Getter;

@Getter
public enum UserStatus {
    COMPLETION("승인"),
    WAITING("대기"),
    STOP("중지"),
    WITHDRAW("탈퇴");

    private final String value;

    UserStatus(String value) {
        this.value = value;
    }

}
