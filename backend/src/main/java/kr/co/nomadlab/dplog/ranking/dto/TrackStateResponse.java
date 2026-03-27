package kr.co.nomadlab.dplog.ranking.dto;

import kr.co.nomadlab.dplog.integration.nomadscrap.NomadscrapService;

import java.util.List;

/**
 * 트래킹 상태 응답 DTO
 */
public record TrackStateResponse(
        Integer totalCount,
        Integer completedCount,
        List<CompletedKeyword> completedKeywords
) {
    public record CompletedKeyword(String keyword, String province) {}

    /** NomadscrapService.TrackState → DTO 변환 */
    public static TrackStateResponse from(NomadscrapService.TrackState state) {
        return new TrackStateResponse(
                state.totalCount(), state.completedCount(),
                state.completedKeywordList().stream()
                        .map(kw -> new CompletedKeyword(kw.keyword(), kw.province()))
                        .toList()
        );
    }
}
