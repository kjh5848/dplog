package kr.co.nomadlab.dplog.store.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import kr.co.nomadlab.dplog.common.dto.ResDTO;
import kr.co.nomadlab.dplog.common.exception.BusinessException;
import kr.co.nomadlab.dplog.store.dto.StoreCreateRequest;
import kr.co.nomadlab.dplog.store.dto.StoreResponse;
import kr.co.nomadlab.dplog.store.dto.StoreUpdateRequest;
import kr.co.nomadlab.dplog.store.service.StoreService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 가게 컨트롤러
 * - POST   /v1/stores           — 가게 등록
 * - GET    /v1/stores/{storeId} — 가게 조회
 * - PUT    /v1/stores/{storeId} — 가게 정보 수정
 * - GET    /v1/stores/me        — 내 가게 목록 조회
 */
@RestController
@RequestMapping("/v1/stores")
@Tag(name = "Store", description = "가게 등록/조회/수정 API")
public class StoreController {

    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    /**
     * 가게 등록
     */
    @PostMapping
    @Operation(summary = "가게 등록", description = "새로운 가게를 등록합니다. JWT 인증 필요.")
    @ApiResponse(responseCode = "201", description = "가게 등록 성공")
    public ResponseEntity<ResDTO<StoreResponse>> createStore(@Valid @RequestBody StoreCreateRequest request) {
        Long memberId = getAuthenticatedMemberId();
        StoreResponse response = storeService.createStore(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ResDTO.ok(response));
    }

    /**
     * 가게 단건 조회
     */
    @GetMapping("/{storeId}")
    @Operation(summary = "가게 조회", description = "가게 ID로 가게 정보를 조회합니다.")
    public ResponseEntity<ResDTO<StoreResponse>> getStore(
            @Parameter(description = "가게 ID") @PathVariable Long storeId) {
        StoreResponse response = storeService.getStore(storeId);
        return ResponseEntity.ok(ResDTO.ok(response));
    }

    /**
     * 가게 정보 수정
     */
    @PutMapping("/{storeId}")
    @Operation(summary = "가게 수정", description = "가게 정보를 수정합니다. 소유자만 가능. null 필드는 기존 값 유지.")
    public ResponseEntity<ResDTO<StoreResponse>> updateStore(
            @Parameter(description = "가게 ID") @PathVariable Long storeId,
            @Valid @RequestBody StoreUpdateRequest request) {
        Long memberId = getAuthenticatedMemberId();
        StoreResponse response = storeService.updateStore(memberId, storeId, request);
        return ResponseEntity.ok(ResDTO.ok(response));
    }

    /**
     * 내 가게 목록 조회
     */
    @GetMapping("/me")
    @Operation(summary = "내 가게 목록", description = "로그인한 사용자가 소유한 가게 목록을 조회합니다.")
    public ResponseEntity<ResDTO<List<StoreResponse>>> getMyStores() {
        Long memberId = getAuthenticatedMemberId();
        List<StoreResponse> response = storeService.getMyStores(memberId);
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
