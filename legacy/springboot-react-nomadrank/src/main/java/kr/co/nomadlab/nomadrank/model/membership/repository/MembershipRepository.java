package kr.co.nomadlab.nomadrank.model.membership.repository;

import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * 멤버십 Repository
 * 구독 멤버십 관련 데이터베이스 접근을 담당합니다.
 */
@Repository
public interface MembershipRepository extends JpaRepository<MembershipEntity, Long> {

    /**
     * 멤버십 이름으로 조회
     * @param name 멤버십 이름
     * @return 멤버십 엔티티
     */
    MembershipEntity findByName(String name);

    /**
     * 특정 이름들을 제외한 멤버십 조회
     * @param names 제외할 멤버십 이름 목록
     * @return 해당하지 않는 멤버십 목록
     */
    List<MembershipEntity> findByNameNotIn(Collection<String> names);

    /**
     * 멤버십 이름으로 조회 (삭제된 것 제외)
     * @param name 멤버십 이름 (FREE, PRO, PREMIUM, AGENCY)
     * @return 멤버십 엔티티
     */
    Optional<MembershipEntity> findByNameAndDeleteDateIsNull(String name);

    /**
     * 멤버십 레벨로 조회 (삭제되지 않은 멤버십만)
     * @param level 멤버십 레벨 값
     * @return 멤버십 엔티티
     */
    Optional<MembershipEntity> findByLevelAndDeleteDateIsNull(Integer level);

    /**
     * 활성화된 모든 멤버십 조회 (삭제되지 않은 멤버십만)
     * 표시 순서별로 정렬
     * @return 활성 멤버십 목록
     */
    @Query("SELECT m FROM MembershipEntity m WHERE m.deleteDate IS NULL ORDER BY m.sortOrder ASC, m.id ASC")
    List<MembershipEntity> findAllActiveMembershipsSortedByOrder();

    /**
     * 특정 가격 범위의 멤버십 조회
     * @param minPrice 최소 가격
     * @param maxPrice 최대 가격
     * @return 해당 가격 범위의 멤버십 목록
     */
    @Query("SELECT m FROM MembershipEntity m WHERE m.deleteDate IS NULL AND m.price BETWEEN :minPrice AND :maxPrice ORDER BY m.price ASC")
    List<MembershipEntity> findByPriceRangeAndDeleteDateIsNull(@Param("minPrice") Integer minPrice, @Param("maxPrice") Integer maxPrice);

    /**
     * 인기 멤버십 조회
     * @return 인기 멤버십 목록
     */
    List<MembershipEntity> findByIsPopularTrueAndDeleteDateIsNull();

    /**
     * 무료 멤버십 조회
     * @return 무료 멤버십
     */
    @Query("SELECT m FROM MembershipEntity m WHERE m.name = 'FREE' AND m.deleteDate IS NULL")
    Optional<MembershipEntity> findFreeMembership();

    /**
     * 멤버십 이름 목록으로 조회
     * @param names 멤버십 이름 목록
     * @return 해당하는 멤버십 목록
     */
    List<MembershipEntity> findByNameInAndDeleteDateIsNull(List<String> names);

    /**
     * 특정 가격 이상의 멤버십 조회
     * @param price 기준 가격
     * @return 해당 가격 이상의 멤버십 목록
     */
    @Query("SELECT m FROM MembershipEntity m WHERE m.deleteDate IS NULL AND m.price >= :price ORDER BY m.price ASC")
    List<MembershipEntity> findByPriceGreaterThanEqualAndDeleteDateIsNull(@Param("price") Integer price);
}
