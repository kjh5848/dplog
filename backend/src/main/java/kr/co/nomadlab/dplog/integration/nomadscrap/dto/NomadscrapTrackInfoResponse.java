package kr.co.nomadlab.dplog.integration.nomadscrap.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.util.List;

/**
 * 내순이 postTrackInfo 응답 DTO
 * - 트래킹 정보 동기화 (등록된 트래킹 목록)
 */
public record NomadscrapTrackInfoResponse(
        Integer code,
        String message,
        TrackInfoData data
) {
    public record TrackInfoData(
            List<TrackInfo> nplaceRankTrackInfoList
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
