package kr.co.nomadlab.scrap.domain.kgift.mission.controller;

import kr.co.nomadlab.scrap.domain.kgift.mission.service.KgiftMissionServiceApiV1;
import kr.co.nomadlab.scrap.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/v1/kgift/mission")
public class KgiftMissionControllerApiV1 {

    private final KgiftMissionServiceApiV1 kgiftMissionServiceApiV1;

    @GetMapping("/product-wish")
    public HttpEntity<?> getProductWish(
            @RequestParam
            String apiKey,
            @RequestParam
            String productId
    ) {
        return kgiftMissionServiceApiV1.getProductWish(
                apiKey,
                UtilFunction.refineProductId(productId)
        );
    }

    @GetMapping("/review-empathy")
    public HttpEntity<?> getReviewEmpathy(
            @RequestParam
            String apiKey,
            @RequestParam
            String url
    ) {
        return kgiftMissionServiceApiV1.getReviewEmpathy(
                apiKey,
                UtilFunction.refineUrl(url)
        );
    }
}
