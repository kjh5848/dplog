package kr.co.nomadlab.nomadrank.domain.user.naver.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.naver.dto.request.ReqUserNaverDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.user.naver.service.UserNaverServiceApiV1;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/user/naver")
@Validated
public class UserNaverControllerApiV1 {

    private final UserNaverServiceApiV1 userNaverServiceApiV1;

    @GetMapping
    public HttpEntity<?> getUserNaver(HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return userNaverServiceApiV1.getUserNaver(resAuthInfoDTOApiV1.getUser().getId());
    }

    @GetMapping("/status")
    public HttpEntity<?> getUserNaverStatus(HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return userNaverServiceApiV1.getUserNaverStatus(resAuthInfoDTOApiV1.getUser().getId());
    }

    @PostMapping
    public HttpEntity<?> add(
            HttpSession session,
            @RequestBody @Valid ReqUserNaverDTOApiV1 reqDto
            ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return userNaverServiceApiV1.saveUserNaver(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    @PutMapping
    public HttpEntity<?> update(
            HttpSession session,
            @RequestBody @Valid ReqUserNaverDTOApiV1 reqDto
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return userNaverServiceApiV1.updateUserNaver(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }
}
