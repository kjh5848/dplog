package kr.co.nomadlab.nomadrank.domain.nplace.reward.enums;

import lombok.Getter;

@Getter
public enum NplaceCampaignStatus {
    WAIT("대기"),
    PROGRESS("진행중"),
    COMPLETE("완료"),
    REJECT("거부");

    private final String value;

    NplaceCampaignStatus(String value) {
        this.value = value;
    }

}
