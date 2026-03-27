package kr.co.nomadlab.nomadrank.domain.nplace.rank.enums;

public enum NplaceRankShopTrackInfoStatus {
    RUNNING("사용중"),
    STOP("중지");

    private final String value;

    NplaceRankShopTrackInfoStatus(String value) {
        this.value = value;
    }
}
