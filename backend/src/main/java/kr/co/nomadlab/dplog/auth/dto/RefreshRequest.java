package kr.co.nomadlab.dplog.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 토큰 갱신 요청 DTO
 * - 프론트엔드 RefreshTokenRequest 타입과 1:1 대응
 */
public record RefreshRequest(
        @NotBlank(message = "리프레시 토큰은 필수입니다")
        String refreshToken
) {}
