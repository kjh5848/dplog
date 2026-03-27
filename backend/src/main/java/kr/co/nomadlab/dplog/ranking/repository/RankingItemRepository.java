package kr.co.nomadlab.dplog.ranking.repository;

import kr.co.nomadlab.dplog.ranking.domain.RankingItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 순위 항목 Repository
 * - 스냅샷별 순위 항목 조회
 */
public interface RankingItemRepository extends JpaRepository<RankingItem, Long> {

    /** 스냅샷에 포함된 순위 항목 조회 */
    List<RankingItem> findBySnapshotId(Long snapshotId);

    /** 다수 스냅샷의 순위 항목 일괄 조회 */
    List<RankingItem> findBySnapshotIdIn(List<Long> snapshotIds);
}
