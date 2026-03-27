package kr.co.nomadlab.nomadrank.domain.auth.dto.external;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

/**
 * 카카오 토큰 발급 API 응답 DTO
 * 
 * 카카오 OAuth 서버에서 액세스 토큰 발급 시 반환되는 데이터를 매핑합니다.
 * 
 * 참조: https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-token
 */
@Getter
@Setter
public class KakaoTokenResponseDTO {

    /**
     * 토큰 타입 (일반적으로 "bearer")
     */
    @JsonProperty("token_type")
    private String tokenType;

    /**
     * 액세스 토큰
     * 카카오 API 호출에 사용되는 토큰
     */
    @JsonProperty("access_token")
    private String accessToken;

    /**
     * 액세스 토큰 만료 시간 (초)
     * 일반적으로 21599초 (6시간)
     */
    @JsonProperty("expires_in")
    private Integer expiresIn;

    /**
     * 리프레시 토큰
     * 액세스 토큰 갱신에 사용 (현재 구현에서는 사용하지 않음)
     */
    @JsonProperty("refresh_token")
    private String refreshToken;

    /**
     * 리프레시 토큰 만료 시간 (초)
     * 일반적으로 5183999초 (약 60일)
     */
    @JsonProperty("refresh_token_expires_in")
    private Integer refreshTokenExpiresIn;

    /**
     * 인증된 사용자의 정보 조회 권한 범위
     * 예: "account_email profile_nickname"
     */
    @JsonProperty("scope")
    private String scope;

}