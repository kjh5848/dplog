package kr.co.nomadlab.dplog.auth.service;

import kr.co.nomadlab.dplog.auth.client.KakaoOidcClient;
import kr.co.nomadlab.dplog.auth.domain.AuthProvider;
import kr.co.nomadlab.dplog.auth.domain.Member;
import kr.co.nomadlab.dplog.auth.domain.RefreshToken;
import kr.co.nomadlab.dplog.auth.dto.*;
import kr.co.nomadlab.dplog.auth.repository.MemberRepository;
import kr.co.nomadlab.dplog.auth.repository.RefreshTokenRepository;
import kr.co.nomadlab.dplog.auth.security.JwtTokenProvider;
import kr.co.nomadlab.dplog.common.exception.BusinessException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 인증 서비스
 * - 카카오 OIDC 로그인 → JWT 발급
 * - 토큰 갱신, 로그아웃, 유저 정보 조회
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final KakaoOidcClient kakaoOidcClient;
    private final JwtTokenProvider jwtTokenProvider;
    private final MemberRepository memberRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthService(KakaoOidcClient kakaoOidcClient,
                       JwtTokenProvider jwtTokenProvider,
                       MemberRepository memberRepository,
                       RefreshTokenRepository refreshTokenRepository) {
        this.kakaoOidcClient = kakaoOidcClient;
        this.jwtTokenProvider = jwtTokenProvider;
        this.memberRepository = memberRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    /**
     * 카카오 OIDC 로그인
     *
     * 1. 인가 코드로 카카오 토큰 교환 → id_token 파싱
     * 2. 기존 회원 조회 또는 신규 가입 (upsert)
     * 3. JWT 토큰 쌍(액세스 + 리프레시) 발급
     * 4. 리프레시 토큰 DB 저장
     */
    @Transactional
    public LoginResponse kakaoLogin(KakaoLoginRequest request) {
        log.info("카카오 로그인 시작: code={}...", request.code().substring(0, Math.min(10, request.code().length())));

        // 1. 카카오 인가 코드 → 유저 정보 추출
        KakaoOidcClient.KakaoUserInfo kakaoUser = kakaoOidcClient.exchangeCodeForUserInfo(request.code());

        // 2. 기존 회원 조회 또는 신규 가입
        Member member = memberRepository.findByProviderAndProviderId(AuthProvider.KAKAO, kakaoUser.sub())
                .map(existing -> {
                    // 기존 회원 → 프로필 업데이트
                    existing.updateProfile(kakaoUser.nickname(), kakaoUser.picture());
                    log.info("기존 회원 로그인: memberId={}, nickname={}", existing.getId(), kakaoUser.nickname());
                    return existing;
                })
                .orElseGet(() -> {
                    // 신규 회원 가입
                    Member newMember = new Member(
                            kakaoUser.email(),
                            kakaoUser.nickname(),
                            kakaoUser.nickname(),  // 이름은 닉네임과 동일하게 초기화
                            kakaoUser.picture(),
                            AuthProvider.KAKAO,
                            kakaoUser.sub()
                    );
                    Member saved = memberRepository.save(newMember);
                    log.info("신규 회원 가입: memberId={}, email={}", saved.getId(), kakaoUser.email());
                    return saved;
                });

        // 3. JWT 토큰 쌍 발급
        TokenPair tokenPair = jwtTokenProvider.generateTokenPair(member);

        // 4. 리프레시 토큰 DB 저장
        saveRefreshToken(tokenPair.refreshToken(), member.getId());

        return new LoginResponse(tokenPair, MemberResponse.from(member));
    }

    /**
     * 현재 로그인된 유저 정보 조회
     */
    @Transactional(readOnly = true)
    public MemberResponse getMe(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> BusinessException.notFound("회원을 찾을 수 없습니다."));
        return MemberResponse.from(member);
    }

    /**
     * 토큰 갱신
     *
     * 1. 리프레시 토큰 DB 조회 + 검증
     * 2. 기존 리프레시 토큰 삭제
     * 3. 새 토큰 쌍 발급 + 저장
     */
    @Transactional
    public RefreshResponse refresh(RefreshRequest request) {
        // 1. DB에서 리프레시 토큰 조회
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new BusinessException("AUTH_INVALID_TOKEN", 401, "유효하지 않은 리프레시 토큰입니다."));

        // 만료 확인
        if (storedToken.isExpired()) {
            refreshTokenRepository.delete(storedToken);
            throw new BusinessException("AUTH_TOKEN_EXPIRED", 401, "리프레시 토큰이 만료되었습니다.");
        }

        // JWT 서명 검증
        Long memberId;
        try {
            memberId = jwtTokenProvider.validateTokenAndGetMemberId(request.refreshToken());
        } catch (Exception e) {
            refreshTokenRepository.delete(storedToken);
            throw new BusinessException("AUTH_INVALID_TOKEN", 401, "리프레시 토큰 검증에 실패했습니다.");
        }

        // 2. 기존 리프레시 토큰 삭제
        refreshTokenRepository.delete(storedToken);

        // 3. 새 토큰 쌍 발급
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> BusinessException.notFound("회원을 찾을 수 없습니다."));

        TokenPair newTokenPair = jwtTokenProvider.generateTokenPair(member);

        // 새 리프레시 토큰 저장
        saveRefreshToken(newTokenPair.refreshToken(), memberId);

        log.info("토큰 갱신 성공: memberId={}", memberId);
        return new RefreshResponse(newTokenPair);
    }

    /**
     * 로그아웃 — 리프레시 토큰 무효화
     */
    @Transactional
    public void logout(LogoutRequest request) {
        refreshTokenRepository.findByToken(request.refreshToken())
                .ifPresent(token -> {
                    refreshTokenRepository.delete(token);
                    log.info("로그아웃: memberId={}", token.getMemberId());
                });
    }

    /**
     * 리프레시 토큰 DB 저장
     */
    private void saveRefreshToken(String token, Long memberId) {
        long refreshExpirationMs = jwtTokenProvider.getRefreshExpirationMs();
        LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(refreshExpirationMs / 1000);

        RefreshToken refreshToken = new RefreshToken(token, memberId, expiresAt);
        refreshTokenRepository.save(refreshToken);
    }
}
