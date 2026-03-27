package kr.co.nomadlab.dplog.report.service;

import kr.co.nomadlab.dplog.integration.nomadscrap.NomadscrapService;
import kr.co.nomadlab.dplog.ranking.domain.KeywordSet;
import kr.co.nomadlab.dplog.ranking.domain.RankingItem;
import kr.co.nomadlab.dplog.ranking.domain.RankingSnapshot;
import kr.co.nomadlab.dplog.ranking.repository.KeywordSetRepository;
import kr.co.nomadlab.dplog.ranking.repository.RankingItemRepository;
import kr.co.nomadlab.dplog.ranking.repository.RankingSnapshotRepository;
import kr.co.nomadlab.dplog.report.domain.DiagnosisRequest;
import kr.co.nomadlab.dplog.report.repository.DiagnosisRequestRepository;
import kr.co.nomadlab.dplog.store.domain.Store;
import kr.co.nomadlab.dplog.store.service.StoreService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * 진단 잡 실행기 — 트랜잭션 내 실제 진단 로직
 *
 * DiagnosisAsyncExecutor로부터 호출되는 별도 Bean.
 * Spring AOP 프록시를 통해 @Transactional이 정상 적용됩니다.
 */
@Component
public class DiagnosisJobRunner {

    private static final Logger log = LoggerFactory.getLogger(DiagnosisJobRunner.class);

    private final DiagnosisRequestRepository diagnosisRequestRepository;
    private final RankingSnapshotRepository rankingSnapshotRepository;
    private final RankingItemRepository rankingItemRepository;
    private final KeywordSetRepository keywordSetRepository;
    private final NomadscrapService nomadscrapService;
    private final StoreService storeService;

    public DiagnosisJobRunner(DiagnosisRequestRepository diagnosisRequestRepository,
                              RankingSnapshotRepository rankingSnapshotRepository,
                              RankingItemRepository rankingItemRepository,
                              KeywordSetRepository keywordSetRepository,
                              NomadscrapService nomadscrapService,
                              StoreService storeService) {
        this.diagnosisRequestRepository = diagnosisRequestRepository;
        this.rankingSnapshotRepository = rankingSnapshotRepository;
        this.rankingItemRepository = rankingItemRepository;
        this.keywordSetRepository = keywordSetRepository;
        this.nomadscrapService = nomadscrapService;
        this.storeService = storeService;
    }

    /**
     * 진단 실행 (트랜잭션 단위)
     * - PENDING → RUNNING → SUCCESS/PARTIAL/FAILED
     * - NomadscrapService를 통한 실시간 순위 수집 + 스냅샷 저장
     */
    @Transactional
    public void run(Long jobId) {
        DiagnosisRequest request = diagnosisRequestRepository.findById(jobId)
                .orElse(null);

        if (request == null) {
            log.warn("진단 요청을 찾을 수 없습니다: jobId={}", jobId);
            return;
        }

        try {
            // 1. PENDING → RUNNING
            request.start();
            diagnosisRequestRepository.save(request);
            log.info("진단 실행 시작: jobId={}", jobId);

            // 2. 키워드 세트 + 가게 정보 조회
            KeywordSet keywordSet = keywordSetRepository.findById(request.getKeywordSetId())
                    .orElseThrow(() -> new RuntimeException("키워드 세트를 찾을 수 없습니다: " + request.getKeywordSetId()));

            Store store = storeService.findStoreOrThrow(request.getStoreId());
            String shopId = store.getShopId() != null ? store.getShopId() : "37567285";
            String province = "서울"; // 기본 지역 (추후 Store에서 동적 추출 가능)

            List<String> keywords = Arrays.asList(keywordSet.getKeywords().split(","));

            // 3. 순위 스냅샷 생성
            RankingSnapshot snapshot = new RankingSnapshot(jobId, request.getStoreId());
            RankingSnapshot savedSnapshot = rankingSnapshotRepository.save(snapshot);

            int successCount = 0;
            int failCount = 0;

            // 4. 키워드별 실시간 순위 수집 → RankingItem 저장
            for (String keyword : keywords) {
                String trimmed = keyword.trim();
                if (trimmed.isEmpty()) continue;

                try {
                    List<NomadscrapService.RealtimeShopRank> realtimeList =
                            nomadscrapService.fetchRealtime(trimmed, province, shopId);

                    // 내 가게 순위 찾기
                    Integer myRank = null;
                    Integer totalCount = null;
                    for (NomadscrapService.RealtimeShopRank shopRank : realtimeList) {
                        if (shopId.equals(shopRank.shopId())) {
                            myRank = shopRank.rank();
                            totalCount = shopRank.totalCount();
                            break;
                        }
                    }

                    RankingItem item = new RankingItem(savedSnapshot.getId(), trimmed, myRank);
                    if (totalCount != null) {
                        item.setSearchVolume(totalCount);
                    }

                    // 위치 메타 정보 (상위 3개 가게 정보 요약)
                    if (!realtimeList.isEmpty()) {
                        StringBuilder metaBuilder = new StringBuilder();
                        int limit = Math.min(3, realtimeList.size());
                        for (int i = 0; i < limit; i++) {
                            NomadscrapService.RealtimeShopRank top = realtimeList.get(i);
                            if (i > 0) metaBuilder.append(", ");
                            metaBuilder.append(String.format("%d위: %s", top.rank(), top.shopName()));
                        }
                        item.setPositionMeta(metaBuilder.toString());
                    }

                    rankingItemRepository.save(item);
                    successCount++;
                    log.debug("순위 수집 완료: keyword={}, rank={}", trimmed, myRank);

                } catch (Exception e) {
                    log.warn("키워드 순위 수집 실패: keyword={}, error={}", trimmed, e.getMessage());
                    // 실패해도 null rank로 저장
                    RankingItem failedItem = new RankingItem(savedSnapshot.getId(), trimmed, null);
                    rankingItemRepository.save(failedItem);
                    failCount++;
                }
            }

            // 5. 상태 전이: SUCCESS / PARTIAL / FAILED
            if (failCount == 0) {
                request.complete();
                log.info("진단 실행 완료: jobId={}, 성공={}", jobId, successCount);
            } else if (successCount > 0) {
                request.partial();
                log.info("진단 부분 완료: jobId={}, 성공={}, 실패={}", jobId, successCount, failCount);
            } else {
                request.fail("모든 키워드 순위 수집 실패");
                log.warn("진단 전체 실패: jobId={}, 실패={}", jobId, failCount);
            }
            diagnosisRequestRepository.save(request);

        } catch (Exception e) {
            log.error("진단 실행 중 오류: jobId={}", jobId, e);
            request.fail(e.getMessage());
            diagnosisRequestRepository.save(request);
        }
    }
}
