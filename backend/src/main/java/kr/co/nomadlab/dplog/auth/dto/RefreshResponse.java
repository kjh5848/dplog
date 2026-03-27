package kr.co.nomadlab.dplog.auth.dto;

/**
 * 토큰 갱신 응답 DTO
 * - 프론트엔드 RefreshTokenResponse 타입과 1:1 대응
 */
public record RefreshResponse(
        /** 새 토큰 쌍 */
        TokenPair tokens
) {}
