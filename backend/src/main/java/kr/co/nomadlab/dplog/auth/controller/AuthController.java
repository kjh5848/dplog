package kr.co.nomadlab.dplog.auth.controller;

import jakarta.validation.Valid;
import kr.co.nomadlab.dplog.auth.dto.*;
import kr.co.nomadlab.dplog.auth.service.AuthService;
import kr.co.nomadlab.dplog.common.dto.ResDTO;
import kr.co.nomadlab.dplog.common.exception.BusinessException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

/**
 * 인증 컨트롤러
 * - POST /v1/auth/kakao/login — 카카오 OIDC 로그인 → JWT 발급
 * - GET  /v1/auth/me         — 액세스 토큰으로 유저 정보 반환
 * - POST /v1/auth/refresh    — 리프레시 토큰 → 새 토큰 쌍 발급
 * - POST /v1/auth/logout     — 리프레시 토큰 무효화
 */
@RestController
@RequestMapping("/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * 카카오 OIDC 로그인
     *
     * 프론트엔드에서 카카오 인가 코드 + state를 전송하면
     * 카카오 토큰 교환 → JWT 토큰 쌍 + 유저 정보 반환
     */
    @PostMapping("/kakao/login")
    public ResponseEntity<ResDTO<LoginResponse>> kakaoLogin(@Valid @RequestBody KakaoLoginRequest request) {
        LoginResponse response = authService.kakaoLogin(request);
        return ResponseEntity.ok(ResDTO.ok(response));
    }

    /**
     * 현재 로그인된 유저 정보 조회
     *
     * Authorization: Bearer {accessToken} 헤더 필요
     */
    @GetMapping("/me")
    public ResponseEntity<ResDTO<MemberResponse>> getMe() {
        Long memberId = getAuthenticatedMemberId();
        MemberResponse response = authService.getMe(memberId);
        return ResponseEntity.ok(ResDTO.ok(response));
    }

    /**
     * 액세스 토큰 갱신
     *
     * 리프레시 토큰으로 새로운 토큰 쌍(액세스 + 리프레시) 발급
     */
    @PostMapping("/refresh")
    public ResponseEntity<ResDTO<RefreshResponse>> refreshToken(@Valid @RequestBody RefreshRequest request) {
        RefreshResponse response = authService.refresh(request);
        return ResponseEntity.ok(ResDTO.ok(response));
    }

    /**
     * 로그아웃
     *
     * 서버에서 리프레시 토큰을 무효화(DB 삭제)
     */
    @PostMapping("/logout")
    public ResponseEntity<ResDTO<Void>> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(ResDTO.ok());
    }

    /**
     * SecurityContext에서 인증된 memberId 추출
     */
    private Long getAuthenticatedMemberId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw BusinessException.unauthorized("인증이 필요합니다.");
        }
        return (Long) authentication.getPrincipal();
    }
}
