package kr.co.nomadlab.dplog.report.dto;

import kr.co.nomadlab.dplog.report.domain.DiagnosisRequest;

import java.time.LocalDateTime;

/**
 * 진단 상태 폴링 응답 DTO
 */
public record DiagnosisStatusResponse(
        Long jobId,
        String status,
        LocalDateTime createdAt,
        LocalDateTime startedAt,
        LocalDateTime finishedAt,
        String errorMessage
) {
    /** 엔티티 → DTO 변환 */
    public static DiagnosisStatusResponse from(DiagnosisRequest request) {
        return new DiagnosisStatusResponse(
                request.getId(),
                request.getStatus().name(),
                request.getCreatedAt(),
                request.getStartedAt(),
                request.getFinishedAt(),
                request.getErrorMessage()
        );
    }
}
