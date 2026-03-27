package kr.co.nomadlab.dplog.report.service;

import kr.co.nomadlab.dplog.common.exception.BusinessException;
import kr.co.nomadlab.dplog.ranking.domain.RankingItem;
import kr.co.nomadlab.dplog.ranking.domain.RankingSnapshot;
import kr.co.nomadlab.dplog.ranking.dto.RankingSnapshotResponse;
import kr.co.nomadlab.dplog.ranking.repository.RankingItemRepository;
import kr.co.nomadlab.dplog.ranking.repository.RankingSnapshotRepository;
import kr.co.nomadlab.dplog.ranking.repository.KeywordSetRepository;
import kr.co.nomadlab.dplog.ranking.domain.KeywordSet;
import kr.co.nomadlab.dplog.report.domain.DiagnosisRequest;
import kr.co.nomadlab.dplog.report.domain.DiagnosisStatus;
import kr.co.nomadlab.dplog.report.dto.DiagnosisCreateRequest;
import kr.co.nomadlab.dplog.report.dto.DiagnosisResultResponse;
import kr.co.nomadlab.dplog.report.dto.DiagnosisStatusResponse;
import kr.co.nomadlab.dplog.report.repository.DiagnosisRequestRepository;
import kr.co.nomadlab.dplog.store.service.StoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 진단 서비스
 * - 진단 요청 생성 (jobKey 중복 방지)
 * - 상태 폴링
 * - 결과 조회 (스냅샷 + 순위 항목 포함)
 * - 가게별 진단 이력 목록 조회
 */
@Service
public class DiagnosisService {

    private static final Logger log = LoggerFactory.getLogger(DiagnosisService.class);
    private static final DateTimeFormatter DATE_BUCKET_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final DiagnosisRequestRepository diagnosisRequestRepository;
    private final RankingSnapshotRepository rankingSnapshotRepository;
    private final RankingItemRepository rankingItemRepository;
    private final KeywordSetRepository keywordSetRepository;
    private final StoreService storeService;
    private final DiagnosisAsyncExecutor asyncExecutor;

    public DiagnosisService(DiagnosisRequestRepository diagnosisRequestRepository,
                            RankingSnapshotRepository rankingSnapshotRepository,
                            RankingItemRepository rankingItemRepository,
                            KeywordSetRepository keywordSetRepository,
                            StoreService storeService,
                            DiagnosisAsyncExecutor asyncExecutor) {
        this.diagnosisRequestRepository = diagnosisRequestRepository;
        this.rankingSnapshotRepository = rankingSnapshotRepository;
        this.rankingItemRepository = rankingItemRepository;
        this.keywordSetRepository = keywordSetRepository;
        this.storeService = storeService;
        this.asyncExecutor = asyncExecutor;
    }

    /**
     * 진단 요청 생성
     * 1. 가게 존재 확인
     * 2. 키워드 세트 존재 확인
     * 3. jobKey 생성 → 중복 확인 (409 Conflict)
     * 4. PENDING 상태로 저장
     * 5. 비동기 실행 트리거
     *
     * @param memberId 요청자 ID
     * @param storeId  가게 ID (PathVariable)
     * @param request  진단 요청 DTO (keywordSetId만 포함)
     * @return 생성된 jobId
     */
    @Transactional
    public Long createDiagnosis(Long memberId, Long storeId, DiagnosisCreateRequest request) {
        // 1. 가게 존재 확인
        storeService.findStoreOrThrow(storeId);

        // 2. 키워드 세트 존재 확인
        KeywordSet keywordSet = keywordSetRepository.findById(request.keywordSetId())
                .orElseThrow(() -> BusinessException.notFound("키워드 세트를 찾을 수 없습니다. ID: " + request.keywordSetId()));

        // 3. jobKey 생성 + 중복 확인
        String keywordSetHash = String.valueOf(keywordSet.getKeywords().hashCode());
        String dateBucket = LocalDate.now().format(DATE_BUCKET_FMT);
        String jobKey = storeId + ":" + keywordSetHash + ":" + dateBucket;

        diagnosisRequestRepository.findByJobKey(jobKey).ifPresent(existing -> {
            throw BusinessException.conflict(
                    "오늘 이미 동일한 진단 요청이 존재합니다. jobId: " + existing.getId()
                            + ", 상태: " + existing.getStatus()
            );
        });

        // 4. PENDING 상태로 저장
        DiagnosisRequest diagnosisRequest = new DiagnosisRequest(
                storeId, memberId, request.keywordSetId(), jobKey
        );
        DiagnosisRequest saved = diagnosisRequestRepository.save(diagnosisRequest);
        log.info("진단 요청 생성: jobId={}, jobKey={}", saved.getId(), jobKey);

        // 5. 비동기 실행 트리거
        asyncExecutor.execute(saved.getId());

        return saved.getId();
    }

    /**
     * 진단 상태 폴링
     */
    @Transactional(readOnly = true)
    public DiagnosisStatusResponse getStatus(Long jobId) {
        DiagnosisRequest request = findOrThrow(jobId);
        return DiagnosisStatusResponse.from(request);
    }

    /**
     * 진단 전체 결과 조회 (스냅샷 + 순위 항목 포함)
     */
    @Transactional(readOnly = true)
    public DiagnosisResultResponse getResult(Long jobId) {
        DiagnosisRequest request = findOrThrow(jobId);

        // 진단이 완료되지 않은 경우 스냅샷 없이 상태만 반환
        if (request.getStatus() == DiagnosisStatus.PENDING
                || request.getStatus() == DiagnosisStatus.RUNNING) {
            return DiagnosisResultResponse.from(request, List.of());
        }

        // 스냅샷 + 순위 항목 조회
        List<RankingSnapshot> snapshots = rankingSnapshotRepository
                .findByDiagnosisRequestId(jobId);

        List<Long> snapshotIds = snapshots.stream()
                .map(RankingSnapshot::getId)
                .toList();

        // 스냅샷별 순위 항목 그룹핑
        Map<Long, List<RankingItem>> itemsBySnapshotId = rankingItemRepository
                .findBySnapshotIdIn(snapshotIds)
                .stream()
                .collect(Collectors.groupingBy(RankingItem::getSnapshotId));

        List<RankingSnapshotResponse> snapshotResponses = snapshots.stream()
                .map(snapshot -> RankingSnapshotResponse.from(
                        snapshot,
                        itemsBySnapshotId.getOrDefault(snapshot.getId(), List.of())
                ))
                .toList();

        return DiagnosisResultResponse.from(request, snapshotResponses);
    }

    /**
     * 가게별 진단 이력 목록 조회 (최신순)
     */
    @Transactional(readOnly = true)
    public List<DiagnosisStatusResponse> getHistory(Long storeId) {
        storeService.findStoreOrThrow(storeId);
        return diagnosisRequestRepository.findByStoreIdOrderByCreatedAtDesc(storeId)
                .stream()
                .map(DiagnosisStatusResponse::from)
                .toList();
    }

    /** 진단 요청 조회 (없으면 404) */
    private DiagnosisRequest findOrThrow(Long jobId) {
        return diagnosisRequestRepository.findById(jobId)
                .orElseThrow(() -> BusinessException.notFound("진단 요청을 찾을 수 없습니다. jobId: " + jobId));
    }
}
