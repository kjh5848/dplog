package kr.co.nomadlab.nomadrank.domain.nstore.rank.controller;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.request.ReqNstoreRankPostProductDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nstore.rank.dto.request.ReqNstoreRankPostTrackDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.nstore.rank.service.NstoreRankServiceApiV1;
import kr.co.nomadlab.nomadrank.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.Length;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/v1/nstore/rank")
public class NstoreRankControllerApiV1 {

    private final NstoreRankServiceApiV1 nstoreRankServiceApiV1;

    @GetMapping("/realtime")
    public HttpEntity<?> getRealtime(
            @RequestParam
            String keyword,
            @RequestParam
            @Length(min = 1, message = "필터값은 1자 이상 입력해주세요.")
            String filterValue,
            @RequestParam(required = false, defaultValue = "COMPANY_NAME")
            String filterType, // "COMPANY_NAME", MID
            @RequestParam(required = false, defaultValue = "false")
            boolean compare
    ) {
        return nstoreRankServiceApiV1.getRealtime(keyword, filterType, filterValue, compare);
    }

    @GetMapping("/trackable")
    public HttpEntity<?> getTrackable(
            @RequestParam
            String url
    ) {
        return nstoreRankServiceApiV1.getTrackable(
                UtilFunction.refineUrl(url)
        );
    }

    @GetMapping("/product")
    public HttpEntity<?> getProductTable(
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nstoreRankServiceApiV1.getProductTable(
                resAuthInfoDTOApiV1.getUser().getId()
        );
    }

    @GetMapping("/product/{id}")
    public HttpEntity<?> getProductWithId(
            @PathVariable(name = "id") Long id,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nstoreRankServiceApiV1.getProductWithId(
                resAuthInfoDTOApiV1.getUser().getId(),
                id
        );
    }

    @PostMapping("/product")
    public HttpEntity<?> postProductTable(
            @RequestBody @Valid ReqNstoreRankPostProductDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nstoreRankServiceApiV1.postProductTable(
                resAuthInfoDTOApiV1.getUser().getId(),
                reqDto
        );
    }

    @DeleteMapping("/product/{id}")
    public HttpEntity<?> deleteProductWithId(
            @PathVariable(name = "id") Long id,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nstoreRankServiceApiV1.deleteProductWithId(
                resAuthInfoDTOApiV1.getUser().getId(),
                id
        );
    }

    @PostMapping("/track")
    public HttpEntity<?> postTrack(
            @RequestBody @Valid ReqNstoreRankPostTrackDTOApiV1 reqDto,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nstoreRankServiceApiV1.postTrack(
                resAuthInfoDTOApiV1.getUser().getId(),
                reqDto
        );
    }

//    @PostMapping("/track/info")
//    public HttpEntity<?> postTrackInfo(
//            @RequestBody @Valid ReqNomadscrapNstoreRankPostTrackInfoDTO reqDto,
//            HttpSession session
//    ) {
//        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
//        if (resAuthInfoDTOApiV1 == null) {
//            throw new AuthenticationException(null);
//        }
//        return nstoreRankServiceApiV1.postTrackInfo(
//                resAuthInfoDTOApiV1.getUser().getId(),
//                reqDto
//        );
//    }

//    @PostMapping("/track/chart")
//    public HttpEntity<?> postTrackChart(
//            @RequestBody @Valid ReqNstoreRankPostTrackChartDTOApiV1 reqDto,
//            HttpSession session
//    ) {
//        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
//        if (resAuthInfoDTOApiV1 == null) {
//            throw new AuthenticationException(null);
//        }
//        return nstoreRankServiceApiV1.postTrackChart(
//                resAuthInfoDTOApiV1.getUser().getId(),
//                reqDto
//        );
//    }

    @DeleteMapping("/track/{id}")
    public HttpEntity<?> deleteTrack(
            @PathVariable(name = "id") Long id,
            HttpSession session
    ) {
        ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
        if (resAuthInfoDTOApiV1 == null) {
            throw new AuthenticationException(null);
        }
        return nstoreRankServiceApiV1.deleteTrack(
                resAuthInfoDTOApiV1.getUser().getId(),
                id
        );
    }

}
