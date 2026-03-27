package kr.co.nomadlab.dplog.store.dto;

import kr.co.nomadlab.dplog.store.domain.Store;

import java.time.LocalDateTime;

/**
 * 가게 응답 DTO
 * - 내순이에서 수집한 메타 정보 포함
 */
public record StoreResponse(
        Long id,
        String name,
        String category,
        String address,
        String roadAddress,
        String placeUrl,
        String phone,
        String shopImageUrl,
        String shopId,
        String visitorReviewCount,
        String blogReviewCount,
        String scoreInfo,
        String saveCount,
        String businessSector,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    /** Store 엔티티 → StoreResponse 변환 팩토리 메서드 */
    public static StoreResponse from(Store store) {
        return new StoreResponse(
                store.getId(),
                store.getName(),
                store.getCategory(),
                store.getAddress(),
                store.getRoadAddress(),
                store.getPlaceUrl(),
                store.getPhone(),
                store.getShopImageUrl(),
                store.getShopId(),
                store.getVisitorReviewCount(),
                store.getBlogReviewCount(),
                store.getScoreInfo(),
                store.getSaveCount(),
                store.getBusinessSector(),
                store.getCreatedAt(),
                store.getUpdatedAt()
        );
    }
}
