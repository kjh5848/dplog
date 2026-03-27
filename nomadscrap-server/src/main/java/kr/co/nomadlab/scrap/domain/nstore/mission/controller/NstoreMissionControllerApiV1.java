package kr.co.nomadlab.scrap.domain.nstore.mission.controller;

import jakarta.validation.constraints.Pattern;
import kr.co.nomadlab.scrap.common.constants.Constants;
import kr.co.nomadlab.scrap.domain.nstore.mission.constraint.NstoreMissionProductDibsFilterType;
import kr.co.nomadlab.scrap.domain.nstore.mission.service.NstoreMissionServiceApiV1;
import kr.co.nomadlab.scrap.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.Length;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/v1/nstore/mission")
public class NstoreMissionControllerApiV1 {

    private final NstoreMissionServiceApiV1 nstoreMissionServiceApiV1;

    @GetMapping("/mall-feed")
    public HttpEntity<?> getMallFeed(
            @RequestParam
            String apiKey,
            @RequestParam
            @Pattern(regexp = Constants.Regex.NSTORE_MALL_URL, message = "스토어 주소를 정확히 입력해주세요.")
            String url
    ) {
        return nstoreMissionServiceApiV1.getMallFeed(
                apiKey,
                UtilFunction.refineFilterValue(url)
        );
    }

    @GetMapping("/product-dibs")
    public HttpEntity<?> getProductDibs(
            @RequestParam
            String apiKey,
            @RequestParam(required = false)
            String keyword,
            @RequestParam
            @Length(min = 1, message = "필터값은 1자 이상 입력해주세요.")
            String filterValue,
            @RequestParam
            NstoreMissionProductDibsFilterType filterType
    ) {
        return nstoreMissionServiceApiV1.getProductDibs(
                apiKey,
                keyword,
                UtilFunction.refineFilterValue(filterValue),
                filterType
        );
    }
}