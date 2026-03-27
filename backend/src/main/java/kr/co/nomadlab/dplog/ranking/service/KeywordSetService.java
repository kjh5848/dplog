package kr.co.nomadlab.dplog.ranking.service;

import kr.co.nomadlab.dplog.common.exception.BusinessException;
import kr.co.nomadlab.dplog.ranking.domain.KeywordSet;
import kr.co.nomadlab.dplog.ranking.dto.KeywordSetCreateRequest;
import kr.co.nomadlab.dplog.ranking.dto.KeywordSetResponse;
import kr.co.nomadlab.dplog.ranking.repository.KeywordSetRepository;
import kr.co.nomadlab.dplog.store.domain.Store;
import kr.co.nomadlab.dplog.store.service.StoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 키워드 세트 서비스
 * - 키워드 세트 생성 (가게 소유자만 가능)
 * - 키워드 유효성 검증 위임
 */
@Service
public class KeywordSetService {

    private static final Logger log = LoggerFactory.getLogger(KeywordSetService.class);

    private final KeywordSetRepository keywordSetRepository;
    private final StoreService storeService;
    private final KeywordValidator keywordValidator;

    public KeywordSetService(KeywordSetRepository keywordSetRepository,
                             StoreService storeService,
                             KeywordValidator keywordValidator) {
        this.keywordSetRepository = keywordSetRepository;
        this.storeService = storeService;
        this.keywordValidator = keywordValidator;
    }

    /**
     * 키워드 세트 생성
     *
     * 1. 가게 존재 확인 + 소유자 검증
     * 2. 키워드 유효성 검증 및 정제 (중복 제거, 금칙어 검사 등)
     * 3. 키워드 세트 저장
     *
     * @param memberId JWT에서 추출한 로그인 사용자 ID
     * @param storeId  대상 가게 ID
     * @param request  키워드 생성 요청 DTO
     * @return 생성된 키워드 세트 정보
     */
    @Transactional
    public KeywordSetResponse createKeywordSet(Long memberId, Long storeId, KeywordSetCreateRequest request) {
        // 1. 가게 존재 확인 + 소유자 검증
        Store store = storeService.findStoreOrThrow(storeId);
        if (!memberId.equals(store.getOwnerId())) {
            throw BusinessException.forbidden("해당 가게에 대한 키워드를 등록할 권한이 없습니다.");
        }

        // 2. 키워드 유효성 검증 및 정제
        int originalCount = request.keywords().size();
        List<String> sanitizedKeywords = keywordValidator.validateAndSanitize(request.keywords());
        int removedDuplicates = originalCount - sanitizedKeywords.size();

        // 3. 키워드 세트 저장 (쉼표 구분 문자열로 저장)
        String keywordsStr = String.join(",", sanitizedKeywords);
        String validationInfo = keywordValidator.generateValidationInfo(originalCount, sanitizedKeywords.size(), removedDuplicates);

        KeywordSet keywordSet = new KeywordSet(storeId, keywordsStr);
        keywordSet.setValidationInfo(validationInfo);

        KeywordSet saved = keywordSetRepository.save(keywordSet);
        log.info("키워드 세트 저장 완료: keywordSetId={}, storeId={}, keywords={}", saved.getId(), storeId, sanitizedKeywords);

        return KeywordSetResponse.from(saved);
    }

    /**
     * 가게별 키워드 세트 목록 조회
     */
    @Transactional(readOnly = true)
    public List<KeywordSetResponse> getKeywordSets(Long storeId) {
        // 가게 존재 확인
        storeService.findStoreOrThrow(storeId);

        return keywordSetRepository.findByStoreId(storeId).stream()
                .map(KeywordSetResponse::from)
                .toList();
    }
}
