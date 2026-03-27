package kr.co.nomadlab.nomadrank.domain.nplace.reward.enums;

import lombok.Getter;

@Getter
public enum NplaceCampaignBlogWritersCoType {
    NAME("업체명"),
    KEYWORD("메인 키워드"),
    NAME_KEYWORD("메인 키워드 + 업체명");

    private final String value;

    NplaceCampaignBlogWritersCoType(String value) {
        this.value = value;
    }
}
