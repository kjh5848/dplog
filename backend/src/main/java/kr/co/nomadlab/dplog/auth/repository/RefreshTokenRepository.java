package kr.co.nomadlab.dplog.auth.repository;

import kr.co.nomadlab.dplog.auth.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * RefreshToken Repository
 */
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    /** 토큰 값으로 조회 */
    Optional<RefreshToken> findByToken(String token);

    /** 토큰 값으로 삭제 (로그아웃) */
    void deleteByToken(String token);

    /** 회원 ID로 모든 리프레시 토큰 삭제 (전체 세션 무효화) */
    void deleteByMemberId(Long memberId);
}
