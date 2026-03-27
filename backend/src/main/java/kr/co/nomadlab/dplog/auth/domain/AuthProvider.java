package kr.co.nomadlab.dplog.auth.domain;

/**
 * 인증 제공자 enum
 * - KAKAO: 카카오 OIDC 로그인
 * - LOCAL: 이메일/비밀번호 로그인 (향후 지원)
 */
public enum AuthProvider {
    KAKAO,
    LOCAL
}
