package kr.co.nomadlab.nomadrank.model.membership.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.domain.use_log.enums.ServiceSort;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 멤버십 상세 엔티티
 * 
 * 멤버십 플랜별 서비스 사용 제한을 정의하는 엔티티입니다.
 * 각 멤버십이 제공하는 서비스별 사용 제한 횟수를 관리합니다.
 * 
 * 주요 기능:
 * - 서비스 종류별 사용 제한 정의
 * - 네이버 플레이스 관련 서비스 제한 관리
 * - 멤버십별 차별화된 서비스 제공 수준 설정
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`MEMBERSHIP_DETAIL`")
@DynamicInsert
@DynamicUpdate
public class MembershipDetailEntity {

    /**
     * 멤버십 상세 고유 ID (기본키)
     * 자동 증가되는 고유 식별자
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, columnDefinition = "BIGINT COMMENT '멤버십 상세 고유 ID'")
    private Long id;

    /**
     * 서비스 종류
     * 제한을 적용할 서비스의 종류 (네이버 플레이스 실시간순위, 순위추적, 연관키워드, 키워드조회 등)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "service_sort", columnDefinition = "VARCHAR(50) COMMENT '서비스 종류 (NPLACE_RANK_REALTIME, NPLACE_RANK_TRACK 등)'")
    private ServiceSort serviceSort;

    /**
     * 서비스 사용 제한 횟수
     * 해당 서비스의 월간/일간 사용 가능 횟수 (null인 경우 무제한)
     */
    @Column(name="limit_count", columnDefinition = "INT COMMENT '서비스 사용 제한 횟수 (null: 무제한)'")
    private Integer limitCount;

    /**
     * 소속 멤버십
     * 이 상세 정보가 속한 멤버십 플랜
     */
    @ManyToOne
    @JoinColumn(name = "membership_id", referencedColumnName = "id")
    private MembershipEntity membershipEntity;

    /**
     * 상세 정보 생성일
     * 멤버십 상세 정보가 생성된 날짜, 자동 생성
     */
    @Column(name = "create_date", updatable = false, nullable = false, columnDefinition = "DATETIME NOT NULL COMMENT '상세 정보 생성일'")
    @CreationTimestamp
    private LocalDateTime createDate;

    /**
     * 상세 정보 수정일
     * 멤버십 상세 정보가 마지막으로 수정된 날짜, 자동 업데이트
     */
    @Column(name = "update_date", columnDefinition = "DATETIME COMMENT '상세 정보 수정일'")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    /**
     * 상세 정보 삭제일
     * 소프트 삭제를 위한 삭제 날짜
     */
    @Column(name = "delete_date", columnDefinition = "DATETIME COMMENT '상세 정보 삭제일 (소프트 삭제용)'")
    private LocalDateTime deleteDate;
}