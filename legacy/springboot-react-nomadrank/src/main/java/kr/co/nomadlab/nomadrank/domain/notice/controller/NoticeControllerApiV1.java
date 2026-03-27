package kr.co.nomadlab.nomadrank.domain.notice.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.notice.dto.request.ReqNoticeAddDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.notice.dto.request.ReqNoticeUpdateDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.notice.service.NoticeServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/notice")
public class NoticeControllerApiV1 {

    private final NoticeServiceApiV1 noticeServiceApiV1;

    @GetMapping()
    public HttpEntity<?> list() {
        return noticeServiceApiV1.getNoticeList();
    }

    @GetMapping("/{id}")
    public HttpEntity<?> getNoticeWithId(
            @PathVariable(name = "id") Long id
    ) {
        return noticeServiceApiV1.getNoticeWithId(id);
    }

    @PostMapping()
    public HttpEntity<?> add(
            @RequestBody @Valid ReqNoticeAddDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        if (!resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN) && !resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.DISTRIBUTOR_MANAGER)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return noticeServiceApiV1.saveNotice(reqDto);
    }

    @PutMapping("/{id}")
    public HttpEntity<?> update(
            @RequestBody @Valid ReqNoticeUpdateDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        if (!resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN) && !resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.DISTRIBUTOR_MANAGER)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return noticeServiceApiV1.updateNotice(reqDto);
    }

    @DeleteMapping("/{id}")
    public HttpEntity<?> delete(
            @PathVariable(name = "id") Long id,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        if (!resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN) && !resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.DISTRIBUTOR_MANAGER)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return noticeServiceApiV1.deleteNotice(id);
    }

    @GetMapping("/category")
    public HttpEntity<?> getCategory(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return noticeServiceApiV1.getCategory();
    }

}
