package kr.co.nomadlab.dplog.auth.repository;

import kr.co.nomadlab.dplog.auth.domain.AuthProvider;
import kr.co.nomadlab.dplog.auth.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Member Repository
 */
public interface MemberRepository extends JpaRepository<Member, Long> {

    /** 인증 제공자 + 제공자 ID로 회원 조회 (카카오 로그인용) */
    Optional<Member> findByProviderAndProviderId(AuthProvider provider, String providerId);

    /** 이메일로 회원 조회 */
    Optional<Member> findByEmail(String email);
}
