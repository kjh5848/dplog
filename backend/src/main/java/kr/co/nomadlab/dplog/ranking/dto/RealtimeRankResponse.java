package kr.co.nomadlab.dplog.ranking.dto;

import kr.co.nomadlab.dplog.integration.nomadscrap.NomadscrapService;

/**
 * 실시간 순위 응답 DTO
 * - 내순이 getRealtime 목데이터 매핑
 */
public record RealtimeRankResponse(
        String shopId,
        String shopName,
        String shopImageUrl,
        String category,
        String address,
        String roadAddress,
        String visitorReviewCount,
        String blogReviewCount,
        String scoreInfo,
        String saveCount,
        Integer rank,
        Integer totalCount
) {
    /** NomadscrapService.RealtimeShopRank → DTO 변환 */
    public static RealtimeRankResponse from(NomadscrapService.RealtimeShopRank shop) {
        return new RealtimeRankResponse(
                shop.shopId(), shop.shopName(), shop.shopImageUrl(),
                shop.category(), shop.address(), shop.roadAddress(),
                shop.visitorReviewCount(), shop.blogReviewCount(),
                shop.scoreInfo(), shop.saveCount(),
                shop.rank(), shop.totalCount()
        );
    }
}
