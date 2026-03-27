package kr.co.nomadlab.nomadrank.domain.nplace.reward.enums;

import lombok.Getter;

@Getter
public enum NplaceRewardProduct {
    SAVE("저장하기"),
    TRAFFIC("트래픽"),
    BLOG("블로그 체험단");

    private final String value;

    NplaceRewardProduct(String value) {
        this.value = value;
    }

}
