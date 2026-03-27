package kr.co.nomadlab.nomadrank.model.user.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.Comment;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserStatus;
import kr.co.nomadlab.nomadrank.model.distributor.entity.DistributorEntity;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.nplace.rank.entity.NplaceRankShopEntity;
import kr.co.nomadlab.nomadrank.model.nstore.rank.entity.NstoreRankProductEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 사용자 엔티티
 * 
 * 시스템의 사용자 정보를 관리하는 엔티티입니다.
 * 카카오 싱크를 통한 회원가입과 일반 회원가입을 모두 지원합니다.
 * 
 * 주요 기능:
 * - 사용자 기본 정보 관리 (이름, 이메일, 전화번호 등)
 * - 카카오 싱크 연동 정보 (성별, 생년월일)
 * - 사업자 정보 (업체명, 사업자등록번호)
 * - 계정 상태 관리 (승인, 대기, 중지, 탈퇴)
 * - 포인트 잔액 관리
 * - 권한 관리
 * - 멤버십 정보 관리
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "`USER`")
@DynamicInsert
@DynamicUpdate
public class UserEntity {

    /**
     * 사용자 고유 ID (기본키)
     * 자동 증가되는 고유 식별자
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false)
    @Comment("사용자 고유 ID")
    private Long id;

    /**
     * 사용자 아이디 (로그인용)
     * 영문 소문자와 숫자 조합, 중복 불가
     */
    @Column(name = "username", nullable = false, unique = true, columnDefinition = "VARCHAR(50) NOT NULL UNIQUE COMMENT '사용자 아이디'")
    private String username;

    /**
     * 사용자 실명
     * 카카오 싱크에서 제공되는 실제 이름
     */
    @Column(name = "name", nullable = true, columnDefinition = "VARCHAR(100) COMMENT '사용자 실명'")
    private String name;

    /**
     * 이메일 주소
     * 회원가입 및 비밀번호 찾기용, 중복 불가
     */
    @Column(name = "email", nullable = true, unique = true, columnDefinition = "VARCHAR(255) UNIQUE COMMENT '이메일 주소'")
    private String email;

    /**
     * 비밀번호
     * 암호화되어 저장되는 로그인 비밀번호
     */
    @Column(name = "password", nullable = false, columnDefinition = "VARCHAR(255) NOT NULL COMMENT '암호화된 비밀번호'")
    private String password;

    /**
     * 성별
     * 카카오 싱크에서 제공되는 성별 정보 (male/female)
     */
    @Column(name = "gender", nullable = true, columnDefinition = "VARCHAR(10) COMMENT '성별 (male/female)'")
    private String gender;

    /**
     * 생년월일
     * 카카오 싱크에서 제공되는 생년월일 정보
     */
    @Column(name = "birth_date", nullable = true, columnDefinition = "DATE COMMENT '생년월일'")
    private LocalDate birthDate;

    /**
     * 업체명
     * 사업자 회원의 경우 업체명
     */
    @Column(name = "company_name", nullable = true, columnDefinition = "VARCHAR(200) COMMENT '업체명'")
    private String companyName;

    /**
     * 사업자등록번호
     * 사업자 회원의 사업자등록번호 (000-00-00000 형식)
     */
    @Column(name = "company_number", nullable = true, length = 10, columnDefinition = "VARCHAR(10) COMMENT '사업자등록번호'")
    private String companyNumber;

    /**
     * 전화번호
     * 사용자 연락처 (010-0000-0000 형식)
     */
    @Column(name = "tel", nullable = true, columnDefinition = "VARCHAR(20) COMMENT '전화번호'")
    private String tel;

    /**
     * 포인트 잔액
     * 사용자가 보유한 포인트 잔액, 기본값 0
     */
    @Builder.Default
    @Column(name = "balance", nullable = false, columnDefinition = "INT NOT NULL DEFAULT 0 COMMENT '포인트 잔액'")
    private Integer balance = 0;

