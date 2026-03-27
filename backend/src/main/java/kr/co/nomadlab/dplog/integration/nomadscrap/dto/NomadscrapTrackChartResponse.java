package kr.co.nomadlab.dplog.integration.nomadscrap.dto;

import com.fasterxml.jackson.databind.JsonNode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 내순이 postTrackChart 응답 DTO
 * - 순위 차트 데이터 (키워드별 일별 순위 + 리뷰수 + 저장수)
 * - Map 키: "[지역]키워드" 형식 (예: "[서울]강남맛집")
 */
public record NomadscrapTrackChartResponse(
        Integer code,
        String message,
        TrackChartData data
) {
    public record TrackChartData(
            Map<String, TrackChartInfo> nplaceRankTrackInfoMap
    ) {}

    public record TrackChartInfo(
            Long id,
            String keyword,
            String province,
            String shopId,
            Integer rankChange,
            List<TrackChartItem> nplaceRankTrackList,
            JsonNode json
    ) {}

    /** 일별 순위 추적 데이터 */
    public record TrackChartItem(
            Integer rank,
            Integer prevRank,
            String visitorReviewCount,
            String blogReviewCount,
            String scoreInfo,
            String saveCount,
            String ampm,
            Boolean isValid,
            LocalDateTime chartDate,
            LocalDateTime createDate
    ) {}
}
