package kr.co.nomadlab.dplog.report.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.co.nomadlab.dplog.common.dto.ResDTO;
import kr.co.nomadlab.dplog.common.exception.BusinessException;
import kr.co.nomadlab.dplog.report.dto.DiagnosisCreateRequest;
import kr.co.nomadlab.dplog.report.dto.DiagnosisResultResponse;
import kr.co.nomadlab.dplog.report.dto.DiagnosisStatusResponse;
import kr.co.nomadlab.dplog.report.service.DiagnosisService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 진단 API 컨트롤러 (가게 스코프)
 * - POST /v1/stores/{storeId}/diagnosis           → 202 Accepted + jobId
 * - GET  /v1/stores/{storeId}/diagnosis/{jobId}   → 200 OK + 상태 정보
 * - GET  /v1/stores/{storeId}/diagnosis/{jobId}/result → 200 OK + 전체 결과
 * - GET  /v1/stores/{storeId}/diagnosis            → 200 OK + 진단 이력 목록
 */
@RestController
@RequestMapping("/v1/stores/{storeId}/diagnosis")
@Tag(name = "Diagnosis", description = "비동기 진단 파이프라인 API")
public class DiagnosisController {

    private final DiagnosisService diagnosisService;

    public DiagnosisController(DiagnosisService diagnosisService) {
        this.diagnosisService = diagnosisService;
    }

    /**
     * 진단 요청 생성 (비동기)
     * - 키워드 세트에 대한 순위 수집 비동기 잡 생성
     * @return 202 Accepted + { jobId }
     */
    @PostMapping
    @Operation(summary = "진단 요청 생성", description = "키워드 세트에 대한 비동기 순위 수집 잡을 생성합니다.")
    public ResponseEntity<ResDTO<Map<String, Long>>> createDiagnosis(
            @Parameter(description = "가게 ID") @PathVariable Long storeId,
            @RequestBody @Valid DiagnosisCreateRequest request) {

        Long memberId = getAuthenticatedMemberId();
        Long jobId = diagnosisService.createDiagnosis(memberId, storeId, request);

        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(ResDTO.ok(Map.of("jobId", jobId)));
    }

    /**
     * 진단 상태 조회 (폴링)
     */
    @GetMapping("/{jobId}")
    @Operation(summary = "진단 상태 조회", description = "진단 요청의 현재 상태를 폴링합니다.")
    public ResponseEntity<ResDTO<DiagnosisStatusResponse>> getStatus(
            @Parameter(description = "가게 ID") @PathVariable Long storeId,
            @Parameter(description = "진단 잡 ID") @PathVariable Long jobId) {

        DiagnosisStatusResponse status = diagnosisService.getStatus(jobId);
        return ResponseEntity.ok(ResDTO.ok(status));
    }

    /**
     * 진단 전체 결과 조회 (스냅샷 + 순위 항목 포함)
     */
    @GetMapping("/{jobId}/result")
    @Operation(summary = "진단 결과 조회", description = "진단 완료 후 스냅샷 + 순위 항목을 포함한 전체 결과를 조회합니다.")
    public ResponseEntity<ResDTO<DiagnosisResultResponse>> getResult(
            @Parameter(description = "가게 ID") @PathVariable Long storeId,
            @Parameter(description = "진단 잡 ID") @PathVariable Long jobId) {

        DiagnosisResultResponse result = diagnosisService.getResult(jobId);
        return ResponseEntity.ok(ResDTO.ok(result));
    }

    /**
     * 진단 이력 목록 조회 (가게별)
     */
    @GetMapping
    @Operation(summary = "진단 이력 목록", description = "가게별 진단 요청 이력을 최신순으로 조회합니다.")
    public ResponseEntity<ResDTO<List<DiagnosisStatusResponse>>> getHistory(
            @Parameter(description = "가게 ID") @PathVariable Long storeId) {

        List<DiagnosisStatusResponse> history = diagnosisService.getHistory(storeId);
        return ResponseEntity.ok(ResDTO.ok(history));
    }

    // ─── SecurityContext ─────────────────────────────

    private Long getAuthenticatedMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw BusinessException.unauthorized("인증이 필요합니다.");
        }
        return (Long) authentication.getPrincipal();
    }
}
