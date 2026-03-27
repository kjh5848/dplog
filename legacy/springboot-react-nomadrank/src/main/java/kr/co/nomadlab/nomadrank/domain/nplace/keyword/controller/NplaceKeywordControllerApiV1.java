package kr.co.nomadlab.nomadrank.domain.nplace.keyword.controller;

import java.util.List;

import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.keyword.constraint.NplaceKeywordRequestType;
import kr.co.nomadlab.nomadrank.domain.nplace.keyword.dto.request.ReqNplaceKeywordPostNsearchadKeywordstoolDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.keyword.service.NplaceKeywordServiceApiV1;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/v1/nplace/keyword")
public class NplaceKeywordControllerApiV1 {

    private final NplaceKeywordServiceApiV1 nplaceKeywordServiceApiV1;

    @GetMapping("/nsearchad/keywordstool/relation")
    public HttpEntity<?> getNsearchadKeywordstoolRelation(
            @RequestParam("keywordList") @NotNull @Size(min = 1, max = 5) List<String> keywordList,
            @RequestParam("requestType") @NotNull NplaceKeywordRequestType requestType,
            HttpSession session) {
    
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 =
                (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
    
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
    
        return nplaceKeywordServiceApiV1.getNsearchadKeywordstoolRelation(
                keywordList,
                requestType,
                resAuthInfoDTOApiV1.getUser().getId());
    }
    
    @PostMapping("/nsearchad/keywordstool")
    public HttpEntity<?> getNsearchadKeywordstool(
            @RequestBody @Valid ReqNplaceKeywordPostNsearchadKeywordstoolDTOApiV1 reqDto,
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceKeywordServiceApiV1.getNsearchadKeywordstool(
                reqDto.getNplaceKeywordNsearchadKeywordstoolKeyword().getKeywordString(),
                resAuthInfoDTOApiV1.getUser().getId());
    }

    @GetMapping("/nblog/search/info")
    public HttpEntity<?> getNblogSearchInfo(
            @RequestParam("keyword") @NotNull @NotBlank String keyword) {
        return nplaceKeywordServiceApiV1.getNblogSearchInfo(keyword);
    }

}
