package kr.co.nomadlab.dplog.ranking.repository;

import kr.co.nomadlab.dplog.ranking.domain.RankingSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 순위 스냅샷 Repository
 * - 진단 요청별 스냅샷 조회
 * - 가게별 스냅샷 조회
 */
public interface RankingSnapshotRepository extends JpaRepository<RankingSnapshot, Long> {

    /** 진단 요청에 연결된 스냅샷 조회 */
    List<RankingSnapshot> findByDiagnosisRequestId(Long diagnosisRequestId);

    /** 가게별 스냅샷 목록 (최신순) */
    List<RankingSnapshot> findByStoreIdOrderByCapturedAtDesc(Long storeId);
}
