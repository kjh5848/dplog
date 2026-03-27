package kr.co.nomadlab.dplog.integration.nomadscrap;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import kr.co.nomadlab.dplog.common.properties.AppProperties;
import kr.co.nomadlab.dplog.integration.nomadscrap.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.IntStream;

/**
 * 내순이(NomadScrap) 서비스 — 전체 7개 API
 *
 * useMock=true  → 내순이 서버 호출 없이 목데이터 반환
 * useMock=false → 실제 API 호출 (실패 시 빈 Optional/List 반환)
 *
 * 설정: application-dev.yml → dplog.nomadscrap.use-mock: true/false
 */
@Service
public class NomadscrapService {

    private static final Logger log = LoggerFactory.getLogger(NomadscrapService.class);
    private static final ObjectMapper mapper = new ObjectMapper();

    private final NomadscrapClient nomadscrapClient;
    private final AppProperties appProperties;

    /** 목데이터 키워드 10개 */
    private static final List<String> MOCK_KEYWORDS = List.of(
            "강남맛집", "역삼맛집", "강남한식", "테헤란로맛집", "강남점심",
            "역삼동맛집", "강남역맛집", "강남직장인점심", "역삼한식", "강남회식"
    );

    /** 기본 mock shopId */
    private static final String MOCK_SHOP_ID = "37567285";

    public NomadscrapService(NomadscrapClient nomadscrapClient, AppProperties appProperties) {
        this.nomadscrapClient = nomadscrapClient;
        this.appProperties = appProperties;
    }

    // ═══════════════════════════════════════════════════════
    // #1 getTrackable — 가게 메타 조회
    // ═══════════════════════════════════════════════════════

    /**
     * 플레이스 URL로 가게 메타 정보 조회
     */
    public Optional<PlaceMeta> fetchPlaceMeta(String placeUrl) {
        if (placeUrl == null || placeUrl.isBlank()) {
            return Optional.empty();
        }

        if (appProperties.nomadscrap().useMock()) {
            log.info("[MOCK] 내순이 목데이터(PlaceMeta) 반환. placeUrl={}", placeUrl);
            return Optional.of(createMockPlaceMeta(placeUrl));
        }

        String apiKey = appProperties.nomadscrap().apiKey();
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("내순이 API 키가 설정되지 않아 메타 수집을 건너뜁니다.");
            return Optional.empty();
        }

