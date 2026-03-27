package kr.co.nomadlab.dplog.ranking.service;

import kr.co.nomadlab.dplog.common.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * 키워드 유효성 검증기
 * - 중복 제거
 * - 공백/빈 문자열 필터링
 * - 길이 제한 (1~30자)
 * - 키워드 개수 제한 (1~10개)
 * - 금칙어 검사
 */
@Component
public class KeywordValidator {

    /** 키워드 최소 길이 */
    private static final int MIN_KEYWORD_LENGTH = 1;

    /** 키워드 최대 길이 */
    private static final int MAX_KEYWORD_LENGTH = 30;

    /** 키워드 세트 최대 개수 */
    private static final int MAX_KEYWORD_COUNT = 10;

    /** 금칙어 목록 (추후 DB/설정파일에서 로드 가능) */
    private static final Set<String> BANNED_WORDS = Set.of(
            "도박", "불법", "성인", "약물", "마약",
            "사행", "카지노", "대출", "사기"
    );

    /**
     * 키워드 목록 유효성 검증 및 정제
     *
     * @param rawKeywords 원본 키워드 목록
     * @return 정제된 키워드 목록 (중복 제거, 공백 제거, trim 완료)
     * @throws BusinessException 유효성 검증 실패 시
     */
    public List<String> validateAndSanitize(List<String> rawKeywords) {
        if (rawKeywords == null || rawKeywords.isEmpty()) {
            throw BusinessException.badRequest("키워드 목록은 최소 1개 이상이어야 합니다.");
        }

        // 1. 공백 제거 + trim + 빈 문자열 필터링 + 중복 제거
        List<String> sanitized = rawKeywords.stream()
                .map(String::trim)
                .filter(k -> !k.isEmpty())
                .distinct()
                .toList();

        // 2. 정제 후 빈 목록 확인
        if (sanitized.isEmpty()) {
            throw BusinessException.badRequest("유효한 키워드가 없습니다. 공백이 아닌 키워드를 입력해주세요.");
        }

        // 3. 키워드 개수 제한
        if (sanitized.size() > MAX_KEYWORD_COUNT) {
            throw BusinessException.badRequest(
                    "키워드는 최대 " + MAX_KEYWORD_COUNT + "개까지 등록할 수 있습니다. (현재: " + sanitized.size() + "개)");
        }

        // 4. 개별 키워드 검증
        List<String> bannedFound = new ArrayList<>();
        for (String keyword : sanitized) {
            // 길이 검증
            if (keyword.length() < MIN_KEYWORD_LENGTH || keyword.length() > MAX_KEYWORD_LENGTH) {
                throw BusinessException.badRequest(
                        "키워드 '" + keyword + "'는 " + MIN_KEYWORD_LENGTH + "~" + MAX_KEYWORD_LENGTH + "자 이내여야 합니다.");
            }

            // 금칙어 검사
            for (String banned : BANNED_WORDS) {
                if (keyword.contains(banned)) {
                    bannedFound.add(keyword + " (금칙어: " + banned + ")");
                }
            }
        }

        if (!bannedFound.isEmpty()) {
            throw BusinessException.badRequest(
                    "금칙어가 포함된 키워드가 있습니다: " + String.join(", ", bannedFound));
        }

        return sanitized;
    }

    /**
     * 유효성 검증 결과 요약 정보 생성 (JSON 형태)
     *
     * @param originalCount 원본 키워드 수
     * @param sanitizedCount 정제 후 키워드 수
     * @param removedDuplicates 제거된 중복 수
     * @return 검증 정보 JSON 문자열
     */
    public String generateValidationInfo(int originalCount, int sanitizedCount, int removedDuplicates) {
        return "{\"originalCount\":" + originalCount
                + ",\"sanitizedCount\":" + sanitizedCount
                + ",\"removedDuplicates\":" + removedDuplicates + "}";
    }
}
