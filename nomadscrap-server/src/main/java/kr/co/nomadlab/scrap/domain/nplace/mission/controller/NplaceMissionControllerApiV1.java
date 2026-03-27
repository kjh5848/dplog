package kr.co.nomadlab.scrap.domain.nplace.mission.controller;

import kr.co.nomadlab.scrap.domain.nplace.mission.service.NplaceMissionServiceApiV1;
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
@RequestMapping("/v1/nplace/mission")
public class NplaceMissionControllerApiV1 {

    private final NplaceMissionServiceApiV1 nplaceMissionServiceApiV1;

    @GetMapping("/mall-bookmark")
    public HttpEntity<?> getMallDetail(
            @RequestParam
            String apiKey,
            @RequestParam
            String mallId
    ) {
        return nplaceMissionServiceApiV1.getMallDetail(
                apiKey,
                UtilFunction.refineMallId(mallId)
        );
    }

    @GetMapping("/around")
    public HttpEntity<?> getAround(
            @RequestParam
            String apiKey,
            @RequestParam
            String url,
            @RequestParam
            Integer filter,
            @RequestParam(required = false)
            Integer tag,
            @RequestParam
            Integer answerIndex
    ) {
        return nplaceMissionServiceApiV1.getAround(apiKey, url, filter, tag, answerIndex);
    }

    @GetMapping("/home")
    public HttpEntity<?> getHome(
            @RequestParam
            String apiKey,
            @RequestParam
            String url,
            @RequestParam
            String filter
    ) {
        return nplaceMissionServiceApiV1.getHome(apiKey, url, filter);
    }

}
