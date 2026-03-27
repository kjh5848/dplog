package kr.co.nomadlab.dplog.ranking.repository;

import kr.co.nomadlab.dplog.ranking.domain.KeywordSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 키워드 세트 Repository
 * - 가게별 키워드 세트 조회 지원
 */
public interface KeywordSetRepository extends JpaRepository<KeywordSet, Long> {

    /** 가게별 키워드 세트 목록 조회 */
    List<KeywordSet> findByStoreId(Long storeId);

    /** 가게별 가장 최근 키워드 세트 조회 */
    Optional<KeywordSet> findTopByStoreIdOrderByCreatedAtDesc(Long storeId);
}
