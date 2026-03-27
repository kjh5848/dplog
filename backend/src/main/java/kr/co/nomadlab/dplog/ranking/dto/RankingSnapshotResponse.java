package kr.co.nomadlab.dplog.ranking.dto;

import kr.co.nomadlab.dplog.ranking.domain.RankingItem;
import kr.co.nomadlab.dplog.ranking.domain.RankingSnapshot;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 순위 스냅샷 응답 DTO (순위 항목 포함)
 */
public record RankingSnapshotResponse(
        Long id,
        LocalDateTime capturedAt,
        List<RankingItemResponse> items
) {
    /** 엔티티 → DTO 변환 */
    public static RankingSnapshotResponse from(RankingSnapshot snapshot, List<RankingItem> items) {
        return new RankingSnapshotResponse(
                snapshot.getId(),
                snapshot.getCapturedAt(),
                items.stream().map(RankingItemResponse::from).toList()
        );
    }
}
