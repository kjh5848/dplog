package kr.co.nomadlab.dplog.ranking.dto;

import kr.co.nomadlab.dplog.integration.nomadscrap.NomadscrapService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 순위 차트 응답 DTO
 * - 키워드별 30일 일별 순위 + 리뷰수 + 저장수
 */
public record TrackChartResponse(
        Map<String, KeywordChart> charts
) {
    /** NomadscrapService 결과 → DTO 변환 */
    public static TrackChartResponse from(Map<String, NomadscrapService.TrackChartData> chartMap) {
        Map<String, KeywordChart> converted = chartMap.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> KeywordChart.from(e.getValue()),
                        (a, b) -> a,
                        java.util.LinkedHashMap::new
                ));
        return new TrackChartResponse(converted);
    }

    /** 키워드별 차트 데이터 */
    public record KeywordChart(
            Long id,
            String keyword,
            String province,
            String shopId,
            Integer rankChange,
            List<DailyRank> dailyRanks
    ) {
        public static KeywordChart from(NomadscrapService.TrackChartData data) {
            return new KeywordChart(
                    data.id(), data.keyword(), data.province(),
                    data.shopId(), data.rankChange(),
                    data.dailyRankList().stream().map(DailyRank::from).toList()
            );
        }
    }

    /** 일별 순위 데이터 */
    public record DailyRank(
            Integer rank,
            Integer prevRank,
            String visitorReviewCount,
            String blogReviewCount,
            String scoreInfo,
            String saveCount,
            String ampm,
            Boolean isValid,
            LocalDateTime chartDate
    ) {
        public static DailyRank from(NomadscrapService.DailyRankData data) {
            return new DailyRank(
                    data.rank(), data.prevRank(),
                    data.visitorReviewCount(), data.blogReviewCount(),
                    data.scoreInfo(), data.saveCount(),
                    data.ampm(), data.isValid(), data.chartDate()
            );
        }
    }
}
