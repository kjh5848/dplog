package kr.co.nomadlab.dplog.ranking.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * 키워드 세트 생성 요청 DTO
 */
public record KeywordSetCreateRequest(
        @NotEmpty(message = "키워드 목록은 최소 1개 이상이어야 합니다.")
        @Size(max = 10, message = "키워드는 최대 10개까지 등록할 수 있습니다.")
        List<String> keywords
) {}
