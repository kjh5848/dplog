package kr.co.nomadlab.dplog.store.service;

import kr.co.nomadlab.dplog.common.exception.BusinessException;
import kr.co.nomadlab.dplog.integration.nomadscrap.NomadscrapService;
import kr.co.nomadlab.dplog.store.domain.Store;
import kr.co.nomadlab.dplog.store.dto.StoreCreateRequest;
import kr.co.nomadlab.dplog.store.dto.StoreResponse;
import kr.co.nomadlab.dplog.store.dto.StoreUpdateRequest;
import kr.co.nomadlab.dplog.store.repository.StoreRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 가게 서비스
 * - 가게 등록, 조회, 수정
 * - 소유자 권한 검증
 * - 내순이(NomadScrap) 연동: 가게 등록 시 플레이스 메타 자동 수집
 */
@Service
public class StoreService {

    private static final Logger log = LoggerFactory.getLogger(StoreService.class);

    private final StoreRepository storeRepository;
    private final NomadscrapService nomadscrapService;

    public StoreService(StoreRepository storeRepository, NomadscrapService nomadscrapService) {
        this.storeRepository = storeRepository;
        this.nomadscrapService = nomadscrapService;
    }

    /**
     * 가게 등록
     * 1. 사용자 입력값으로 Store 엔티티 생성
     * 2. placeUrl → 내순이 getTrackable 호출 → 가게 메타 자동 수집
     * 3. 내순이 응답이 있으면 메타 정보로 업데이트 (없으면 사용자 입력값 유지)
     *
     * @param memberId JWT에서 추출한 로그인 사용자 ID
     * @param request  가게 등록 요청 DTO
     * @return 생성된 가게 정보
     */
    @Transactional
    public StoreResponse createStore(Long memberId, StoreCreateRequest request) {
        Store store = new Store(request.name(), request.category(), request.address());
        store.setPlaceUrl(request.placeUrl());
        store.setPhone(request.phone());
        store.setOwnerId(memberId);

        // 내순이 연동: 플레이스 URL → 가게 메타 자동 수집
        Optional<NomadscrapService.PlaceMeta> metaOpt = nomadscrapService.fetchPlaceMeta(request.placeUrl());
        metaOpt.ifPresent(meta -> {
            // 내순이 응답의 메타 정보로 업데이트 (null이 아닌 필드만)
            if (meta.shopName() != null) store.setName(meta.shopName());
            if (meta.category() != null) store.setCategory(meta.category());
            if (meta.address() != null) store.setAddress(meta.address());
            if (meta.roadAddress() != null) store.setRoadAddress(meta.roadAddress());
            if (meta.shopImageUrl() != null) store.setShopImageUrl(meta.shopImageUrl());
            if (meta.shopId() != null) store.setShopId(meta.shopId());
            if (meta.visitorReviewCount() != null) store.setVisitorReviewCount(meta.visitorReviewCount());
            if (meta.blogReviewCount() != null) store.setBlogReviewCount(meta.blogReviewCount());
            if (meta.scoreInfo() != null) store.setScoreInfo(meta.scoreInfo());
            if (meta.saveCount() != null) store.setSaveCount(meta.saveCount());
            if (meta.businessSector() != null) store.setBusinessSector(meta.businessSector());
            log.info("내순이 메타 정보로 가게 업데이트: shopName={}", meta.shopName());
        });

        Store saved = storeRepository.save(store);
        log.info("가게 등록 완료: storeId={}, name={}, ownerId={}", saved.getId(), saved.getName(), memberId);

        return StoreResponse.from(saved);
    }

    /**
     * 가게 단건 조회
     *
     * @param storeId 조회할 가게 ID
     * @return 가게 정보
     * @throws BusinessException 가게를 찾을 수 없을 때 (404)
     */
    @Transactional(readOnly = true)
    public StoreResponse getStore(Long storeId) {
        Store store = findStoreOrThrow(storeId);
        return StoreResponse.from(store);
    }

    /**
     * 소유자의 가게 목록 조회
     *
     * @param memberId 소유자 ID
     * @return 소유자의 가게 목록
     */
    @Transactional(readOnly = true)
    public List<StoreResponse> getMyStores(Long memberId) {
        return storeRepository.findByOwnerId(memberId).stream()
                .map(StoreResponse::from)
                .toList();
    }

    /**
     * 가게 정보 수정
     * - null이 아닌 필드만 업데이트 (부분 수정)
     * - 소유자만 수정 가능
     *
     * @param memberId JWT에서 추출한 로그인 사용자 ID
     * @param storeId  수정할 가게 ID
     * @param request  수정 요청 DTO
     * @return 수정된 가게 정보
     */
    @Transactional
    public StoreResponse updateStore(Long memberId, Long storeId, StoreUpdateRequest request) {
        Store store = findStoreOrThrow(storeId);
        verifyOwner(store, memberId);

        // null이 아닌 필드만 업데이트
        if (request.name() != null) store.setName(request.name());
        if (request.category() != null) store.setCategory(request.category());
        if (request.address() != null) store.setAddress(request.address());
        if (request.placeUrl() != null) store.setPlaceUrl(request.placeUrl());
        if (request.phone() != null) store.setPhone(request.phone());

        log.info("가게 정보 수정 완료: storeId={}, ownerId={}", storeId, memberId);
        return StoreResponse.from(store);
    }

    // ─── 내부 헬퍼 메서드 ─────────────────────────────

    /**
     * 가게 조회 (없으면 404 예외)
     */
    public Store findStoreOrThrow(Long storeId) {
        return storeRepository.findById(storeId)
                .orElseThrow(() -> BusinessException.notFound("가게를 찾을 수 없습니다. storeId=" + storeId));
    }

    /**
     * 소유자 권한 검증
     */
    private void verifyOwner(Store store, Long memberId) {
        if (!memberId.equals(store.getOwnerId())) {
            throw BusinessException.forbidden("해당 가게에 대한 권한이 없습니다.");
        }
    }
}
