package kr.co.nomadlab.dplog.ranking.dto;

import kr.co.nomadlab.dplog.ranking.domain.KeywordSet;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

/**
 * 키워드 세트 응답 DTO
 */
public record KeywordSetResponse(
        Long id,
        Long storeId,
        List<String> keywords,
        String validationInfo,
        LocalDateTime createdAt
) {

    /** KeywordSet 엔티티 → KeywordSetResponse 변환 팩토리 메서드 */
    public static KeywordSetResponse from(KeywordSet keywordSet) {
        // 쉼표 구분 키워드 문자열 → List 변환
        List<String> keywordList = Arrays.stream(keywordSet.getKeywords().split(","))
                .map(String::trim)
                .filter(k -> !k.isEmpty())
                .toList();

        return new KeywordSetResponse(
                keywordSet.getId(),
                keywordSet.getStoreId(),
                keywordList,
                keywordSet.getValidationInfo(),
                keywordSet.getCreatedAt()
        );
    }
}
