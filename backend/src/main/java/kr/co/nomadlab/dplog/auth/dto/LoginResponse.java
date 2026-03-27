package kr.co.nomadlab.dplog.auth.dto;

/**
 * 로그인 응답 DTO
 * - 프론트엔드 LoginResponse 타입과 1:1 대응
 */
public record LoginResponse(
        /** 토큰 쌍 */
        TokenPair tokens,

        /** 유저 정보 */
        MemberResponse user
) {}
