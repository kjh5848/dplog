package kr.co.nomadlab.nomadrank.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**
 * 카카오 OAuth 콜백 요청 DTO
 * 
 * 프론트엔드에서 카카오 로그인 완료 후 전달되는 정보를 담는 DTO입니다.
 * 카카오에서 제공하는 인증 코드와 CSRF 방지를 위한 state 파라미터를 포함합니다.
 */
@Getter
@Setter
public class ReqKakaoCallbackDTOApiV1 {

    /**
     * 카카오 인증 코드
     * 카카오 OAuth 서버에서 제공하는 인증 코드
     * 이 코드로 액세스 토큰을 발급받을 수 있습니다.
     */
    @NotBlank(message = "카카오 인증 코드는 필수입니다.")
    private String code;

    /**
     * CSRF 방지용 state 파라미터
     * 요청 시작 시 생성된 랜덤 문자열로 CSRF 공격을 방지합니다.
     * 프론트엔드에서 세션에 저장된 값과 일치해야 합니다.
     */
    @NotBlank(message = "State 파라미터는 필수입니다.")
    private String state;

}