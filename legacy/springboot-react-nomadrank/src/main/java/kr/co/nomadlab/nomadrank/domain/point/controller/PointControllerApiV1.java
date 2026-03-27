package kr.co.nomadlab.nomadrank.domain.point.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.point.dto.request.ReqPointApplyPatchDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.point.dto.request.ReqPointApplyPostDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.point.service.PointServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/point")
@Validated
public class PointControllerApiV1 {

    private final PointServiceApiV1 pointServiceApiV1;

    @GetMapping()
    public HttpEntity<?> getPointChangeList(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return pointServiceApiV1.getPointChangeList(resAuthInfoDTOApiV1.getUser().getId());
    }

    // 포인트 신청(POST) - 유저
    @PostMapping("/apply")
    public HttpEntity<?> postPoint(
            @RequestBody @Valid ReqPointApplyPostDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return pointServiceApiV1.postPoint(reqDto, resAuthInfoDTOApiV1.getUser().getId());
    }

    // 포인트 신청 승인(POST) - 관리자
    @PatchMapping("/apply")
    public HttpEntity<?> confirmPointApply(
            @RequestBody @Valid ReqPointApplyPatchDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return pointServiceApiV1.confirmPointApply(reqDto, resAuthInfoDTOApiV1.getUser().getId());
    }

    // 포인트 신청내역(GET)
    @GetMapping("/apply")
    public HttpEntity<?> getPointApplyList(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return pointServiceApiV1.getPointApplyList(resAuthInfoDTOApiV1.getUser().getId());
    }
}
