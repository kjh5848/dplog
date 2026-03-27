package kr.co.nomadlab.scrap.domain.ndatalab.search.controller;

import jakarta.validation.constraints.NotBlank;
import kr.co.nomadlab.scrap.domain.ndatalab.search.service.NdatalabSearchServiceApiV1;
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
@RequestMapping("/v1/ndatalab/search")
public class NdatalabSearchControllerApiV1 {

    private final NdatalabSearchServiceApiV1 ndatalabSearchServiceApiV1;

    @GetMapping("/keyword-traffic")
    public HttpEntity<?> getKeywordTraffic(
            @RequestParam
            String apiKey,
            @NotBlank
            @RequestParam
            String keyword,
            @NotBlank
            @RequestParam
            String keywordTraffic
    ) {
        return ndatalabSearchServiceApiV1.getKeywordTraffic(
                apiKey,
                UtilFunction.refineKeyword(keyword),
                UtilFunction.refineKeyword(keywordTraffic)
        );
    }
}
