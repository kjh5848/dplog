package kr.co.nomadlab.dplog.store.repository;

import kr.co.nomadlab.dplog.store.domain.Store;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 가게 Repository
 * - 소유자별 가게 목록 조회 지원
 */
public interface StoreRepository extends JpaRepository<Store, Long> {

    /** 소유자(memberId)별 가게 목록 조회 */
    List<Store> findByOwnerId(Long ownerId);
}
