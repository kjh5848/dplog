package kr.co.nomadlab.nomadrank.domain.nstore.keyword.controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import kr.co.nomadlab.nomadrank.domain.nstore.keyword.constraint.NstoreKeywordRequestType;
import kr.co.nomadlab.nomadrank.domain.nstore.keyword.service.NstoreKeywordServiceApiV1;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/v1/nstore/keyword")
public class NstoreKeywordControllerApiV1 {

    private final NstoreKeywordServiceApiV1 nstoreKeywordServiceApiV1;

    @GetMapping("/nsearchad/keywordstool")
    public HttpEntity<?> getNsearchadKeywordstool(
            @RequestParam
            @NotNull
            @Size(min = 1, max = 5)
            List<String> keywordList,
            @NotNull
            NstoreKeywordRequestType requestType
    ) {
        return nstoreKeywordServiceApiV1.getNsearchadKeywordstool(
                keywordList,
                requestType
        );
    }

    @GetMapping("/nblog/search/info")
    public HttpEntity<?> getNblogSearchInfo(
            @RequestParam
            @NotNull
            @NotBlank
            String keyword
    ) {
        return nstoreKeywordServiceApiV1.getNblogSearchInfo(keyword);
    }
}
