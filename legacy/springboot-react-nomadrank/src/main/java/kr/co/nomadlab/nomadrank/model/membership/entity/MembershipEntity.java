package kr.co.nomadlab.nomadrank.model.membership.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 멤버십 플랜 엔티티
 * 
 * 시스템에서 제공하는 멤버십 플랜을 정의하는 엔티티입니다.
 * 각 멤버십은 포인트와 서비스별 사용 제한을 가지고 있습니다.
 * 
 * 주요 기능:
 * - 멤버십 플랜 정의 (이름, 포인트)
 * - 서비스별 사용 제한 관리 (MembershipDetailEntity 연결)
 * - 사용자별 멤버십 가입 관리 (MembershipUserEntity 연결)
 * - 멤버십 생명주기 관리 (생성, 수정, 삭제)
 */
@Getter
@Setter
@Builder(toBuilder = true)
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`MEMBERSHIP`")
@DynamicInsert
@DynamicUpdate
public class MembershipEntity {

    /**
     * 멤버십 고유 ID (기본키)
     * 자동 증가되는 고유 식별자
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", columnDefinition = "BIGINT COMMENT '멤버십 고유 ID'")
    private Long id;

    /**
     * 멤버십 이름
     * 멤버십 플랜의 명칭 (예: 베이직, 프리미엄, 엔터프라이즈)
     */
    @Column(name = "name", nullable = false, columnDefinition = "VARCHAR(255) NOT NULL COMMENT '멤버십 이름'")
    private String name;

    /**
     * 멤버십 포인트
     * 해당 멤버십이 제공하는 포인트 수량, 기본값 0
     */
    @Column(name = "point", nullable = false, columnDefinition = "INT NOT NULL DEFAULT 0 COMMENT '멤버십 포인트'")
    @Builder.Default
    private Integer point = 0;

    /**
     * 멤버십 가격
     * 월 구독 가격 (무료 멤버십의 경우 0)
     */
    @Column(name = "price", nullable = false, precision = 10, scale = 0, columnDefinition = "DECIMAL(10,0) NOT NULL DEFAULT 0 COMMENT '월 구독 가격'")
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    /** 연간 구독 가격 (선택) */
    @Column(name = "price_yearly", precision = 10, scale = 0, columnDefinition = "DECIMAL(10,0) COMMENT '연간 구독 가격'")
    private BigDecimal priceYearly;

    /** 할인율(%) */
    @Column(name = "discount_percent", columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private Integer discountPercent = 0;

    /**
     * 인기 멤버십 여부
     * UI에서 "인기" 배지 표시용 (일반적으로 PRO 멤버십)
     */
    @Column(name = "is_popular", columnDefinition = "BOOLEAN DEFAULT FALSE COMMENT '인기 멤버십 여부 (UI 배지 표시용)'")
    @Builder.Default
    private Boolean isPopular = false;

    /**
     * 색상 테마
     * UI에서 멤버십 카드 표시용 색상 스키마
     */
    @Column(name = "color_scheme", length = 50, columnDefinition = "VARCHAR(50) COMMENT 'UI 색상 테마 (blue, purple, orange 등)'")
    private String colorScheme;

    /**
     * 표시 순서
     * UI에서 멤버십 카드 정렬 순서 (낮은 숫자가 먼저 표시)
     */
    @Column(name = "sort_order", columnDefinition = "INT DEFAULT 0 COMMENT '멤버십 표시 순서 (낮은 숫자 우선)'")
    @Builder.Default
    private Integer sortOrder = 0;

    /** 등급(정렬/비교용) */
    @Column(name = "level", columnDefinition = "INT DEFAULT 0")
    @Builder.Default
    private Integer level = 0;

    /**
     * 멤버십 상세 목록
     * 해당 멤버십의 서비스별 사용 제한 정보 목록
     */
    @OneToMany(mappedBy = "membershipEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MembershipDetailEntity> membershipDetailEntityList;

    /**
     * 멤버십 설명 및 특징
     */
    @Column(name = "description", length = 500, columnDefinition = "VARCHAR(500) COMMENT '멤버십 설명 및 특징'")
    private String description;

    /** 권장 매출 규모 문구 */
    @Column(name = "recommended_revenue_hint", length = 100)
    private String recommendedRevenueHint;

    /** 체험 가능 여부 */
    @Column(name = "trial_available", columnDefinition = "BOOLEAN DEFAULT FALSE")
    @Builder.Default
    private Boolean trialAvailable = false;

    /** 체험 기간(일) */
    @Column(name = "trial_days")
    private Integer trialDays;

    /** 표시 권한(관리 플랜용) */
    @Enumerated(EnumType.STRING)
    @Column(name = "authority")
    private UserAuthoritySort authority;

    /**
     * 멤버십 생성일
     * 멤버십 플랜이 생성된 날짜, 자동 생성
     */
    @Column(name = "create_date", updatable = false, nullable = false, columnDefinition = "DATETIME NOT NULL COMMENT '멤버십 생성일'")
    @CreationTimestamp
    private LocalDateTime createDate;

    /**
     * 멤버십 수정일
     * 멤버십 플랜 정보가 마지막으로 수정된 날짜, 자동 업데이트
     */
    @Column(name = "update_date", columnDefinition = "DATETIME COMMENT '멤버십 수정일'")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    /**
     * 멤버십 삭제일
     * 소프트 삭제를 위한 삭제 날짜
     */
    @Column(name = "delete_date", columnDefinition = "DATETIME COMMENT '멤버십 삭제일 (소프트 삭제용)'")
    private LocalDateTime deleteDate;

    /**
     * 멤버십이 활성 상태인지 확인
     * 삭제되지 않은 멤버십인지 판단
     */
    public boolean isActive() {
        return this.deleteDate == null;
    }

    /**
     * 무료 멤버십인지 확인
     */
    public boolean isFree() {
        return "FREE".equals(this.name);
    }

}
