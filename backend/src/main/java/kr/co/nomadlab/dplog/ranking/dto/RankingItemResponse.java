package kr.co.nomadlab.dplog.ranking.dto;

import kr.co.nomadlab.dplog.ranking.domain.RankingItem;

/**
 * 순위 항목 응답 DTO
 */
public record RankingItemResponse(
        Long id,
        String keyword,
        Integer rank,
        Integer delta,
        Integer searchVolume,
        String positionMeta
) {
    /** 엔티티 → DTO 변환 */
    public static RankingItemResponse from(RankingItem item) {
        return new RankingItemResponse(
                item.getId(),
                item.getKeyword(),
                item.getRank(),
                item.getDelta(),
                item.getSearchVolume(),
                item.getPositionMeta()
        );
    }
}
