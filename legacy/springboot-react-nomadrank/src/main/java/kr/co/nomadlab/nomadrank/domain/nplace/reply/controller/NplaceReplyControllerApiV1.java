package kr.co.nomadlab.nomadrank.domain.nplace.reply.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reply.dto.request.ReqNplaceReplyChangeNplaceReplyDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reply.service.NplaceReplyServiceApiV1;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/reply")
@Slf4j
public class NplaceReplyControllerApiV1 {

    private final NplaceReplyServiceApiV1 nplaceReplyServiceApiV1;

    @GetMapping
    public HttpEntity<?> getNplaceReplyStatusList(HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        Long userId = resAuthInfoDTOApiV1.getUser().getId();
        log.info("[NplaceReply][Request] GET /v1/reply userId={}", userId);
        ResponseEntity<?> responseEntity = (ResponseEntity<?>) nplaceReplyServiceApiV1.getNplaceReplyStatusList(userId);
        log.info("[NplaceReply][Response] GET /v1/reply userId={} status={} body={}", userId, responseEntity.getStatusCode(), responseEntity.getBody());
        return responseEntity;
    }

    @PostMapping
    public HttpEntity<?> changeNplaceReply(
            HttpSession session,
            @RequestBody @Valid ReqNplaceReplyChangeNplaceReplyDTOApiV1 reqDto
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        Long userId = resAuthInfoDTOApiV1.getUser().getId();
        log.info("[NplaceReply][Request] POST /v1/reply userId={} reqDto={}", userId, reqDto);
        ResponseEntity<?> responseEntity = (ResponseEntity<?>) nplaceReplyServiceApiV1.changeNplaceReply(userId, reqDto);
        log.info("[NplaceReply][Response] POST /v1/reply userId={} status={} body={}", userId, responseEntity.getStatusCode(), responseEntity.getBody());
        return responseEntity;
    }

    @DeleteMapping
    public HttpEntity<?> deleteNplaceReply(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        Long userId = resAuthInfoDTOApiV1.getUser().getId();
        log.info("[NplaceReply][Request] DELETE /v1/reply userId={}", userId);
        ResponseEntity<?> responseEntity = (ResponseEntity<?>) nplaceReplyServiceApiV1.deleteNplaceReply(userId);
        log.info("[NplaceReply][Response] DELETE /v1/reply userId={} status={} body={}", userId, responseEntity.getStatusCode(), responseEntity.getBody());
        return responseEntity;
    }
}
