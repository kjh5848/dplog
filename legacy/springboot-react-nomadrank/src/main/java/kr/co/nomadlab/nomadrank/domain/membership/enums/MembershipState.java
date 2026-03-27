package kr.co.nomadlab.nomadrank.domain.membership.enums;

import lombok.Getter;

@Getter
public enum MembershipState {
    READY("준비"),
    ACTIVATE("활성화"),
    EXPIRED("만료");

    private final String value;

    MembershipState(String value) {
        this.value = value;
    }
}
