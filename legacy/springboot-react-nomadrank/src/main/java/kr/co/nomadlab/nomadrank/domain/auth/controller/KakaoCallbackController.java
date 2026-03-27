package kr.co.nomadlab.nomadrank.domain.auth.controller;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.domain.auth.dto.request.ReqKakaoCallbackDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.service.KakaoOAuthService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/auth")
public class KakaoCallbackController {

        private final KakaoOAuthService kakaoOAuthService;

        /**
         * JSON POST 콜백 지원
         */
        @PostMapping(value = "/kakao/callback", consumes = MediaType.APPLICATION_JSON_VALUE)
        public HttpEntity<?> kakaoCallbackJson(@RequestBody @Valid ReqKakaoCallbackDTOApiV1 reqDto,
                        HttpSession session) {
                System.out.println("카카오 콜백 세션 ID: " + session.getId());
                System.out.println("카카오 콜백 요청: code="
                                + reqDto.getCode().substring(0, Math.min(10, reqDto.getCode().length())) + "..., state="
                                + reqDto.getState());
                return kakaoOAuthService.handleCallback(reqDto, session);
        }

        /**
         * 카카오 OAuth state 값 발급
         */
        @GetMapping("/kakao/state")
        public HttpEntity<?> issueKakaoState(HttpSession session) {
                String state = java.util.UUID.randomUUID().toString();
                session.setAttribute("kakao_oauth_state", state);
                String scope = kakaoOAuthService.getRequiredScopesForAuthorize();
                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(java.util.Map.of(
                                                                "state", state,
                                                                "scope", scope))
                                                .build(),
                                HttpStatus.OK);
        }

        /**
         * 카카오 로그인 시작을 위한 authorize URL 발급
         * - 서버에서 state를 생성해 세션에 저장하고, 필수 스코프를 포함한 URL을 내려줍니다.
         */
        @GetMapping("/kakao/authorize-url")
        public HttpEntity<?> getAuthorizeUrl(HttpSession session) {
                String state = java.util.UUID.randomUUID().toString();
                session.setAttribute("kakao_oauth_state", state);

                // 서비스에 위임하여 URL 구성 (필수 스코프 포함)
                String url = kakaoOAuthService.buildAuthorizeUrlWithRequiredScopes(state);

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(java.util.Map.of(
                                                                "state", state,
                                                                "authorizeUrl", url))
                                                .build(),
                                HttpStatus.OK);
        }

}
