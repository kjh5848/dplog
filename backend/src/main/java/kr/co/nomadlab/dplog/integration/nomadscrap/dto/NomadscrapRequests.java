package kr.co.nomadlab.dplog.integration.nomadscrap.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 내순이 요청 DTO 모음
 * - 내순이 서버 호출 시 사용하는 요청 바디 record
 */
public class NomadscrapRequests {

    /** postTrack — 순위 트래킹 등록 요청 */
    public record TrackRequest(
            TrackRequestInfo nplaceRankTrackInfo
    ) {
        public record TrackRequestInfo(
                String keyword,
                String province,
                String businessSector,
                String shopId
        ) {}
    }

    /** postTrackChart — 순위 차트 조회 요청 */
    public record TrackChartRequest(
            List<TrackChartRequestInfo> nplaceRankTrackInfoList
    ) {
        public record TrackChartRequestInfo(
                Long id,
                LocalDateTime trackStartDate
        ) {}
    }

    /** postTrackInfo — 트래킹 정보 동기화 요청 */
    public record TrackInfoRequest(
            List<Long> nplaceRankTrackInfoIdList
    ) {}
}
