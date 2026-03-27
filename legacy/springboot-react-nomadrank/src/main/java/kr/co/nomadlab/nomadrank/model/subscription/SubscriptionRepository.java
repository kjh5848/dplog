package kr.co.nomadlab.nomadrank.model.subscription;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus;

/**
 * 구독 레포지토리
 */
@Repository
public interface SubscriptionRepository extends JpaRepository<SubscriptionEntity, String> {

    /**
     * 사용자별 활성 구독 조회
     */
    List<SubscriptionEntity> findByUserIdAndStatus(Long userId, SubscriptionStatus status);

    /**
     * 사용자의 현재 활성 구독 조회 (단일)
     */
    Optional<SubscriptionEntity> findByUserIdAndStatusOrderByCreatedAtDesc(
            Long userId, SubscriptionStatus status);

    /**
     * 특정 날짜에 결제할 활성 구독 조회
     */
    List<SubscriptionEntity> findByNextBillingDateAndStatus(
            LocalDate billingDate, SubscriptionStatus status);

    /**
     * 빌링키별 활성 구독 조회
     */
    List<SubscriptionEntity> findByIssueIdAndStatus(String issueId, SubscriptionStatus status);

    /**
     * 사용자별 모든 구독 조회 (최신순)
     */
    List<SubscriptionEntity> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<SubscriptionEntity> findBySubscriptionIdAndUserId(String subscriptionId, Long userId);

    /**
     * 결제 실패가 많은 구독 조회
     */
    @Query("SELECT s FROM SubscriptionEntity s WHERE s.failureCount >= :maxFailures AND s.status = :status")
    List<SubscriptionEntity> findByFailureCountGreaterThanEqualAndStatus(
            @Param("maxFailures") Integer maxFailures,
            @Param("status") SubscriptionStatus status);

    /**
     * 특정 기간 내 결제 예정 구독 조회
     */
    @Query("SELECT s FROM SubscriptionEntity s WHERE s.nextBillingDate BETWEEN :startDate AND :endDate AND s.status = :status")
    List<SubscriptionEntity> findSubscriptionsInDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("status") SubscriptionStatus status);

    /**
     * 만료된 구독 조회
     */
    @Query("SELECT s FROM SubscriptionEntity s WHERE s.endDate <= :currentDate AND s.status IN :statuses")
    List<SubscriptionEntity> findExpiredSubscriptions(
            @Param("currentDate") LocalDate currentDate,
            @Param("statuses") List<SubscriptionStatus> statuses);

    /**
     * 사용자의 특정 상품 구독 조회
     */
    Optional<SubscriptionEntity> findByUserIdAndMembershipLevelAndStatus(
            Long userId, String membershipLevel, SubscriptionStatus status);

    /**
     * 재시도가 필요한 구독 조회
     */
    @Query("SELECT s FROM SubscriptionEntity s WHERE s.nextRetryAt <= :retryDate AND s.retryCount < :maxRetries AND s.status = :status")
    List<SubscriptionEntity> findRetryableSubscriptions(
            @Param("retryDate") OffsetDateTime retryDate,
            @Param("maxRetries") Integer maxRetries,
            @Param("status") SubscriptionStatus status);

    List<SubscriptionEntity> findByCancelScheduledAtAndStatus(LocalDate cancelScheduledAt,
            SubscriptionStatus status);

    /**
     * 예약 ID가 있는 구독 조회 (여러 상태)
     */
    List<SubscriptionEntity> findByScheduleIdIsNotNullAndStatusIn(List<SubscriptionStatus> statuses);
}
