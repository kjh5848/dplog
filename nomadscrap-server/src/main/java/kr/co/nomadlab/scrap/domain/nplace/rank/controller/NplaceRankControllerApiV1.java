package kr.co.nomadlab.scrap.domain.nplace.rank.controller;

import jakarta.validation.Valid;
import kr.co.nomadlab.scrap.domain.nplace.rank.constraint.NplaceRankRealtimeFilterType;
import kr.co.nomadlab.scrap.domain.nplace.rank.dto.request.ReqNplaceRankPostTrackChartDTOApiV1;
import kr.co.nomadlab.scrap.domain.nplace.rank.dto.request.ReqNplaceRankPostTrackDTOApiV1;
import kr.co.nomadlab.scrap.domain.nplace.rank.dto.request.ReqNplaceRankPostTrackInfoDTOApiV1;
import kr.co.nomadlab.scrap.domain.nplace.rank.service.NplaceRankServiceApiV1;
import kr.co.nomadlab.scrap.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.Length;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/v1/nplace/rank")
public class NplaceRankControllerApiV1 {

    private final NplaceRankServiceApiV1 nplaceRankServiceApiV1;

    @GetMapping("/realtime")
    public HttpEntity<?> getRealtime(
            @RequestParam
            String apiKey,
            @RequestParam
            String keyword,
            @RequestParam(required = false, defaultValue = "서울시")
            String province,
            @RequestParam(required = false)
//            @Length(min = 1, message = "필터값은 1자 이상 입력해주세요.")
            String filterValue,
            @RequestParam(required = false, defaultValue = "COMPANY_NAME")
            NplaceRankRealtimeFilterType filterType // "COMPANY_NAME", SHOP_ID
    ) {
        return nplaceRankServiceApiV1.getRealtime(
                apiKey,
                UtilFunction.refineKeyword(keyword),
                UtilFunction.refineProvince(province),
                UtilFunction.refineFilterValue(filterValue),
                filterType
        );
    }

    @GetMapping("/trackable")
    public HttpEntity<?> getTrackable(
            @RequestParam
            String apiKey,
            @RequestParam
            String url
    ) {
        return nplaceRankServiceApiV1.getTrackable(
                apiKey,
                url
        );
    }

    @PostMapping("/track")
    public HttpEntity<?> postTrack(
            @RequestParam String apiKey,
            @RequestBody @Valid ReqNplaceRankPostTrackDTOApiV1 reqDto
    ) {
        return nplaceRankServiceApiV1.postTrack(
                apiKey,
                UtilFunction.refineKeyword(reqDto.getNplaceRankTrackInfo().getKeyword()),
                UtilFunction.refineProvince(reqDto.getNplaceRankTrackInfo().getProvince()),
                UtilFunction.refineBusinessSector(reqDto.getNplaceRankTrackInfo().getBusinessSector()),
                UtilFunction.refineNplaceShopId(reqDto.getNplaceRankTrackInfo().getShopId())
        );
    }

    @GetMapping("/track/state")
    public HttpEntity<?> getTrackState(
            @RequestParam String apiKey
    ) {
        return nplaceRankServiceApiV1.getTrackState(
                apiKey
        );
    }

    @GetMapping("/track/info")
    public HttpEntity<?> getTrackInfo(
            @RequestParam String apiKey
    ) {
        return nplaceRankServiceApiV1.getTrackInfo(
                apiKey
        );
    }

    @PostMapping("/track/info")
    public HttpEntity<?> postTrackInfo(
            @RequestParam String apiKey,
            @RequestBody @Valid ReqNplaceRankPostTrackInfoDTOApiV1 reqDto
    ) {
        return nplaceRankServiceApiV1.postTrackInfo(
                apiKey,
                reqDto
        );
    }

    @PostMapping("/track/chart")
    public HttpEntity<?> postTrackChart(
            @RequestParam String apiKey,
            @RequestBody @Valid ReqNplaceRankPostTrackChartDTOApiV1 reqDto
    ) {
        return nplaceRankServiceApiV1.postTrackChart(
                apiKey,
                reqDto
        );
    }

    @DeleteMapping("/track/{nplaceRankTrackInfoId}")
    public HttpEntity<?> deleteTrack(
            @RequestParam String apiKey,
            @PathVariable Long nplaceRankTrackInfoId
    ) {
        return nplaceRankServiceApiV1.deleteTrack(
                apiKey,
                nplaceRankTrackInfoId
        );
    }
}
