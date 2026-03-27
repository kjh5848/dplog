package kr.co.nomadlab.nomadrank.domain.use_log.enums;

public enum ServiceSort {
    NPLACE_RANK_REALTIME("realtimeQueries", "N플레이스 실시간순위조회"),
    NPLACE_RANK_TRACK("trackKeywords", "N플레이스 순위추적"),
    NPLACE_KEYWORD_RELATION("relationKeywords", "N플레이스 연관키워드"),
    NPLACE_KEYWORD("keywordLookups", "N플레이스 키워드조회"),
    NPLACE_SHOP_REGISTER("shopRegistrations", "업체 등록 개수"),
    BLOG_QUALITY_CHECK("blogQualityChecks", "블로그 저품질 조회"),
    NPLACE_REVIEW_REPLY("reviewReplies", "리뷰 답글");

    private final String usageKey;
    private final String value;

    ServiceSort(String usageKey, String value) {
        this.usageKey = usageKey;
        this.value = value;
    }

    public String getUsageKey() {
        return usageKey;
    }

    public String getValue() {
        return value;
    }
}
