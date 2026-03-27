package kr.co.nomadlab.dplog.ranking.service;

import kr.co.nomadlab.dplog.integration.nomadscrap.NomadscrapService;
import kr.co.nomadlab.dplog.ranking.dto.*;
import kr.co.nomadlab.dplog.store.domain.Store;
import kr.co.nomadlab.dplog.store.service.StoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 순위 조회/트래킹 서비스
 * - NomadscrapService를 위임하여 순위 관련 비즈니스 로직 수행
 * - 가게 소유자 검증 포함
 */
@Service
public class RankingService {

    private static final Logger log = LoggerFactory.getLogger(RankingService.class);

    private final NomadscrapService nomadscrapService;
    private final StoreService storeService;

    public RankingService(NomadscrapService nomadscrapService, StoreService storeService) {
        this.nomadscrapService = nomadscrapService;
        this.storeService = storeService;
    }

    /**
     * 실시간 순위 조회
     */
    public List<RealtimeRankResponse> getRealtime(Long storeId, String keyword, String province) {
        Store store = storeService.findStoreOrThrow(storeId);
        String shopId = store.getShopId() != null ? store.getShopId() : "37567285";

        return nomadscrapService.fetchRealtime(keyword, province, shopId).stream()
                .map(RealtimeRankResponse::from)
                .toList();
    }

    /**
     * 트래킹 등록
     */
    public TrackRegistrationResponse registerTrack(Long memberId, Long storeId,
                                                    String keyword, String province) {
        Store store = storeService.findStoreOrThrow(storeId);
        String shopId = store.getShopId() != null ? store.getShopId() : "37567285";
        String businessSector = store.getBusinessSector() != null ? store.getBusinessSector() : "restaurant";

        return nomadscrapService.registerTrack(keyword, province, businessSector, shopId)
                .map(TrackRegistrationResponse::from)
                .orElseThrow(() -> new RuntimeException("트래킹 등록 실패"));
    }

    /**
     * 순위 차트 조회 (30일 일별 데이터)
     */
    public TrackChartResponse getTrackChart(Long storeId, List<Long> trackInfoIds, LocalDateTime startDate) {
        storeService.findStoreOrThrow(storeId);

        LocalDateTime start = (startDate != null) ? startDate : LocalDateTime.now().minusDays(30);
        Map<String, NomadscrapService.TrackChartData> chartMap =
                nomadscrapService.fetchTrackChart(trackInfoIds, start);

        return TrackChartResponse.from(chartMap);
    }

    /**
     * 트래킹 정보 목록 조회
     */
    public List<TrackRegistrationResponse> getTrackInfoList(Long storeId) {
        storeService.findStoreOrThrow(storeId);

        // 목데이터에서는 ID 1~10 자동 할당
        List<Long> defaultIds = List.of(1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L);
        return nomadscrapService.fetchTrackInfoList(defaultIds).stream()
                .map(TrackRegistrationResponse::from)
                .toList();
    }

    /**
     * 트래킹 상태 조회
     */
    public TrackStateResponse getTrackState(Long storeId) {
        Store store = storeService.findStoreOrThrow(storeId);
        String shopId = store.getShopId() != null ? store.getShopId() : "37567285";

        return TrackStateResponse.from(nomadscrapService.fetchTrackState(shopId));
    }

    /**
     * 트래킹 삭제
     */
    public boolean deleteTrack(Long memberId, Long storeId, Long trackInfoId) {
        storeService.findStoreOrThrow(storeId);
        return nomadscrapService.deleteTrack(trackInfoId);
    }
}
