package kr.co.nomadlab.dplog.ranking.dto;

import kr.co.nomadlab.dplog.integration.nsearchad.dto.NsearchadKeywordResponse;

import java.util.List;

/**
 * 연관 키워드 추천 응답 DTO
 * - nsearchad API 응답을 프론트엔드 친화적으로 변환
 */
public record KeywordSuggestResponse(
        /** 힌트 키워드 (사용자 입력) */
        String hintKeyword,
        /** 연관 키워드 목록 */
        List<SuggestedKeyword> keywords
) {
    /**
     * 추천 키워드 정보
     */
    public record SuggestedKeyword(
            /** 연관 키워드 */
            String keyword,
            /** 월간 PC 검색량 */
            String monthlyPcSearchCount,
            /** 월간 모바일 검색량 */
            String monthlyMobileSearchCount,
            /** 경쟁 지수 (높음/중간/낮음) */
            String competitionIndex
    ) {}

    /**
     * NsearchadKeywordResponse → KeywordSuggestResponse 변환
     */
    public static KeywordSuggestResponse from(String hintKeyword, NsearchadKeywordResponse nsResponse) {
        List<SuggestedKeyword> keywords = List.of();

        if (nsResponse.keywordList() != null) {
            keywords = nsResponse.keywordList().stream()
                    .map(item -> new SuggestedKeyword(
                            item.relKeyword(),
                            item.monthlyPcQcCnt(),
                            item.monthlyMobileQcCnt(),
                            item.compIdx()
                    ))
                    .toList();
        }

        return new KeywordSuggestResponse(hintKeyword, keywords);
    }

    /**
     * 빈 응답 팩토리 메서드
     */
    public static KeywordSuggestResponse empty(String hintKeyword) {
        return new KeywordSuggestResponse(hintKeyword, List.of());
    }
}
