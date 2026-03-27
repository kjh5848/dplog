package kr.co.nomadlab.dplog.auth.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 리프레시 토큰 저장 엔티티
 * - JWT 리프레시 토큰을 DB에 저장하여 무효화 관리
 * - 로그아웃 시 해당 토큰 삭제로 무효화
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_refresh_token", columnList = "token"),
        @Index(name = "idx_refresh_member_id", columnList = "member_id")
})
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 리프레시 토큰 값 */
    @Column(nullable = false, unique = true, length = 500)
    private String token;

    /** 소유자 회원 ID */
    @Column(name = "member_id", nullable = false)
    private Long memberId;

    /** 만료 시각 */
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 기본 생성자 (JPA 필수)
    protected RefreshToken() {}

    public RefreshToken(String token, Long memberId, LocalDateTime expiresAt) {
        this.token = token;
        this.memberId = memberId;
        this.expiresAt = expiresAt;
    }

    // Getter
    public Long getId() { return id; }
    public String getToken() { return token; }
    public Long getMemberId() { return memberId; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    /** 토큰 만료 여부 확인 */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
