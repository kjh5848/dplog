package kr.co.nomadlab.nomadrank.model.payment.repository;

import kr.co.nomadlab.nomadrank.model.payment.entity.BillingKeyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 빌링키 레포지토리
 */
@Repository
public interface BillingKeyRepository extends JpaRepository<BillingKeyEntity, String> {
    
    /**
     * 사용자별 활성 빌링키 조회
     */
    List<BillingKeyEntity> findByUserIdAndStatus(Long userId, BillingKeyEntity.BillingKeyStatus status);
    
    /**
     * 사용자 ID와 발급 ID로 빌링키 조회
     */
    Optional<BillingKeyEntity> findByIssueIdAndUserId(String issueId, Long userId);
    
    /**
     * 사용자별 모든 빌링키 조회 (최신순)
     */
    List<BillingKeyEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    /**
     * 만료된 빌링키 조회
     */
    @Query("SELECT b FROM BillingKeyEntity b WHERE b.expiredAt < :now AND b.status = :status")
    List<BillingKeyEntity> findExpiredBillingKeys(@Param("now") LocalDateTime now, 
                                                  @Param("status") BillingKeyEntity.BillingKeyStatus status);
    
    /**
     * 사용자의 활성 빌링키 개수 조회
     */
    long countByUserIdAndStatus(Long userId, BillingKeyEntity.BillingKeyStatus status);
    
    /**
     * 사용자별 기본 빌링키 조회 (가장 최근 활성화된 것)
     */
    @Query("SELECT b FROM BillingKeyEntity b WHERE b.userId = :userId AND b.status = :status ORDER BY b.createdAt DESC LIMIT 1")
    Optional<BillingKeyEntity> findLatestActiveByUserId(@Param("userId") Long userId, 
                                                       @Param("status") BillingKeyEntity.BillingKeyStatus status);
    
    /**
     * 카드사별 빌링키 조회
     */
    List<BillingKeyEntity> findByUserIdAndIssuerNameAndStatus(Long userId, String issuerName, 
                                                             BillingKeyEntity.BillingKeyStatus status);
}