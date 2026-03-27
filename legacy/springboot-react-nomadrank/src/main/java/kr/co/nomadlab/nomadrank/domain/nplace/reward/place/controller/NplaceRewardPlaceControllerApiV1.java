package kr.co.nomadlab.nomadrank.domain.nplace.reward.place.controller;

import org.hibernate.validator.constraints.Length;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.enums.NplaceRewardProduct;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request.ReqNplaceCampaignTrafficPostKeywordDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request.ReqNplaceCampaignTrafficPostKeywordTrafficDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request.ReqNplaceRewardPostRegisterDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request.ReqNplaceRewardPostShopDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request.ReqNplaceRewardSavePlaceDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.dto.request.ReqNplaceRewardUpdatePlaceDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.reward.place.service.NplaceRewardPlaceServiceApiV1;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/nplace/reward/place")
@Validated
public class NplaceRewardPlaceControllerApiV1 {

    private final NplaceRewardPlaceServiceApiV1 nplaceRewardPlaceServiceApiV1;

    @GetMapping("/shop/save")
    public HttpEntity<?> getShopSaveTable(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceRewardPlaceServiceApiV1.getShopTable(
                resAuthInfoDTOApiV1.getUser().getId(),
                NplaceRewardProduct.SAVE
        );
    }

    @GetMapping("/shop/traffic")
    public HttpEntity<?> getShopTrafficTable(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceRewardPlaceServiceApiV1.getShopTable(
                resAuthInfoDTOApiV1.getUser().getId(),
                NplaceRewardProduct.TRAFFIC
        );
    }

    @PostMapping("/shop")
    public HttpEntity<?> postShopTable(
            @RequestBody @Valid ReqNplaceRewardPostShopDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceRewardPlaceServiceApiV1.postShopTable(
                resAuthInfoDTOApiV1.getUser().getId(),
                reqDto
        );
    }

    @GetMapping("/shop/{id}")
    public HttpEntity<?> getShopWithId(
            @PathVariable(name = "id") Long id,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceRewardPlaceServiceApiV1.getShopWithId(
                resAuthInfoDTOApiV1.getUser().getId(),
                id
        );
    }

    @PostMapping("/keyword")
    public HttpEntity<?> postKeyword(
            @RequestBody @Valid ReqNplaceCampaignTrafficPostKeywordDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceRewardPlaceServiceApiV1.postKeyword(
                resAuthInfoDTOApiV1.getUser().getId(),
                reqDto
        );
    }

    @PostMapping("/keyword-traffic")
    public HttpEntity<?> postKeywordTraffic(
            @RequestBody @Valid ReqNplaceCampaignTrafficPostKeywordTrafficDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceRewardPlaceServiceApiV1.postKeywordTraffic(
                resAuthInfoDTOApiV1.getUser().getId(),
                reqDto
        );
    }

    @GetMapping("/search/keyword-traffic")
    public HttpEntity<?> searchKeywordTraffic(
            @RequestParam("keyword")
            @Length(min = 2, message = "키워드는 2자 이상 입력해주세요.")
            String keyword,
            @RequestParam
            @Length(min = 2, message = "키워드트래픽은 2자 이상 입력해주세요.")
            String keywordTraffic,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceRewardPlaceServiceApiV1.searchKeywordTraffic(
                keyword,
                keywordTraffic
        );
    }

    @PostMapping("/register")
    public HttpEntity<?> postRegister(
            @RequestBody @Valid ReqNplaceRewardPostRegisterDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceRewardPlaceServiceApiV1.postRegister(
                resAuthInfoDTOApiV1.getUser().getId(),
                reqDto
        );
    }

    @GetMapping("/notification")
    public HttpEntity<?> getNotification(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceRewardPlaceServiceApiV1.getNotification();
    }

    @GetMapping("/list")
    public HttpEntity<?> getPlaceList(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceRewardPlaceServiceApiV1.getPlaceList(resAuthInfoDTOApiV1.getUser().getId());
    }

    @PostMapping()
    public HttpEntity<?> savePlace(
            HttpSession session,
            @RequestBody @Valid ReqNplaceRewardSavePlaceDTOApiV1 reqDto
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceRewardPlaceServiceApiV1.savePlace(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    @PatchMapping()
    public HttpEntity<?> updatePlace(
            HttpSession session,
            @RequestBody @Valid ReqNplaceRewardUpdatePlaceDTOApiV1 reqDto
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceRewardPlaceServiceApiV1.updatePlace(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    @GetMapping("/{type}")
    public HttpEntity<?> getPlace(
            HttpSession session,
            @PathVariable(name = "type") String type
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceRewardPlaceServiceApiV1.getPlace(resAuthInfoDTOApiV1.getUser().getId(), type);
    }

}