    /**
     * 사용자 상태
     * COMPLETION(승인), WAITING(대기), STOP(중지), WITHDRAW(탈퇴)
     */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "VARCHAR(20) DEFAULT 'COMPLETION' COMMENT '사용자 상태 (COMPLETION:승인, WAITING:대기, STOP:중지, WITHDRAW:탈퇴)'")
    private UserStatus status = UserStatus.COMPLETION;

    /**
     * 계정 만료일
     * 사용자 계정의 만료일, 기본값은 현재시간 + 1년
     */
    @Builder.Default
    @Column(name = "expire_date", nullable = false, columnDefinition = "DATETIME NOT NULL COMMENT '계정 만료일'")
    private LocalDateTime expireDate = LocalDateTime.now().plusYears(1);

    /**
     * 계정 생성일
     * 사용자 계정이 생성된 날짜, 자동 생성
     */
    @Column(name = "create_date", updatable = false, nullable = false, columnDefinition = "DATETIME NOT NULL COMMENT '계정 생성일'")
    @CreationTimestamp
    private LocalDateTime createDate;

    /**
     * 계정 수정일
     * 사용자 정보가 마지막으로 수정된 날짜, 자동 업데이트
     */
    @Column(name = "update_date", columnDefinition = "DATETIME COMMENT '계정 수정일'")
    @UpdateTimestamp
    private LocalDateTime updateDate;

    /**
     * 계정 삭제일
     * 소프트 삭제를 위한 삭제 날짜
     */
    @Column(name = "delete_date", columnDefinition = "DATETIME COMMENT '계정 삭제일 (소프트 삭제용)'")
    private LocalDateTime deleteDate;

    /**
     * 마지막 로그인일
     * 사용자가 마지막으로 로그인한 날짜
     */
    @Column(name = "last_login_date", columnDefinition = "DATETIME COMMENT '마지막 로그인일'")
    private LocalDateTime lastLoginDate;

    /**
     * OAuth 제공자
     * 소셜 로그인 제공자 (LOCAL, KAKAO, GOOGLE, NAVER 등)
     */
    @Builder.Default
    @Column(name = "provider", length = 20, columnDefinition = "VARCHAR(20) DEFAULT 'LOCAL' COMMENT 'OAuth 제공자 (LOCAL, KAKAO, GOOGLE, NAVER)'")
    private String provider = "LOCAL";

    /**
     * OAuth 제공자 사용자 ID
     * 각 OAuth 제공자에서 제공하는 고유 사용자 식별자
     */
    @Column(name = "provider_id", length = 100, columnDefinition = "VARCHAR(100) COMMENT 'OAuth 제공자 사용자 ID'")
    private String providerId;

    /**
     * 프로필 이미지 URL
     * 사용자 프로필 이미지 URL (OAuth 제공자 또는 직접 업로드)
     */
    @Column(name = "profile_image", length = 500, columnDefinition = "VARCHAR(500) COMMENT '프로필 이미지 URL'")
    private String profileImage;

    /**
     * 사용자 선호 타임존 (IANA, 예: Asia/Seoul)
     */
    @Builder.Default
    @Column(name = "timezone", length = 50, columnDefinition = "VARCHAR(50) DEFAULT 'Asia/Seoul' COMMENT '사용자 타임존 (IANA)'")
    private String timezone = "Asia/Seoul";

    /**
     * 스토어 랭킹 상품 목록
     * 사용자가 등록한 스토어 랭킹 상품들의 목록
     */
    @OneToMany(mappedBy = "userEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<NstoreRankProductEntity> nstoreRankProductEntityList;

    /**
     * 플레이스 랭킹 상점 목록
     * 사용자가 등록한 플레이스 랭킹 상점들의 목록
     */
    @OneToMany(mappedBy = "userEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    private List<NplaceRankShopEntity> nplaceRankShopEntityList;

    /**
     * 소속 유통업체
     * 사용자가 소속된 유통업체 정보
     */
    @ManyToOne
    @JoinColumn(name = "distributor_id", referencedColumnName = "id")
    private DistributorEntity distributorEntity;

    /**
     * 사용자 권한 목록
     * 사용자가 가진 권한들의 목록, 기본값은 USER 권한
     */
    @Builder.Default
    @ElementCollection(targetClass = UserAuthoritySort.class, fetch = FetchType.EAGER)
    @JoinTable(name = "USER_AUTHORITY", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    private List<UserAuthoritySort> authority = List.of(UserAuthoritySort.USER);

    /**
     * 멤버십 사용자 목록
     * 사용자가 가입한 멤버십들의 목록
     */
    @OneToMany(mappedBy = "userEntity", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("endDate DESC")
    private List<MembershipUserEntity> membershipUserEntityList;

}
