package kr.co.nomadlab.nomadrank.model.payment.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentChargeType;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentMethod;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentStatus;
import kr.co.nomadlab.nomadrank.domain.payment.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 결제 이력 엔티티 (전환 단계: CHARGE 테이블을 사용)
 * 모든 결제 시도와 결과를 기록
 */
@Entity
@Table(name = "CHARGE")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChargeEntity {

    @Id
    @Column(name = "payment_id", length = 100)
    private String paymentId; // 포트원 결제 ID

    @Column(name = "subscription_id", length = 100)
    private String subscriptionId; // 구독 참조 (nullable: 일회성 결제도 가능)

    @Column(name = "invoice_id", length = 100)
    private String invoiceId; // 인보이스 참조 (선택)

    @Column(name = "user_id", nullable = false)
    private Long userId; // 사용자 ID

    @Column(name = "issue_id", length = 100)
    private String issueId; // 빌링키 참조

    @Column(name = "merchant_uid", length = 100)
    private String merchantUid; // 가맹점 주문번호

    @Column(name = "membership_id")
    private Long membershipId; // 결제 대상 멤버십 ID

    @Column(name = "membership_user_id")
    private Long membershipUserId; // 결제 대상 멤버십 사용자 엔티티 ID

    @Column(name = "amount", nullable = false, precision = 10, scale = 0)
    private BigDecimal amount; // 결제 금액

    @Column(name = "currency", length = 3, nullable = false)
    @Builder.Default
    private String currency = "KRW"; // 통화

    @Column(name = "order_name", length = 200)
    private String orderName; // 주문명

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod; // 결제 수단

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status; // 결제 상태

    @Column(name = "pg_response_code", length = 20)
    private String pgResponseCode; // PG사 응답 코드

    @Column(name = "error_message", length = 1000)
    private String errorMessage; // 에러 메시지

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_type", nullable = false, length = 30)
    private PaymentType paymentType; // 결제 타입

    @Enumerated(EnumType.STRING)
    @Column(name = "charge_type", length = 30)
    private PaymentChargeType chargeType; // 결제/청구 타입(업그레이드/프로레이션 등)

    @Column(name = "portone_payment_id", length = 100)
    private String portonePaymentId; // 실제 PortOne 결제 ID (first_payment 등)

    @Column(name = "requested_at", nullable = false)
    @Builder.Default
    private LocalDateTime requestedAt = LocalDateTime.now(); // 결제 요청 시간

    @Column(name = "paid_at")
    private LocalDateTime paidAt; // 결제 완료 시간

    @Column(name = "failed_at")
    private LocalDateTime failedAt; // 결제 실패 시간

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt; // 결제 취소 시간

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.requestedAt == null) {
            this.requestedAt = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    /** 결제 성공 처리 */
    public void markAsPaid() {
        this.status = PaymentStatus.PAID;
        this.paidAt = LocalDateTime.now();
    }

    /** 결제 실패 처리 */
    public void markAsFailed(String errorMessage, String pgResponseCode) {
        this.status = PaymentStatus.FAILED;
        this.failedAt = LocalDateTime.now();
        this.errorMessage = errorMessage;
        this.pgResponseCode = pgResponseCode;
    }

    /** 결제 취소 처리 */
    public void markAsCancelled(String cancelReason) {
        this.status = PaymentStatus.CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.errorMessage = cancelReason;
    }

    /** 환불 처리 */
    public void markAsRefunded(boolean fullRefund, String reason) {
        this.status = fullRefund ? PaymentStatus.REFUNDED : PaymentStatus.PARTIAL_CANCELLED;
        this.cancelledAt = LocalDateTime.now();
        this.errorMessage = reason;
        this.chargeType = PaymentChargeType.REFUND;
    }

    /** 결제가 성공했는지 확인 */
    public boolean isSuccessful() {
        return this.status == PaymentStatus.PAID;
    }
}
