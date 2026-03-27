package kr.co.nomadlab.nomadrank.model.payment.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * 빌링키 엔티티
 * 포트원 V2 API를 통해 발급받은 빌링키 정보를 저장
 */
@Entity
@Table(name = "BILLING_KEYS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingKeyEntity {
    
    @Id
    @Column(name = "issue_id", length = 100)
    private String issueId;  // 포트원 V2 빌링키 발급 ID
    
    @Column(name = "user_id", nullable = false)
    private Long userId;  // 사용자 ID
    
    @Column(name = "billing_key", length = 500, nullable = false)
    private String billingKey;  // 실제 빌링키 (암호화 저장)
    
    @Column(name = "masked_card_number", length = 20)
    private String maskedCardNumber;  // 마스킹된 카드번호 (예: ****-****-****-1234)
    
    @Column(name = "issuer_name", length = 50)
    private String issuerName;  // 카드사명
    
    @Column(name = "card_type", length = 20)
    private String cardType;  // 카드 타입 (신용/체크)
    
    @Column(name = "card_brand", length = 20)
    private String cardBrand;  // 카드 브랜드 (VISA, MasterCard 등)
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BillingKeyStatus status;  // 빌링키 상태
    
    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;  // 발급 시간

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;  // 만료 시간

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.issuedAt == null) {
            this.issuedAt = now;
        }
        if (this.expiredAt == null) {
            this.expiredAt = this.issuedAt.plusYears(3);
        }
        if (this.status == null) {
            this.status = BillingKeyStatus.ACTIVE;
        }
    }
    
    /**
     * 빌링키 상태 열거형
     */
    public enum BillingKeyStatus {
        ACTIVE,    // 활성
        EXPIRED,   // 만료
        DELETED,   // 삭제
        SUSPENDED  // 정지
    }
    
    /**
     * 빌링키가 사용 가능한지 확인
     */
    public boolean isUsable() {
        return this.status == BillingKeyStatus.ACTIVE && 
               this.expiredAt.isAfter(LocalDateTime.now());
    }
}
