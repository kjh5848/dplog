package kr.co.nomadlab.dplog.integration.nomadscrap.dto;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * 내순이 getTrackable 응답 DTO
 * - 레거시: ResNomadscrapNplaceRankGetTrackableDTO
 * - 응답 구조: { code, message, data: { nplaceRankShop: JsonNode } }
 */
public record NomadscrapTrackableResponse(
        Integer code,
        String message,
        TrackableData data
) {
    /**
     * 내순이 응답 데이터
     * - nplaceRankShop: 가게 메타 정보 (shopName, category, address, shopImageUrl 등)
     */
    public record TrackableData(
            JsonNode nplaceRankShop
    ) {}
}
