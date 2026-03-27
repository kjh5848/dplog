package kr.co.nomadlab.nomadrank.domain.nplace.rank.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.dto.request.*;
import kr.co.nomadlab.nomadrank.domain.nplace.rank.service.NplaceServiceApiV1;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.validator.constraints.Length;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/v1/nplace/rank")
public class NplaceRankControllerApiV1 {

    private final NplaceServiceApiV1 nplaceServiceApiV1;

    @GetMapping("/realtime")
    public HttpEntity<?> getRealtime(
        @RequestParam(name = "keyword") String keyword, 
        @RequestParam(name = "province") String province,
        @RequestParam(name = "filterValue") @Length(min = 1, message = "필터값은 1자 이상 입력해주세요.") String filterValue,
        @RequestParam(required = false, defaultValue = "COMPANY_NAME" ,name = "filterType") String filterType, // "COMPANY_NAME", SHOP_ID
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        System.out.println("키워드 " + keyword);
        System.out.println("타입" + filterType);
        return nplaceServiceApiV1.getRealtime(keyword, province, filterType, filterValue,
                resAuthInfoDTOApiV1.getUser().getId());
    }

    @PostMapping("/realtime/list")
    public HttpEntity<?> getRealtimeWithKeyword(HttpSession session,
            @RequestBody @Valid ReqNplaceRankGetRealtimeWithKeywordDTOApiV1 reqDto) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        System.out.println("겟 /realtime/list" + reqDto);
        return nplaceServiceApiV1.getRealtimeWithKeyword(reqDto);
    }

    @GetMapping("/trackable")
    public HttpEntity<?> getTrackable(@RequestParam(name="url") String url) {
        return nplaceServiceApiV1.getTrackable(url);
    }

    @GetMapping("/shop")
    public HttpEntity<?> getShopTable(HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        System.out.println("겟 /shop" + resAuthInfoDTOApiV1);
        return nplaceServiceApiV1.getShopTable(resAuthInfoDTOApiV1.getUser().getId());
    }

    @GetMapping("/shop/{id}")
    public HttpEntity<?> getShopWithId(@PathVariable(name="id") Long id, HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        System.out.println("겟/shop/{session}" + session);
        System.out.println("겟/shop/{sessionId}" + session.getId());
        System.out.println("겟/shop/{id}" + id);
        System.out.println("겟/shop/{resAuthInfoDTOApiV1}" + resAuthInfoDTOApiV1);
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceServiceApiV1.getShopWithId(resAuthInfoDTOApiV1.getUser().getId(), id);
    }

    @PostMapping("/shop")
    public HttpEntity<?> postShopTable(@RequestBody @Valid ReqNplaceRankPostShopDTOApiV1 reqDto, HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceServiceApiV1.postShopTable(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    @DeleteMapping("/shop/{id}")
    public HttpEntity<?> deleteShopWithId(@PathVariable(name="id") Long id, HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceServiceApiV1.deleteShopWithId(resAuthInfoDTOApiV1.getUser().getId(), id);
    }

    @PostMapping("/track")
    public HttpEntity<?> postTrack(@RequestBody @Valid ReqNplaceRankPostTrackDTOApiV1 reqDto, HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceServiceApiV1.postTrack(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    // @PostMapping("/track/info")
    // public HttpEntity<?> postTrackInfo(
    // @RequestBody @Valid ReqNplaceRankPostTrackInfoDTOApiV1 reqDto,
    // HttpSession session
    // ) {
    // ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1)
    // session.getAttribute("authInfo");
    // if (resAuthInfoDTOApiV1 == null) {
    // throw new AuthenticationException(null);
    // }
    // return nplaceServiceApiV1.postTrackInfo(
    // resAuthInfoDTOApiV1.getUser().getId(),
    // reqDto
    // );
    // }

    // @PostMapping("/track/chart")
    // public HttpEntity<?> postTrackChart(
    // @RequestBody @Valid ReqNplaceRankPostTrackChartDTOApiV1 reqDto,
    // HttpSession session
    // ) {
    // ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1)
    // session.getAttribute("authInfo");
    // if (resAuthInfoDTOApiV1 == null) {
    // throw new AuthenticationException(null);
    // }
    // return nplaceServiceApiV1.postTrackChart(
    // resAuthInfoDTOApiV1.getUser().getId(),
    // reqDto
    // );
    // }

    @DeleteMapping("/track/{id}")
    public HttpEntity<?> deleteTrack(@PathVariable(name="id") Long id, HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nplaceServiceApiV1.deleteTrack(resAuthInfoDTOApiV1.getUser().getId(), id);
    }

    @PatchMapping("/track/{id}")
    public HttpEntity<?> changeTrackInfoStatus(@RequestBody @Valid ReqNplaceRankChangeTrackInfoStatusDTOApiV1 reqDto,
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceServiceApiV1.changeTrackInfoStatus(resAuthInfoDTOApiV1.getUser().getId(), reqDto);
    }

    @PostMapping("/shop/{id}/keyword")
    public HttpEntity<?> updateKeyword(@RequestBody @Valid ReqNplaceRankShopUpdateKeywordDTOApiV1 reqDto,
            HttpSession session) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }

        return nplaceServiceApiV1.updateKeywordList(reqDto.getNplaceRankShop().getId());
    }

    @PostMapping("/shop/group")
    public HttpEntity<?> changeGroup(HttpSession session, @RequestBody @Valid ReqNplaceRankChangeGroupDTOApiV1 reqDto) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        System.out.println("겟 /shop/group" + resAuthInfoDTOApiV1);
        return nplaceServiceApiV1.changeGroup(reqDto);
    }

}
