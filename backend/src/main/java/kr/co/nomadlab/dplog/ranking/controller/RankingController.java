package kr.co.nomadlab.dplog.ranking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.nomadlab.dplog.common.dto.ResDTO;
import kr.co.nomadlab.dplog.common.exception.BusinessException;
import kr.co.nomadlab.dplog.ranking.dto.*;
import kr.co.nomadlab.dplog.ranking.service.RankingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 순위 조회/트래킹 컨트롤러
 * - 내순이 API를 통한 실시간 순위 조회, 트래킹 관리
 * - useMock=true일 때 목데이터 반환
 */
@RestController
@RequestMapping("/v1/stores/{storeId}/ranking")
@Tag(name = "Ranking", description = "순위 조회/트래킹 API")
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    // ═══════════════════════════════════════════════
    // #2 실시간 순위 조회
    // ═══════════════════════════════════════════════

    @GetMapping("/realtime")
    @Operation(summary = "실시간 순위 조회", description = "키워드+지역으로 네이버 플레이스 실시간 순위를 조회합니다. 경쟁 가게 리스트 + 내 가게 순위 포함.")
    public ResponseEntity<ResDTO<List<RealtimeRankResponse>>> getRealtime(
            @Parameter(description = "가게 ID") @PathVariable Long storeId,
            @Parameter(description = "검색 키워드", example = "강남맛집") @RequestParam String keyword,
            @Parameter(description = "지역", example = "서울") @RequestParam(defaultValue = "서울") String province) {

        List<RealtimeRankResponse> result = rankingService.getRealtime(storeId, keyword, province);
        return ResponseEntity.ok(ResDTO.ok(result));
    }

    // ═══════════════════════════════════════════════
    // #3 트래킹 등록
    // ═══════════════════════════════════════════════

    @PostMapping("/track")
    @Operation(summary = "순위 트래킹 등록", description = "키워드+지역 조합으로 순위 트래킹을 등록합니다.")
    public ResponseEntity<ResDTO<TrackRegistrationResponse>> registerTrack(
            @Parameter(description = "가게 ID") @PathVariable Long storeId,
            @RequestBody TrackRequest request) {

        Long memberId = getAuthenticatedMemberId();
        TrackRegistrationResponse result = rankingService.registerTrack(
                memberId, storeId, request.keyword(), request.province());
        return ResponseEntity.status(HttpStatus.CREATED).body(ResDTO.ok(result));
    }

    // ═══════════════════════════════════════════════
    // #4 순위 차트 (30일)
    // ═══════════════════════════════════════════════

    @PostMapping("/track/chart")
    @Operation(summary = "순위 차트 조회", description = "키워드별 30일 일별 순위 + 리뷰수 + 저장수 추이를 조회합니다.")
    public ResponseEntity<ResDTO<TrackChartResponse>> getTrackChart(
            @Parameter(description = "가게 ID") @PathVariable Long storeId,
            @RequestBody TrackChartRequest request) {

        TrackChartResponse result = rankingService.getTrackChart(
                storeId, request.trackInfoIds(), request.startDate());
        return ResponseEntity.ok(ResDTO.ok(result));
    }

    // ═══════════════════════════════════════════════
    // #5 트래킹 정보 목록
    // ═══════════════════════════════════════════════

    @GetMapping("/track/info")
    @Operation(summary = "트래킹 정보 목록", description = "등록된 트래킹 키워드 목록을 조회합니다.")
    public ResponseEntity<ResDTO<List<TrackRegistrationResponse>>> getTrackInfo(
            @Parameter(description = "가게 ID") @PathVariable Long storeId) {

        List<TrackRegistrationResponse> result = rankingService.getTrackInfoList(storeId);
        return ResponseEntity.ok(ResDTO.ok(result));
    }

    // ═══════════════════════════════════════════════
    // #6 트래킹 상태
    // ═══════════════════════════════════════════════

    @GetMapping("/track/state")
    @Operation(summary = "트래킹 상태 조회", description = "순위 수집 완료 상태를 조회합니다.")
    public ResponseEntity<ResDTO<TrackStateResponse>> getTrackState(
            @Parameter(description = "가게 ID") @PathVariable Long storeId) {

        TrackStateResponse result = rankingService.getTrackState(storeId);
        return ResponseEntity.ok(ResDTO.ok(result));
    }

    // ═══════════════════════════════════════════════
    // #7 트래킹 삭제
    // ═══════════════════════════════════════════════

    @DeleteMapping("/track/{trackInfoId}")
    @Operation(summary = "트래킹 삭제", description = "등록된 트래킹을 삭제합니다.")
    public ResponseEntity<ResDTO<Map<String, Boolean>>> deleteTrack(
            @Parameter(description = "가게 ID") @PathVariable Long storeId,
            @Parameter(description = "트래킹 ID") @PathVariable Long trackInfoId) {

        Long memberId = getAuthenticatedMemberId();
        boolean deleted = rankingService.deleteTrack(memberId, storeId, trackInfoId);
        return ResponseEntity.ok(ResDTO.ok(Map.of("deleted", deleted)));
    }

    // ─── 요청 DTO ─────────────────────────────

    /** 트래킹 등록 요청 */
    public record TrackRequest(String keyword, String province) {}

    /** 차트 조회 요청 */
    public record TrackChartRequest(List<Long> trackInfoIds, LocalDateTime startDate) {}

    // ─── SecurityContext ─────────────────────────────

    private Long getAuthenticatedMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw BusinessException.unauthorized("인증이 필요합니다.");
        }
        return (Long) authentication.getPrincipal();
    }
}
