package kr.co.nomadlab.dplog.report.dto;

import kr.co.nomadlab.dplog.ranking.dto.RankingSnapshotResponse;
import kr.co.nomadlab.dplog.report.domain.DiagnosisRequest;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 진단 전체 결과 응답 DTO (스냅샷 + 순위 항목 포함)
 */
public record DiagnosisResultResponse(
        Long jobId,
        String status,
        Long storeId,
        Long keywordSetId,
        LocalDateTime createdAt,
        LocalDateTime completedAt,
        String errorMessage,
        List<RankingSnapshotResponse> snapshots
) {
    /** 엔티티 → DTO 변환 */
    public static DiagnosisResultResponse from(DiagnosisRequest request,
                                                List<RankingSnapshotResponse> snapshots) {
        return new DiagnosisResultResponse(
                request.getId(),
                request.getStatus().name(),
                request.getStoreId(),
                request.getKeywordSetId(),
                request.getCreatedAt(),
                request.getFinishedAt(),
                request.getErrorMessage(),
                snapshots
        );
    }
}
