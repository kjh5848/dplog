package kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request.ReqNplaceCampaignBlogWritersPostBlogWritersDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request.ReqNplaceRewardBlogWritersPostBlogWritersRegisterDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request.ReqNplaceRewardSaveBlogWritersDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.dto.request.ReqNplaceRewardUpdateBlogWritersDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.blog_writers.service.NplaceRewardBlogWritersServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/nplace/reward/blog-writers")
@Validated
public class NplaceRewardBlogWritersControllerApiV1 {

    private final NplaceRewardBlogWritersServiceApiV1 nplaceRewardBlogWritersServiceApiV1;

    @GetMapping("/register")
    public HttpEntity<?> getBlogWritersRegister(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceRewardBlogWritersServiceApiV1.getBlogWritersRegister(resAuthInfoDTOApiV1.getUser().getId());
    }

    @PostMapping("/register")
    public HttpEntity<?> postBlogWritersRegister(
            @RequestBody @Valid ReqNplaceRewardBlogWritersPostBlogWritersRegisterDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceRewardBlogWritersServiceApiV1.postBlogWritersRegister(reqDto, resAuthInfoDTOApiV1.getUser().getId());
    }

    @GetMapping("/list")
    public HttpEntity<?> getBlogWritersList(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceRewardBlogWritersServiceApiV1.getBlogWritersList(resAuthInfoDTOApiV1.getUser().getId());
    }

    @PostMapping()
    public HttpEntity<?> saveBlogWriters(
            HttpSession session,
            @RequestBody @Valid ReqNplaceRewardSaveBlogWritersDTOApiV1 reqDto
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceRewardBlogWritersServiceApiV1.saveBlogWriters(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    @PatchMapping()
    public HttpEntity<?> updateBlogWriters(
            HttpSession session,
            @RequestBody @Valid ReqNplaceRewardUpdateBlogWritersDTOApiV1 reqDto
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceRewardBlogWritersServiceApiV1.updateBlogWriters(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    @GetMapping("/{type}")
    public HttpEntity<?> getBlogWriters(
            HttpSession session,
            @PathVariable(name = "type") String type
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceRewardBlogWritersServiceApiV1.getBlogWriters(resAuthInfoDTOApiV1.getUser().getId(), type);
    }



}
