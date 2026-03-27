package kr.co.nomadlab.dplog.integration.nsearchad.dto;

import java.util.List;

/**
 * 네이버 검색광고 API keywordstool 응답 DTO
 * - 레거시: ResNsearchadKeywordstoolDTO
 */
public record NsearchadKeywordResponse(
        List<KeywordItem> keywordList
) {
    /**
     * 연관 키워드 정보
     */
    public record KeywordItem(
            /** 연관 키워드 */
            String relKeyword,
            /** 월간 PC 검색량 */
            String monthlyPcQcCnt,
            /** 월간 모바일 검색량 */
            String monthlyMobileQcCnt,
            /** 월간 평균 PC 클릭수 */
            Double monthlyAvePcClkCnt,
            /** 월간 평균 모바일 클릭수 */
            Double monthlyAveMobileClkCnt,
            /** 월간 평균 PC CTR */
            Double monthlyAvePcCtr,
            /** 월간 평균 모바일 CTR */
            Double monthlyAveMobileCtr,
            /** 플레이스 평균 노출 깊이 */
            Integer plAvgDepth,
            /** 경쟁 지수 (높음/중간/낮음) */
            String compIdx
    ) {}

    /**
     * 빈 응답 팩토리 메서드
     */
    public static NsearchadKeywordResponse empty() {
        return new NsearchadKeywordResponse(List.of());
    }
}
