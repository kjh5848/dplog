package kr.co.nomadlab.nomadrank.domain.nplace.reward.enums;

import lombok.Getter;

@Getter
public enum NplaceCampaignBlogWritersPostingType {
    INFORMATION("정보성"),
    REVIEW("후기성"),
    FREE("자유로운 글");

    private final String value;

    NplaceCampaignBlogWritersPostingType(String value) {
        this.value = value;
    }
}
