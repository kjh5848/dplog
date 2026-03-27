package kr.co.nomadlab.dplog.integration.nsearchad;

import kr.co.nomadlab.dplog.common.properties.AppProperties;
import kr.co.nomadlab.dplog.integration.nsearchad.dto.NsearchadKeywordResponse;
import kr.co.nomadlab.dplog.integration.util.NsearchadSignatures;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

/**
 * 네이버 검색광고 API 서비스
 * - HMAC-SHA256 서명 생성 + WebClient 호출 통합
 * - 레거시: NsearchadRepository.getKeywordstool() 이관
 */
@Service
public class NsearchadService {

    private static final Logger log = LoggerFactory.getLogger(NsearchadService.class);

    private final WebClient webClient;
    private final AppProperties appProperties;

    public NsearchadService(WebClient nsearchadWebClient, AppProperties appProperties) {
        this.webClient = nsearchadWebClient;
        this.appProperties = appProperties;
    }

    /**
     * 연관 키워드 + 검색량 조회
     *
     * @param keyword 힌트 키워드
     * @return 연관 키워드 목록 (환경변수 미설정 시 빈 결과)
     */
    public NsearchadKeywordResponse getKeywordstool(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return NsearchadKeywordResponse.empty();
        }

        AppProperties.NsearchadProperties nsearchad = appProperties.nsearchad();
        if (!isConfigured(nsearchad)) {
            log.warn("nsearchad 환경변수가 설정되지 않아 빈 결과를 반환합니다.");
            return NsearchadKeywordResponse.empty();
        }

        // 공백 제거 (레거시 동일)
        String keywordTrimmed = keyword.replaceAll(" ", "");
        String timestamp = String.valueOf(System.currentTimeMillis());

        // API URL 구성
        String uri = UriComponentsBuilder
                .fromUriString("https://" + nsearchad.domain() + "/keywordstool")
                .queryParam("hintKeywords", keywordTrimmed)
                .queryParam("showDetail", "1")
                .build()
                .toUriString();

        // HMAC-SHA256 서명 생성
        String signature = NsearchadSignatures.of(timestamp, "GET", "/keywordstool", nsearchad.secretKey());

        log.info("nsearchad API 호출: keyword={}, uri={}", keywordTrimmed, uri);

        try {
            NsearchadKeywordResponse response = webClient.get()
                    .uri(uri)
                    .header("X-Customer", nsearchad.customerId())
                    .header("X-API-KEY", nsearchad.apiKey())
                    .header("X-Timestamp", timestamp)
                    .header("X-Signature", signature)
                    .retrieve()
                    .bodyToMono(NsearchadKeywordResponse.class)
                    .block();

            if (response == null) {
                log.warn("nsearchad API 응답이 null입니다. keyword={}", keyword);
                return NsearchadKeywordResponse.empty();
            }

            log.info("nsearchad API 호출 성공: keyword={}, 결과 수={}", keyword,
                    response.keywordList() != null ? response.keywordList().size() : 0);

            // Rate limiting (레거시 동일: 500ms 대기)
            try {
                Thread.sleep(500);
            } catch (InterruptedException ignored) {
                Thread.currentThread().interrupt();
            }

            return response;

        } catch (Exception e) {
            log.error("nsearchad API 호출 실패: keyword={}, error={}", keyword, e.getMessage());
            return NsearchadKeywordResponse.empty();
        }
    }

    /**
     * nsearchad 환경변수가 모두 설정되었는지 확인
     */
    private boolean isConfigured(AppProperties.NsearchadProperties nsearchad) {
        return nsearchad != null
                && nsearchad.domain() != null && !nsearchad.domain().isBlank()
                && nsearchad.customerId() != null && !nsearchad.customerId().isBlank()
                && nsearchad.apiKey() != null && !nsearchad.apiKey().isBlank()
                && nsearchad.secretKey() != null && !nsearchad.secretKey().isBlank();
    }
}