        try {
            NomadscrapTrackableResponse response = nomadscrapClient.getTrackable(apiKey, placeUrl);
            if (response == null || response.data() == null || response.data().nplaceRankShop() == null) {
                log.warn("내순이 응답이 비어있습니다. placeUrl={}", placeUrl);
                return Optional.empty();
            }

            JsonNode shop = response.data().nplaceRankShop();
            PlaceMeta meta = new PlaceMeta(
                    getTextOrNull(shop, "shopId"),
                    getTextOrNull(shop, "shopName"),
                    getTextOrNull(shop, "category"),
                    getTextOrNull(shop, "address"),
                    getTextOrNull(shop, "roadAddress"),
                    getTextOrNull(shop, "shopImageUrl"),
                    getTextOrNull(shop, "visitorReviewCount"),
                    getTextOrNull(shop, "blogReviewCount"),
                    getTextOrNull(shop, "scoreInfo"),
                    getTextOrNull(shop, "saveCount"),
                    getTextOrNull(shop, "businessSector"),
                    extractKeywordList(shop)
            );

            log.info("내순이 메타 수집 성공: shopName={}", meta.shopName());
            return Optional.of(meta);

        } catch (Exception e) {
            log.warn("내순이 메타 수집 실패: placeUrl={}, error={}", placeUrl, e.getMessage());
            return Optional.empty();
        }
    }

    // ═══════════════════════════════════════════════════════
    // #2 getRealtime — 실시간 순위 조회
    // ═══════════════════════════════════════════════════════

    /**
     * 실시간 순위 조회 (키워드+지역 → 가게 리스트+순위)
     *
     * @param keyword  검색 키워드
     * @param province 지역 (예: "서울")
     * @param shopId   내 가게 shopId
     * @return 검색 결과 가게 리스트 (각각 trackInfo + rankInfo)
     */
    public List<RealtimeShopRank> fetchRealtime(String keyword, String province, String shopId) {
        if (appProperties.nomadscrap().useMock()) {
            log.info("[MOCK] 실시간 순위 목데이터 반환. keyword={}, province={}", keyword, province);
            return createMockRealtimeList(keyword, province, shopId);
        }

        try {
            String apiKey = appProperties.nomadscrap().apiKey();
            NomadscrapRealtimeResponse response = nomadscrapClient.getRealtime(apiKey, keyword, province, shopId);
            if (response == null || response.data() == null || response.data().nplaceRankSearchShopList() == null) {
                return List.of();
            }

            return response.data().nplaceRankSearchShopList().stream()
                    .map(this::parseRealtimeShop)
                    .toList();

        } catch (Exception e) {
            log.warn("실시간 순위 조회 실패: keyword={}, error={}", keyword, e.getMessage());
            return List.of();
        }
    }

    // ═══════════════════════════════════════════════════════
    // #3 postTrack — 순위 트래킹 등록
    // ═══════════════════════════════════════════════════════

    /**
     * 키워드+지역 순위 트래킹 등록
     */
    public Optional<TrackRegistration> registerTrack(String keyword, String province,
                                                     String businessSector, String shopId) {
        if (appProperties.nomadscrap().useMock()) {
            log.info("[MOCK] 트래킹 등록 목데이터 반환. keyword={}, shopId={}", keyword, shopId);
            int index = MOCK_KEYWORDS.indexOf(keyword);
            long mockId = (index >= 0) ? index + 1 : ThreadLocalRandom.current().nextLong(100, 999);
            return Optional.of(new TrackRegistration(mockId, keyword, province, businessSector, shopId, 0));
        }

        try {
            String apiKey = appProperties.nomadscrap().apiKey();
            var request = new NomadscrapRequests.TrackRequest(
                    new NomadscrapRequests.TrackRequest.TrackRequestInfo(keyword, province, businessSector, shopId)
            );
            NomadscrapTrackResponse response = nomadscrapClient.postTrack(apiKey, request);
            if (response == null || response.data() == null || response.data().nplaceRankTrackInfo() == null) {
                return Optional.empty();
            }

            var info = response.data().nplaceRankTrackInfo();
            return Optional.of(new TrackRegistration(
                    info.id(), info.keyword(), info.province(),
                    info.businessSector(), info.shopId(), info.rankChange()
            ));

        } catch (Exception e) {
            log.warn("트래킹 등록 실패: keyword={}, error={}", keyword, e.getMessage());
            return Optional.empty();
        }
    }

    // ═══════════════════════════════════════════════════════
    // #4 postTrackChart — 순위 차트 (핵심!)
    // ═══════════════════════════════════════════════════════

    /**
     * 키워드별 일별 순위 차트 데이터 조회
     * - 10개 키워드 × 30일 = 300건의 일별 데이터
     *
     * @param trackInfoIds     트래킹 ID 목록
     * @param trackStartDate   시작 날짜
     * @return Map<"[지역]키워드", TrackChartData>
     */
    public Map<String, TrackChartData> fetchTrackChart(List<Long> trackInfoIds, LocalDateTime trackStartDate) {
        if (appProperties.nomadscrap().useMock()) {
            log.info("[MOCK] 순위 차트 목데이터 반환. trackInfoIds={}", trackInfoIds);
            return createMockTrackChart(trackInfoIds, trackStartDate);
        }

        try {
            String apiKey = appProperties.nomadscrap().apiKey();
            var reqList = trackInfoIds.stream()
                    .map(id -> new NomadscrapRequests.TrackChartRequest.TrackChartRequestInfo(id, trackStartDate))
                    .toList();
            var request = new NomadscrapRequests.TrackChartRequest(reqList);

            NomadscrapTrackChartResponse response = nomadscrapClient.postTrackChart(apiKey, request);
            if (response == null || response.data() == null || response.data().nplaceRankTrackInfoMap() == null) {
                return Map.of();
            }

            Map<String, TrackChartData> result = new LinkedHashMap<>();
            response.data().nplaceRankTrackInfoMap().forEach((key, info) -> {
                List<DailyRankData> dailyList = info.nplaceRankTrackList().stream()
                        .map(item -> new DailyRankData(
                                item.rank(), item.prevRank(),
                                item.visitorReviewCount(), item.blogReviewCount(),
                                item.scoreInfo(), item.saveCount(),
                                item.ampm(), item.isValid(), item.chartDate()
                        )).toList();

                result.put(key, new TrackChartData(
                        info.id(), info.keyword(), info.province(),
                        info.shopId(), info.rankChange(), dailyList
                ));
            });
            return result;

        } catch (Exception e) {
            log.warn("순위 차트 조회 실패: error={}", e.getMessage());
            return Map.of();
        }
    }

    // ═══════════════════════════════════════════════════════
    // #5 postTrackInfo — 트래킹 정보 동기화
    // ═══════════════════════════════════════════════════════

    /**
     * 등록된 트래킹 목록 동기화
     */
    public List<TrackRegistration> fetchTrackInfoList(List<Long> trackInfoIds) {
        if (appProperties.nomadscrap().useMock()) {
            log.info("[MOCK] 트래킹 정보 목데이터 반환. ids={}", trackInfoIds);
            return createMockTrackInfoList();
        }

        try {
            String apiKey = appProperties.nomadscrap().apiKey();
            var request = new NomadscrapRequests.TrackInfoRequest(trackInfoIds);
            NomadscrapTrackInfoResponse response = nomadscrapClient.postTrackInfo(apiKey, request);
            if (response == null || response.data() == null || response.data().nplaceRankTrackInfoList() == null) {
                return List.of();
            }

            return response.data().nplaceRankTrackInfoList().stream()
                    .map(info -> new TrackRegistration(
                            info.id(), info.keyword(), info.province(),
                            info.businessSector(), info.shopId(), info.rankChange()
                    )).toList();

        } catch (Exception e) {
            log.warn("트래킹 정보 조회 실패: error={}", e.getMessage());
            return List.of();
        }
    }

    // ═══════════════════════════════════════════════════════
    // #6 getTrackState — 트래킹 상태
    // ═══════════════════════════════════════════════════════

    /**
     * 트래킹 수집 상태 조회
     */
    public TrackState fetchTrackState(String shopId) {
        if (appProperties.nomadscrap().useMock()) {
            log.info("[MOCK] 트래킹 상태 목데이터 반환. shopId={}", shopId);
            return createMockTrackState();
        }

        try {
            String apiKey = appProperties.nomadscrap().apiKey();
            NomadscrapTrackStateResponse response = nomadscrapClient.getTrackState(apiKey, shopId);
            if (response == null || response.data() == null) {
                return new TrackState(0, 0, List.of());
            }

            var data = response.data();
            var completedList = data.completedTrackInfoList().stream()
                    .map(info -> new TrackState.CompletedKeyword(info.keyword(), info.province()))
                    .toList();

            return new TrackState(data.totalTrackInfoCount(), data.completedTrackInfoCount(), completedList);

        } catch (Exception e) {
            log.warn("트래킹 상태 조회 실패: error={}", e.getMessage());
            return new TrackState(0, 0, List.of());
        }
    }

    // ═══════════════════════════════════════════════════════
    // #7 deleteTrack — 트래킹 삭제
    // ═══════════════════════════════════════════════════════

    /**
     * 트래킹 삭제
     */
    public boolean deleteTrack(Long trackInfoId) {
        if (appProperties.nomadscrap().useMock()) {
            log.info("[MOCK] 트래킹 삭제 목데이터 반환. trackInfoId={}", trackInfoId);
            return true;
        }

        try {
            String apiKey = appProperties.nomadscrap().apiKey();
            nomadscrapClient.deleteTrack(apiKey, trackInfoId);
            return true;

        } catch (Exception e) {
            log.warn("트래킹 삭제 실패: trackInfoId={}, error={}", trackInfoId, e.getMessage());
            return false;
        }
    }

    // ═══════════════════════════════════════════════════════
    //  목데이터 생성 로직
    // ═══════════════════════════════════════════════════════

    /** #1 — 가게 메타 목데이터 */
    private PlaceMeta createMockPlaceMeta(String placeUrl) {
        String shopId = extractShopIdFromUrl(placeUrl);
        return new PlaceMeta(
                shopId,
                "노마드랩 강남점",
                "음식점>한식",
                "서울특별시 강남구 역삼동 123-45",
                "서울특별시 강남구 테헤란로 123",
                "https://ldb-phinf.pstatic.net/20231101_123/mock_image.jpg",
                "1,234",
                "567",
                "4.52",
                "2,345",
                "restaurant",
                MOCK_KEYWORDS
        );
    }

    /** #2 — 실시간 순위 목데이터 (내 가게 + 경쟁 가게 리스트) */
    private List<RealtimeShopRank> createMockRealtimeList(String keyword, String province, String myShopId) {
        List<RealtimeShopRank> list = new ArrayList<>();

        // 경쟁 가게 20개 생성 (rank 1~20)
        String[] mockShopNames = {
                "맛있는한식당", "서울본가", "강남키친", "테헤란식당", "역삼골목식당",
                "한정식마루", "정통한식", "도시락명가", "참숯불고기", "쌈밥집",
                "국밥천국", "비빔밥하우스", "불고기브라더스", "찌개마을", "냉면공방",
                "갈비명가", "해물탕집", "순두부맛집", "제육볶음전문", "김치찌개본점"
        };

        int myRank = ThreadLocalRandom.current().nextInt(3, 12); // 내 가게 순위 3~11위

        for (int rank = 1; rank <= 20; rank++) {
            if (rank == myRank) {
                // 내 가게
                list.add(new RealtimeShopRank(
                        myShopId, "노마드랩 강남점", "https://ldb-phinf.pstatic.net/20231101_123/mock_image.jpg",
                        "음식점>한식", "서울특별시 강남구 역삼동 123-45", "서울특별시 강남구 테헤란로 123",
                        "1,234", "567", "4.52", "2,345",
                        rank, 287
                ));
            } else {
                int idx = (rank <= myRank) ? rank - 1 : rank - 2;
                if (idx >= mockShopNames.length) idx = idx % mockShopNames.length;
                String competitorId = String.valueOf(10000000 + rank * 1000 + ThreadLocalRandom.current().nextInt(999));
                list.add(new RealtimeShopRank(
                        competitorId, mockShopNames[idx],
                        "https://ldb-phinf.pstatic.net/mock_competitor_" + rank + ".jpg",
                        "음식점>한식", "서울특별시 강남구 " + rank + "번지",
                        "서울특별시 강남구 테헤란로 " + (rank * 10),
                        String.valueOf(ThreadLocalRandom.current().nextInt(100, 3000)),
                        String.valueOf(ThreadLocalRandom.current().nextInt(50, 1000)),
                        String.format("%.2f", 3.5 + ThreadLocalRandom.current().nextDouble(1.5)),
                        String.valueOf(ThreadLocalRandom.current().nextInt(100, 5000)),
                        rank, 287
                ));
            }
        }

        return list;
    }

    /** #4 — 순위 차트 목데이터 (10키워드 × 30일) */
    private Map<String, TrackChartData> createMockTrackChart(List<Long> trackInfoIds, LocalDateTime startDate) {
        Map<String, TrackChartData> result = new LinkedHashMap<>();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = (startDate != null) ? startDate : now.minusDays(30);

        // 각 키워드별 기본 순위 (자연스러운 편차)
        int[] baseRanks = {5, 8, 3, 12, 7, 15, 6, 10, 4, 9};

        for (int i = 0; i < MOCK_KEYWORDS.size(); i++) {
            long id = (i < trackInfoIds.size()) ? trackInfoIds.get(i) : i + 1;
            String keyword = MOCK_KEYWORDS.get(i);
            String mapKey = "[서울]" + keyword;
            int baseRank = baseRanks[i];

            // 30일치 일별 데이터 생성
            List<DailyRankData> dailyList = new ArrayList<>();
            int prevRank = baseRank + ThreadLocalRandom.current().nextInt(-2, 3);

            for (int day = 0; day < 30; day++) {
                LocalDateTime chartDate = start.plusDays(day).withHour(9).withMinute(0);
                if (chartDate.isAfter(now)) break;

                // 순위 변동: 전일 ±3 범위 (1~50 내)
                int rank = Math.max(1, Math.min(50, prevRank + ThreadLocalRandom.current().nextInt(-3, 4)));

                // 리뷰/저장 수 — 점진적 증가 트렌드 + 약간의 노이즈
                int visitorReview = 1100 + day * 5 + ThreadLocalRandom.current().nextInt(-10, 10);
                int blogReview = 500 + day * 2 + ThreadLocalRandom.current().nextInt(-5, 5);
                int saveCount = 2200 + day * 8 + ThreadLocalRandom.current().nextInt(-15, 15);
                double score = 4.40 + (day * 0.005) + ThreadLocalRandom.current().nextDouble(-0.05, 0.05);

                dailyList.add(new DailyRankData(
                        rank, prevRank,
                        String.format("%,d", visitorReview),
                        String.valueOf(blogReview),
                        String.format("%.2f", Math.min(5.0, score)),
                        String.format("%,d", saveCount),
                        "AM",
                        true,
                        chartDate
                ));

                prevRank = rank;
            }

            // rankChange: 최근 순위 변동 (첫날 대비 마지막 날)
            int rankChange = dailyList.isEmpty() ? 0
                    : dailyList.getFirst().rank() - dailyList.getLast().rank();

            result.put(mapKey, new TrackChartData(id, keyword, "서울", MOCK_SHOP_ID, rankChange, dailyList));
        }

        return result;
    }

    /** #5 — 트래킹 정보 목데이터 (10개 키워드) */
    private List<TrackRegistration> createMockTrackInfoList() {
        return IntStream.range(0, MOCK_KEYWORDS.size())
                .mapToObj(i -> {
                    int rankChange = ThreadLocalRandom.current().nextInt(-5, 6);
                    return new TrackRegistration(
                            (long) (i + 1), MOCK_KEYWORDS.get(i), "서울",
                            "restaurant", MOCK_SHOP_ID, rankChange
                    );
                })
                .toList();
    }

    /** #6 — 트래킹 상태 목데이터 */
    private TrackState createMockTrackState() {
        List<TrackState.CompletedKeyword> completed = MOCK_KEYWORDS.stream()
                .map(kw -> new TrackState.CompletedKeyword(kw, "서울"))
                .toList();
        return new TrackState(MOCK_KEYWORDS.size(), MOCK_KEYWORDS.size(), completed);
    }

    // ═══════════════════════════════════════════════════════
    //  유틸 메서드
    // ═══════════════════════════════════════════════════════

    private String getTextOrNull(JsonNode node, String fieldName) {
        JsonNode field = node.get(fieldName);
        return (field != null && !field.isNull()) ? field.asText() : null;
    }

    private List<String> extractKeywordList(JsonNode shop) {
        JsonNode keywordList = shop.get("keywordList");
        if (keywordList == null || !keywordList.isArray()) {
            return List.of();
        }
        return java.util.stream.StreamSupport.stream(keywordList.spliterator(), false)
                .map(JsonNode::asText)
                .toList();
    }

    /** 플레이스 URL에서 shopId 추출 */
    private String extractShopIdFromUrl(String placeUrl) {
        if (placeUrl == null) return MOCK_SHOP_ID;
        String cleaned = placeUrl.replaceAll(" ", "").split("\\?")[0];
        if (cleaned.contains("entry/place/")) return cleaned.split("entry/place/")[1].split("/")[0];
        if (cleaned.contains("/place/")) {
            String[] parts = cleaned.split("/place/");
            if (parts.length > 1) return parts[parts.length - 1].split("/")[0];
        }
        if (cleaned.contains("m.place.naver.com/")) {
            String[] parts = cleaned.split("m.place.naver.com/")[1].split("/");
            if (parts.length >= 2) return parts[1].split("/")[0];
        }
        return MOCK_SHOP_ID;
    }

    /** #2 실시간 응답 파싱 */
    private RealtimeShopRank parseRealtimeShop(JsonNode node) {
        JsonNode trackInfo = node.get("trackInfo");
        JsonNode rankInfo = node.get("rankInfo");
        return new RealtimeShopRank(
                getTextOrNull(trackInfo, "shopId"),
                getTextOrNull(trackInfo, "shopName"),
                getTextOrNull(trackInfo, "shopImageUrl"),
                getTextOrNull(trackInfo, "category"),
                getTextOrNull(trackInfo, "address"),
                getTextOrNull(trackInfo, "roadAddress"),
                getTextOrNull(trackInfo, "visitorReviewCount"),
                getTextOrNull(trackInfo, "blogReviewCount"),
                getTextOrNull(trackInfo, "scoreInfo"),
                getTextOrNull(trackInfo, "saveCount"),
                rankInfo != null ? rankInfo.get("rank").asInt() : null,
                rankInfo != null ? rankInfo.get("totalCount").asInt() : null
        );
    }

    // ═══════════════════════════════════════════════════════
    //  데이터 모델 (record)
    // ═══════════════════════════════════════════════════════

    /** #1 — 가게 메타 정보 */
    public record PlaceMeta(
            String shopId, String shopName, String category,
            String address, String roadAddress, String shopImageUrl,
            String visitorReviewCount, String blogReviewCount,
            String scoreInfo, String saveCount, String businessSector,
            List<String> keywordList
    ) {}

    /** #2 — 실시간 순위 가게 정보 */
    public record RealtimeShopRank(
            String shopId, String shopName, String shopImageUrl,
            String category, String address, String roadAddress,
            String visitorReviewCount, String blogReviewCount,
            String scoreInfo, String saveCount,
            Integer rank, Integer totalCount
    ) {}

    /** #3, #5 — 트래킹 등록/정보 */
    public record TrackRegistration(
            Long id, String keyword, String province,
            String businessSector, String shopId, Integer rankChange
    ) {}

    /** #4 — 순위 차트 데이터 */
    public record TrackChartData(
            Long id, String keyword, String province,
            String shopId, Integer rankChange,
            List<DailyRankData> dailyRankList
    ) {}

    /** #4 — 일별 순위 추적 데이터 */
    public record DailyRankData(
            Integer rank, Integer prevRank,
            String visitorReviewCount, String blogReviewCount,
            String scoreInfo, String saveCount,
            String ampm, Boolean isValid, LocalDateTime chartDate
    ) {}

    /** #6 — 트래킹 수집 상태 */
    public record TrackState(
            Integer totalCount, Integer completedCount,
            List<CompletedKeyword> completedKeywordList
    ) {
        public record CompletedKeyword(String keyword, String province) {}
    }
}
