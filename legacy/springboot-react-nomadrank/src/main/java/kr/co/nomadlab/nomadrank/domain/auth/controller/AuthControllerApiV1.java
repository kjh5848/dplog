package kr.co.nomadlab.nomadrank.domain.auth.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.request.ReqAuthLoginDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.dto.request.ReqKakaoCallbackDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.service.AuthServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/auth")
@Validated
public class AuthControllerApiV1 {

    private final AuthServiceApiV1 authServiceApiV1;

    @PostMapping("/login")
    public HttpEntity<?> login(@RequestBody @Valid ReqAuthLoginDTOApiV1 reqDto, HttpSession session) {
        System.out.println("로그인 세션 ID: " + session.getId());
        System.out.println("로그인 요청: " + reqDto);
        return authServiceApiV1.login(reqDto, session);
    }

    @PostMapping("/logout")
    public HttpEntity<?> login(HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfo = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfo == null) {
            throw new AuthenticationException(null);
        }
        System.out.println("로그아웃 세션 ID: " + resAuthInfo);
        return authServiceApiV1.logout(session);
    }

    @GetMapping("/info")
    public HttpEntity<?> info(
            HttpSession session,
            HttpServletRequest request,
            @CookieValue(value = "JSESSIONID", required = false) String jsessionCookie) {

        // 1) 서버에 있는 세션 객체의 ID
        String serverSessionId = session.getId();
        System.out.println("▶ 서버 세션.getId(): " + serverSessionId);

        // 2) 클라이언트가 보낸(요청 헤더로 넘어온) 세션 ID
        String requestedSessionId = request.getRequestedSessionId();
        System.out.println("▶ request.getRequestedSessionId(): " + requestedSessionId);

        // 3) 쿠키로 직접 넘어온 JSESSIONID 값 (@CookieValue)
        System.out.println("▶ 클라이언트 쿠키 JSESSIONID: " + jsessionCookie);
        
        System.out.println("info 세션" + session.getId());
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        System.out.println("info resAuthInfoDTOApiV1: " + resAuthInfoDTOApiV1);
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return new ResponseEntity<>(ResDTO.builder().code(0).message("success").data(resAuthInfoDTOApiV1).build(),
                HttpStatus.OK);
    }

    @GetMapping("/session")
    public HttpEntity<?> getSessionList(HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return authServiceApiV1.getSessionList(resAuthInfoDTOApiV1.getUser().getAuthority());
    }

    @DeleteMapping("/session/{username}")
    public HttpEntity<?> deleteSession(@PathVariable(name = "username") String username, HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return authServiceApiV1.deleteSession(resAuthInfoDTOApiV1.getUser().getAuthority(), username);
    }


}
