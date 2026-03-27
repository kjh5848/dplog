package kr.co.nomadlab.dplog.ranking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.co.nomadlab.dplog.common.dto.ResDTO;
import kr.co.nomadlab.dplog.common.exception.BusinessException;
import kr.co.nomadlab.dplog.ranking.dto.KeywordSetCreateRequest;
import kr.co.nomadlab.dplog.ranking.dto.KeywordSetResponse;
import kr.co.nomadlab.dplog.ranking.service.KeywordSetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 키워드 세트 컨트롤러
 * - POST /v1/stores/{storeId}/keyword-sets — 키워드 세트 저장
 * - GET  /v1/stores/{storeId}/keyword-sets — 가게별 키워드 세트 목록 조회
 */
@RestController
@RequestMapping("/v1/stores/{storeId}/keyword-sets")
@Tag(name = "KeywordSet", description = "키워드 세트 저장/조회 API")
public class KeywordSetController {

    private final KeywordSetService keywordSetService;

    public KeywordSetController(KeywordSetService keywordSetService) {
        this.keywordSetService = keywordSetService;
    }

    /**
     * 키워드 세트 저장
     */
    @PostMapping
    @Operation(
            summary = "키워드 세트 저장",
            description = "가게에 키워드 세트를 저장합니다. 중복 제거, 길이 제한, 금칙어 검사가 자동 적용됩니다."
    )
    @ApiResponse(responseCode = "201", description = "키워드 세트 저장 성공")
    public ResponseEntity<ResDTO<KeywordSetResponse>> createKeywordSet(
            @Parameter(description = "가게 ID") @PathVariable Long storeId,
            @Valid @RequestBody KeywordSetCreateRequest request) {
        Long memberId = getAuthenticatedMemberId();
        KeywordSetResponse response = keywordSetService.createKeywordSet(memberId, storeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResDTO.ok(response));
    }

    /**
     * 가게별 키워드 세트 목록 조회
     */
    @GetMapping
    @Operation(summary = "키워드 세트 목록 조회", description = "가게에 등록된 키워드 세트 목록을 조회합니다.")
    public ResponseEntity<ResDTO<List<KeywordSetResponse>>> getKeywordSets(
            @Parameter(description = "가게 ID") @PathVariable Long storeId) {
        List<KeywordSetResponse> response = keywordSetService.getKeywordSets(storeId);
        return ResponseEntity.ok(ResDTO.ok(response));
    }

    // ─── SecurityContext에서 인증된 memberId 추출 ─────────────────

    private Long getAuthenticatedMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw BusinessException.unauthorized("인증이 필요합니다.");
        }
        return (Long) authentication.getPrincipal();
    }
}
