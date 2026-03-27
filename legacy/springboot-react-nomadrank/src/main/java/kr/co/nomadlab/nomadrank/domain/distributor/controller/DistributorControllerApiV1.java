package kr.co.nomadlab.nomadrank.domain.distributor.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.distributor.dto.request.ReqDistributorDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.distributor.dto.request.ReqDistributorUpdateDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.distributor.service.DistributorServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/distributor")
@Validated
public class DistributorControllerApiV1 {

    private final DistributorServiceApiV1 distributorServiceApiV1;

    @GetMapping("/list")
    public HttpEntity<?> list(HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        if (!resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return distributorServiceApiV1.getDistributorList();
    }

    @GetMapping()
    public HttpEntity<?> getDistributor(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return distributorServiceApiV1.getDistributor(resAuthInfoDTOApiV1.getUser().getId());
    }

    @PostMapping()
    public HttpEntity<?> add(
            @RequestBody @Valid ReqDistributorDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        if (!resAuthInfoDTOApiV1.getUser().getAuthority().contains(UserAuthoritySort.ADMIN)) {
            throw new AuthenticationException("권한이 없습니다.");
        }

        return distributorServiceApiV1.saveDistributor(reqDto);
    }

    @PutMapping()
    public HttpEntity<?> update(
            @RequestBody @Valid ReqDistributorUpdateDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return distributorServiceApiV1.updateDistributor(reqDto, resAuthInfoDTOApiV1.getUser().getId(), resAuthInfoDTOApiV1.getUser().getAuthority());
    }

}
