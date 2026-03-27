package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.enums;

import lombok.Getter;

@Getter
public enum NplaceRewardBlogWritersType {
    VERIFIED("실명 인증 참여 블로그 기자단"),
    AI("AI 블로그 기자단");

    private final String value;

    NplaceRewardBlogWritersType(String value) {
        this.value = value;
    }

}
