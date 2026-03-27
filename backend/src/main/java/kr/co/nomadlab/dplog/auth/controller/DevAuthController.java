package kr.co.nomadlab.dplog.auth.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.nomadlab.dplog.auth.domain.AuthProvider;
import kr.co.nomadlab.dplog.auth.domain.Member;
import kr.co.nomadlab.dplog.auth.dto.LoginResponse;
import kr.co.nomadlab.dplog.auth.dto.MemberResponse;
import kr.co.nomadlab.dplog.auth.dto.TokenPair;
import kr.co.nomadlab.dplog.auth.repository.MemberRepository;
import kr.co.nomadlab.dplog.auth.security.JwtTokenProvider;
import kr.co.nomadlab.dplog.common.dto.ResDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 개발 환경 전용 인증 컨트롤러
 * - 카카오 OIDC 없이 테스트 멤버로 즉시 JWT 발급
 * - 프로덕션 환경에서는 자동으로 비활성화됨 (@Profile("dev"))
 */
@RestController
@RequestMapping("/v1/auth/dev")
@Profile("dev")
@Tag(name = "Dev Auth", description = "개발 환경 전용 인증 (프로덕션 비활성화)")
public class DevAuthController {

    private static final Logger log = LoggerFactory.getLogger(DevAuthController.class);

    private final MemberRepository memberRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public DevAuthController(MemberRepository memberRepository,
                             JwtTokenProvider jwtTokenProvider) {
        this.memberRepository = memberRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    /**
     * 개발 환경 자동 로그인
     *
     * 테스트 멤버(dev@dplog.kr)를 자동 생성 또는 조회 후
     * JWT 토큰 쌍을 즉시 발급합니다.
     */
    @PostMapping("/login")
    @Operation(
            summary = "Dev 자동 로그인",
            description = "카카오 OIDC 없이 테스트 멤버로 즉시 JWT 토큰 발급 (dev 프로필에서만 동작)"
    )
    public ResponseEntity<ResDTO<LoginResponse>> devLogin() {
        // 테스트 멤버 조회 또는 생성
        Member member = memberRepository.findByProviderAndProviderId(AuthProvider.KAKAO, "dev-test-user")
                .orElseGet(() -> {
                    Member newMember = new Member(
                            "dev@dplog.kr",
                            "개발자",
                            "테스트유저",
                            null,
                            AuthProvider.KAKAO,
                            "dev-test-user"
                    );
                    Member saved = memberRepository.save(newMember);
                    log.info("Dev 테스트 멤버 생성: memberId={}", saved.getId());
                    return saved;
                });

        // JWT 토큰 쌍 발급
        TokenPair tokenPair = jwtTokenProvider.generateTokenPair(member);
        LoginResponse response = new LoginResponse(tokenPair, MemberResponse.from(member));

        log.info("Dev 로그인 성공: memberId={}, email={}", member.getId(), member.getEmail());
        return ResponseEntity.ok(ResDTO.ok(response));
    }
}
