package kr.co.nomadlab.dplog.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 카카오 로그인 요청 DTO
 * - 프론트엔드 KakaoLoginRequest 타입과 1:1 대응
 */
public record KakaoLoginRequest(
        /** 카카오 인가 코드 */
        @NotBlank(message = "인가 코드는 필수입니다")
        String code,

        /** CSRF 방지용 state */
        @NotBlank(message = "state는 필수입니다")
        String state
) {}
