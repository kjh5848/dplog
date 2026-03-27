package kr.co.nomadlab.nomadrank.domain.group.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.group.dto.request.ReqConnectGroupAndShopDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.group.dto.request.ReqDeleteGroupDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.group.dto.request.ReqSaveGroupDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.group.dto.request.ReqUpdateGroupDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.group.service.GroupServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/group")
public class GroupController {

    private final GroupServiceApiV1 groupServiceApiV1;
    @PostMapping()
    public HttpEntity<?> saveGroup(
            HttpSession session,
            @RequestBody @Valid ReqSaveGroupDTOApiV1 reqDto
            ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return groupServiceApiV1.saveGroup(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    @GetMapping("/list")
    public HttpEntity<?> getGroupList(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return groupServiceApiV1.getGroupList(resAuthInfoDTOApiV1.getUser().getId());
    }

    @PatchMapping()
    public HttpEntity<?> updateGroup(
            HttpSession session,
            @RequestBody @Valid ReqUpdateGroupDTOApiV1 reqDto
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return groupServiceApiV1.updateGroup(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    @DeleteMapping()
    public HttpEntity<?> deleteGroup(
            HttpSession session,
            @RequestBody @Valid ReqDeleteGroupDTOApiV1 reqDto
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return groupServiceApiV1.deleteGroup(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    @PostMapping("/shop")
    public HttpEntity<?> connectGroupAndShop(
            HttpSession session,
            @RequestBody @Valid ReqConnectGroupAndShopDTOApiV1 reqDto
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return groupServiceApiV1.connectGroupAndShop(reqDto);
    }

}
