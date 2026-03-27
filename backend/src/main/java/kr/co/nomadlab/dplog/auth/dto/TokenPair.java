package kr.co.nomadlab.dplog.auth.dto;

/**
 * JWT 토큰 쌍 DTO
 * - 프론트엔드 TokenPair 타입과 1:1 대응
 */
public record TokenPair(
        /** 액세스 토큰 (API 인증용, 단기) */
        String accessToken,

        /** 리프레시 토큰 (토큰 갱신용, 장기) */
        String refreshToken
) {}
