package kr.co.nomadlab.nomadrank.model.subscription;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.domain.payment.enums.BillingCycle;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionScheduleStatus;
import kr.co.nomadlab.nomadrank.domain.payment.enums.SubscriptionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 구독 엔티티
 * 사용자의 정기결제 구독 정보를 저장
 */
@Entity
@Table(name = "SUBSCRIPTIONS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionEntity {
    
    @Id
    @Column(name = "subscription_id", length = 100)
    private String subscriptionId;  // 구독 고유 ID
    
    @Column(name = "issue_id", length = 100, nullable = false)
    private String issueId;  // 빌링키 참조
    
    @Column(name = "user_id", nullable = false)
    private Long userId;  // 사용자 ID
    
    @Column(name = "membership_level", length = 50, nullable = false)
    private String membershipLevel;  // 맴버쉽 레벨 (예: "무료 0, 실속 1, 성장 2, 마스터 3")
    
    @Column(name = "membership_name", length = 100, nullable = false)
    private String membershipName;  // 맴버쉽 이름
    
    @Column(name = "amount", nullable = false, precision = 10, scale = 0)
    private BigDecimal amount;  // 월 결제 금액
    
    @Column(name = "billing_day", nullable = false)
    private Integer billingDay;  // 매월 결제일 (1-28)
    
    @Enumerated(EnumType.STRING)
    @Column(name = "billing_cycle", nullable = false)
    private BillingCycle billingCycle;  // 결제 주기
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SubscriptionStatus status;  // 구독 상태
    
    @Column(name = "next_billing_date", nullable = false)
    private LocalDate nextBillingDate;  // 다음 결제일
    
    @Column(name = "failure_count", nullable = false)
    @Builder.Default
    private Integer failureCount = 0;  // 연속 결제 실패 횟수

    @Column(name = "retry_count", nullable = false)
    @Builder.Default
    private Integer retryCount = 0; // 재시도 횟수

    @Column(name = "next_retry_at")
    private OffsetDateTime nextRetryAt; // 재시도 예정 시각
    
    @Column(name = "last_error_message", length = 500)
    private String lastErrorMessage;  // 마지막 에러 메시지

    @Column(name = "cancel_scheduled_at")
    private LocalDate cancelScheduledAt;

    @Column(name = "schedule_id", length = 100)
    private String scheduleId; // PortOne 예약 ID

    @Enumerated(EnumType.STRING)
    @Column(name = "schedule_status", length = 30)
    private SubscriptionScheduleStatus scheduleStatus;

    @Column(name = "schedule_last_synced_at")
    private OffsetDateTime scheduleLastSyncedAt;

    @Column(name = "next_billing_at")
    private OffsetDateTime nextBillingAt;

    @Column(name = "pending_membership_id")
    private Long pendingMembershipId;

    @Column(name = "pending_membership_level", length = 50)
    private String pendingMembershipLevel;

    @Column(name = "pending_membership_name", length = 100)
    private String pendingMembershipName;

    @Enumerated(EnumType.STRING)
    @Column(name = "pending_billing_cycle")
    private BillingCycle pendingBillingCycle;

    @Column(name = "pending_reason", length = 255)
    private String pendingReason;

    @Column(name = "pending_applied_at")
    private LocalDateTime pendingAppliedAt;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;  // 구독 시작일
    
    @Column(name = "end_date")
    private LocalDate endDate;  // 구독 종료일
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.startDate = LocalDate.now();
        // 구독 ID 자동 생성
        if (this.subscriptionId == null) {
            this.subscriptionId = "sub_" + System.currentTimeMillis() + "_" + this.userId;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
        
    /**
     * 결제 실패 횟수 증가
     */
    public void incrementFailureCount() {
        this.failureCount = (this.failureCount == null ? 0 : this.failureCount) + 1;
    }
    
    /**
     * 결제 실패 횟수 초기화
     */
    public void resetFailureCount() {
        this.failureCount = 0;
        this.lastErrorMessage = null;
    }
    
    /**
     * 구독이 활성 상태인지 확인
     */
    public boolean isActive() {
        return this.status == SubscriptionStatus.ACTIVE;
    }
    
    /**
     * 다음 결제일 설정 (월간 기준)
     */
    public void setNextMonthlyBillingDate() {
        if (this.nextBillingDate == null) {
            this.nextBillingDate = LocalDate.now();
        }
        if (this.billingCycle == BillingCycle.YEARLY) {
            this.nextBillingDate = this.nextBillingDate.plusYears(1);
        } else {
            this.nextBillingDate = this.nextBillingDate.plusMonths(1);
        }
    }
}
