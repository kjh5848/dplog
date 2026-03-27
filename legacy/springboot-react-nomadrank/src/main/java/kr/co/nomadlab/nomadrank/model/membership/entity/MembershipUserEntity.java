package kr.co.nomadlab.nomadrank.model.membership.entity;

import java.time.LocalDate;
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
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 멤버십 사용자 엔티티
 * 
 * 사용자별 멤버십 가입 정보를 관리하는 엔티티입니다.
 * 사용자와 멤버십 플랜 간의 다대다 관계를 중간 테이블로 구현합니다.
 * 
 * 주요 기능:
 * - 사용자별 멤버십 가입 이력 관리
 * - 멤버십 시작일과 종료일 관리
 * - 멤버십 상태 추적 (준비, 활성화, 만료)
 * - 사용자의 현재 활성 멤버십 확인
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`MEMBERSHIP_USER`")
@DynamicInsert
@DynamicUpdate
public class MembershipUserEntity {

    /**
     * 멤버십 사용자 고유 ID (기본키)
     * 자동 증가되는 고유 식별자
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, columnDefinition = "BIGINT COMMENT '멤버십 사용자 고유 ID'")
    private Long id;

    /**
     * 사용자 정보
     * 멤버십을 가입한 사용자
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity userEntity;

    /**
     * 멤버십 정보
     * 사용자가 가입한 멤버십 플랜
     */
    @ManyToOne
    @JoinColumn(name = "membership_id", nullable = false)
    private MembershipEntity membershipEntity;

    /**
     * 멤버십 시작일
     * 멤버십 이용 시작 날짜
     */
    @Column(name="start_date", nullable = false, columnDefinition = "DATE NOT NULL COMMENT '멤버십 시작일'")
    private LocalDate startDate;

    /**
     * 멤버십 종료일
     * 멤버십 이용 종료 날짜
     */
    @Column(name="end_date", columnDefinition = "DATE COMMENT '멤버십 종료일 (NULL=무제한)'")
    private LocalDate endDate;

    /**
     * 멤버십 상태
     * READY(준비), ACTIVATE(활성화), EXPIRED(만료)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "membership_state", columnDefinition = "VARCHAR(20) COMMENT '멤버십 상태 (READY:준비, ACTIVATE:활성화, EXPIRED:만료)'")
    private MembershipState membershipState;

    /**
     * 멤버십 가입일
     * 사용자가 멤버십에 가입한 날짜, 자동 생성
     */
    @Column(name = "create_date", updatable = false, nullable = false, columnDefinition = "DATETIME NOT NULL COMMENT '멤버십 가입일'")
    @CreationTimestamp
    private LocalDateTime createDate;

    /**
     * 멤버십 정보 수정일
     * 멤버십 가입 정보가 마지막으로 수정된 날짜, 자동 업데이트
     */
    @Column(name = "update_date", columnDefinition = "DATETIME COMMENT '멤버십 정보 수정일'")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    /**
     * 멤버십 삭제일
     * 소프트 삭제를 위한 삭제 날짜
     */
    @Column(name = "delete_date", columnDefinition = "DATETIME COMMENT '멤버십 삭제일 (소프트 삭제용)'")
    private LocalDateTime deleteDate;

}
