package kr.co.nomadlab.dplog.ranking.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.nomadlab.dplog.common.dto.ResDTO;
import kr.co.nomadlab.dplog.integration.nsearchad.NsearchadService;
import kr.co.nomadlab.dplog.integration.nsearchad.dto.NsearchadKeywordResponse;
import kr.co.nomadlab.dplog.ranking.dto.KeywordSuggestResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 연관 키워드 추천 컨트롤러
 * - GET /v1/keywords/suggest?keyword={keyword} — 네이버 검색광고 API 기반 연관 키워드 추천
 */
@RestController
@RequestMapping("/v1/keywords")
@Tag(name = "Keyword Suggest", description = "연관 키워드 추천 + 검색량 조회 API")
public class KeywordSuggestController {

    private final NsearchadService nsearchadService;

    public KeywordSuggestController(NsearchadService nsearchadService) {
        this.nsearchadService = nsearchadService;
    }

    /**
     * 연관 키워드 추천 + 검색량 조회
     *
     * @param keyword 힌트 키워드 (예: "강남맛집")
     * @return 연관 키워드 목록 + 월간 검색량 + 경쟁도
     */
    @GetMapping("/suggest")
    @Operation(
            summary = "연관 키워드 추천",
            description = "네이버 검색광고 API를 통해 연관 키워드를 추천하고 월간 검색량/경쟁도를 조회합니다."
    )
    public ResponseEntity<ResDTO<KeywordSuggestResponse>> suggestKeywords(
            @Parameter(description = "힌트 키워드 (예: 강남맛집)")
            @RequestParam String keyword) {

        NsearchadKeywordResponse nsResponse = nsearchadService.getKeywordstool(keyword);
        KeywordSuggestResponse response = KeywordSuggestResponse.from(keyword, nsResponse);

        return ResponseEntity.ok(ResDTO.ok(response));
    }
}
