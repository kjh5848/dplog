package kr.co.nomadlab.dplog.report.dto;

import jakarta.validation.constraints.NotNull;

/**
 * 진단 요청 생성 DTO
 * - storeId는 PathVariable로 수신
 */
public record DiagnosisCreateRequest(
        @NotNull(message = "키워드 세트 ID는 필수입니다") Long keywordSetId
) {}
