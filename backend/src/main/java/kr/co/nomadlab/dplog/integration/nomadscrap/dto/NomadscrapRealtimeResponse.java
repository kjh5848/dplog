package kr.co.nomadlab.dplog.integration.nomadscrap.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * 내순이 getRealtime 응답 DTO
 * - 실시간 순위 조회 결과 (키워드+지역 → 가게 리스트+순위)
 * - 응답 구조: { code, message, data: { nplaceRankSearchShopList: [JsonNode...] } }
 *
 * 각 JsonNode 구조:
 * { trackInfo: { shopId, shopName, shopImageUrl, ... }, rankInfo: { rank, totalCount } }
 */
public record NomadscrapRealtimeResponse(
        Integer code,
        String message,
        RealtimeData data
) {
    public record RealtimeData(
            List<JsonNode> nplaceRankSearchShopList
    ) {}
}
