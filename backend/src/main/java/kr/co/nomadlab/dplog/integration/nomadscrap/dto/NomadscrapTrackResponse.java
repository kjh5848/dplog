package kr.co.nomadlab.dplog.integration.nomadscrap.dto;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * 내순이 postTrack 응답 DTO
 * - 순위 트래킹 등록 결과
 */
public record NomadscrapTrackResponse(
        Integer code,
        String message,
        TrackData data
) {
    public record TrackData(
            TrackInfo nplaceRankTrackInfo
    ) {}

    public record TrackInfo(
            Long id,
            String keyword,
            String province,
            String businessSector,
            String shopId,
            Integer rankChange,
            JsonNode json
    ) {}
}
