package kr.co.nomadlab.scrap.domain.nstore.rank.controller;

import jakarta.validation.Valid;
import kr.co.nomadlab.scrap.domain.nstore.rank.constraint.NstoreRankRealtimeFilterType;
import kr.co.nomadlab.scrap.domain.nstore.rank.dto.request.ReqNstoreRankPostTrackChartDTOApiV1;
import kr.co.nomadlab.scrap.domain.nstore.rank.dto.request.ReqNstoreRankPostTrackDTOApiV1;
import kr.co.nomadlab.scrap.domain.nstore.rank.dto.request.ReqNstoreRankPostTrackInfoDTOApiV1;
import kr.co.nomadlab.scrap.domain.nstore.rank.service.NstoreRankServiceApiV1;
import kr.co.nomadlab.scrap.util.UtilFunction;
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
            String apiKey,
            @RequestParam
            String keyword,
            @RequestParam
            @Length(min = 1, message = "필터값은 1자 이상 입력해주세요.")
            String filterValue,
            @RequestParam(required = false, defaultValue = "COMPANY_NAME")
            NstoreRankRealtimeFilterType filterType, // "COMPANY_NAME", MID
            @RequestParam(required = false, defaultValue = "false") boolean compare,
            @RequestParam(required = false, defaultValue = "false") boolean ad
    ) {
        return nstoreRankServiceApiV1.getRealtime(
                apiKey,
                UtilFunction.refineKeyword(keyword),
                UtilFunction.refineFilterValue(filterValue),
                filterType,
                compare,
                ad
        );
    }

    @GetMapping("/trackable")
    public HttpEntity<?> getTrackable(
            @RequestParam
            String apiKey,
            @RequestParam
            String url
    ) {
        return nstoreRankServiceApiV1.getTrackable(
                apiKey,
                UtilFunction.refineUrl(url)
        );
    }

//    @GetMapping("/trackable/{productId}")
//    public HttpEntity<?> getTrackableProductDetail(
//            @RequestParam
//            String apiKey,
//            @PathVariable
//            String productId
//    ) {
//        return nstoreRankServiceApiV1.getTrackableProductDetail(
//                apiKey,
//                UtilFunction.refineProductId(productId)
//        );
//    }

    @PostMapping("/track")
    public HttpEntity<?> postTrack(
            @RequestParam String apiKey,
            @RequestBody @Valid ReqNstoreRankPostTrackDTOApiV1 reqDto
    ) {
        return nstoreRankServiceApiV1.postTrack(
                apiKey,
                UtilFunction.refineKeyword(reqDto.getNstoreRankTrackInfo().getKeyword()),
                UtilFunction.refineNstoreMid(reqDto.getNstoreRankTrackInfo().getMid()),
                UtilFunction.refineProductId(reqDto.getNstoreRankTrackInfo().getProductId())
        );
    }

    @GetMapping("/track/info")
    public HttpEntity<?> getTrackInfo(
            @RequestParam String apiKey
    ) {
        return nstoreRankServiceApiV1.getTrackInfo(
                apiKey
        );
    }

    @PostMapping("/track/info")
    public HttpEntity<?> postTrackInfo(
            @RequestParam String apiKey,
            @RequestBody @Valid ReqNstoreRankPostTrackInfoDTOApiV1 reqDto
    ) {
        return nstoreRankServiceApiV1.postTrackInfo(
                apiKey,
                reqDto
        );
    }

    @PostMapping("/track/chart")
    public HttpEntity<?> postTrackChart(
            @RequestParam String apiKey,
            @RequestBody @Valid ReqNstoreRankPostTrackChartDTOApiV1 reqDto
    ) {
        return nstoreRankServiceApiV1.postTrackChart(
                apiKey,
                reqDto
        );
    }

    @DeleteMapping("/track/{nstoreRankTrackInfoId}")
    public HttpEntity<?> deleteTrack(
            @RequestParam String apiKey,
            @PathVariable Long nstoreRankTrackInfoId
    ) {
        return nstoreRankServiceApiV1.deleteTrack(
                apiKey,
                nstoreRankTrackInfoId
        );
    }
}
