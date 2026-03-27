package kr.co.nomadlab.nomadrank.model.payment.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentType;
import kr.co.nomadlab.nomadrank.model.payment.entity.ChargeEntity;

/**
 * 결제 이력 레포지토리 (전환 단계: CHARGE 테이블)
 */
@Repository
public interface ChargeRepository extends JpaRepository<ChargeEntity, String> {

        Page<ChargeEntity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

        List<ChargeEntity> findBySubscriptionIdOrderByCreatedAtDesc(String subscriptionId);

        List<ChargeEntity> findByUserIdAndStatusOrderByCreatedAtDesc(
                        Long userId, PaymentStatus status);

        @Query("SELECT p FROM ChargeEntity p WHERE p.userId = :userId AND p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
        List<ChargeEntity> findByUserIdAndDateRange(
                        @Param("userId") Long userId,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        List<ChargeEntity> findByUserIdAndPaymentTypeOrderByCreatedAtDesc(
                        Long userId, PaymentType paymentType);

        Optional<ChargeEntity> findFirstByUserIdAndStatusOrderByPaidAtDesc(
                        Long userId, PaymentStatus status);

        Optional<ChargeEntity> findFirstBySubscriptionIdOrderByCreatedAtDesc(String subscriptionId);

        @Query("SELECT SUM(p.amount) FROM ChargeEntity p WHERE p.userId = :userId AND p.status = :status AND p.createdAt BETWEEN :startDate AND :endDate")
        BigDecimal getTotalAmountByUserIdAndStatusAndDateRange(
                        @Param("userId") Long userId,
                        @Param("status") PaymentStatus status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT COUNT(p) FROM ChargeEntity p WHERE p.userId = :userId AND p.status = :status AND p.createdAt BETWEEN :startDate AND :endDate")
        Long getPaymentCountByUserIdAndStatusAndDateRange(
                        @Param("userId") Long userId,
                        @Param("status") PaymentStatus status,
                        @Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        @Query("SELECT p FROM ChargeEntity p WHERE p.status = :status AND p.createdAt >= :since ORDER BY p.createdAt DESC")
        List<ChargeEntity> findFailedPaymentsSince(
                        @Param("status") PaymentStatus status,
                        @Param("since") LocalDateTime since);

        List<ChargeEntity> findByIssueIdOrderByCreatedAtDesc(String issueId);

        Optional<ChargeEntity> findByMerchantUid(String merchantUid);

        Optional<ChargeEntity> findFirstBySubscriptionIdAndStatusAndPortonePaymentIdIsNotNullOrderByPaidAtDesc(
                        String subscriptionId,
                        PaymentStatus status);

        @Query("SELECT p FROM ChargeEntity p WHERE p.subscriptionId = :subscriptionId AND p.status = :status ORDER BY p.paidAt DESC")
        List<ChargeEntity> findSuccessfulPaymentsBySubscription(
                        @Param("subscriptionId") String subscriptionId,
                        @Param("status") PaymentStatus status);
}
