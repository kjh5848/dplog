package kr.co.nomadlab.dplog.integration.nomadscrap.dto;

import java.util.List;

/**
 * 내순이 getTrackState 응답 DTO
 * - 트래킹 상태 조회 (전체/완료 개수 + 완료 목록)
 */
public record NomadscrapTrackStateResponse(
        Integer code,
        String message,
        TrackStateData data
) {
    public record TrackStateData(
            Integer totalTrackInfoCount,
            Integer completedTrackInfoCount,
            List<TrackStateInfo> completedTrackInfoList
    ) {}

    public record TrackStateInfo(
            String keyword,
            String province
    ) {}
}
