package kr.co.nomadlab.dplog.integration.nomadscrap;

import kr.co.nomadlab.dplog.integration.nomadscrap.dto.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.service.annotation.DeleteExchange;
import org.springframework.web.service.annotation.GetExchange;
import org.springframework.web.service.annotation.HttpExchange;
import org.springframework.web.service.annotation.PostExchange;

/**
 * 내순이(NomadScrap) Declarative HTTP Client
 * - 전체 7개 API 정의
 */
@HttpExchange
public interface NomadscrapClient {

    /** #1 가게 메타 정보 조회 (플레이스 URL → trackInfo) */
    @GetExchange("/v1/nplace/rank/trackable")
    NomadscrapTrackableResponse getTrackable(
            @RequestParam String apiKey,
            @RequestParam String url
    );

    /** #2 실시간 순위 조회 (키워드+지역 → 가게 리스트+순위) */
    @GetExchange("/v1/nplace/rank/realtime")
    NomadscrapRealtimeResponse getRealtime(
            @RequestParam String apiKey,
            @RequestParam String keyword,
            @RequestParam String province,
            @RequestParam String shopId
    );

    /** #3 순위 트래킹 등록 */
    @PostExchange("/v1/nplace/rank/track")
    NomadscrapTrackResponse postTrack(
            @RequestParam String apiKey,
            @RequestBody NomadscrapRequests.TrackRequest request
    );

    /** #4 순위 차트 조회 (일별 순위 추적 데이터) */
    @PostExchange("/v1/nplace/rank/track/chart")
    NomadscrapTrackChartResponse postTrackChart(
            @RequestParam String apiKey,
            @RequestBody NomadscrapRequests.TrackChartRequest request
    );

    /** #5 트래킹 정보 동기화 */
    @PostExchange("/v1/nplace/rank/track/info")
    NomadscrapTrackInfoResponse postTrackInfo(
            @RequestParam String apiKey,
            @RequestBody NomadscrapRequests.TrackInfoRequest request
    );

    /** #6 트래킹 상태 조회 */
    @GetExchange("/v1/nplace/rank/track/state")
    NomadscrapTrackStateResponse getTrackState(
            @RequestParam String apiKey,
            @RequestParam String shopId
    );

    /** #7 트래킹 삭제 */
    @DeleteExchange("/v1/nplace/rank/track/{trackInfoId}")
    void deleteTrack(
            @RequestParam String apiKey,
            @PathVariable Long trackInfoId
    );
}
