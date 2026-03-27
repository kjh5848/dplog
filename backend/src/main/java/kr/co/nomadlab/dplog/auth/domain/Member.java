package kr.co.nomadlab.dplog.auth.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 회원 엔티티
 * - 프론트엔드 User 타입과 1:1 대응
 * - 카카오 OIDC 로그인으로 가입한 회원 정보 저장
 */
@Entity
@Table(name = "members", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"provider", "provider_id"})
})
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 이메일 */
    @Column(nullable = false)
    private String email;

    /** 닉네임 (카카오 프로필 닉네임) */
    @Column(nullable = false)
    private String nickname;

    /** 이름 */
    @Column(nullable = false)
    private String name;

    /** 프로필 이미지 URL */
    @Column(length = 500)
    private String profileImageUrl;

    /** 인증 제공자 (KAKAO, LOCAL) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuthProvider provider;

    /** 제공자별 고유 ID (카카오 sub 값) */
    @Column(name = "provider_id", nullable = false)
    private String providerId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // 기본 생성자 (JPA 필수)
    protected Member() {}

    public Member(String email, String nickname, String name, String profileImageUrl,
                  AuthProvider provider, String providerId) {
        this.email = email;
        this.nickname = nickname;
        this.name = name;
        this.profileImageUrl = profileImageUrl;
        this.provider = provider;
        this.providerId = providerId;
    }

    // Getter
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getNickname() { return nickname; }
    public String getName() { return name; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public AuthProvider getProvider() { return provider; }
    public String getProviderId() { return providerId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // 프로필 업데이트 (카카오 로그인 시 최신 정보 반영)
    public void updateProfile(String nickname, String profileImageUrl) {
        this.nickname = nickname;
        this.profileImageUrl = profileImageUrl;
    }

    public void updateName(String name) {
        this.name = name;
    }
}
