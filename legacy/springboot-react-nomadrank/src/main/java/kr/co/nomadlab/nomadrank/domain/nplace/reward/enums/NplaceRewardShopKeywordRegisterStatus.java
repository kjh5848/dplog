package kr.co.nomadlab.nomadrank.domain.nplace.reward.enums;

import lombok.Getter;

@Getter
public enum NplaceRewardShopKeywordRegisterStatus {
    REQUESTED("신청"),
    APPROVED("승인");

    private final String value;

    NplaceRewardShopKeywordRegisterStatus(String value) {
        this.value = value;
    }
}
