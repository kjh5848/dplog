package kr.co.nomadlab.nomadrank.model_external.nsearchad.repository;

import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.model_external.nsearchad.dto.response.ResNsearchadKeywordstoolDTO;
import kr.co.nomadlab.nomadrank.util.NsearchadSignatures;
import kr.co.nomadlab.nomadrank.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;

@Slf4j
@Repository
@RequiredArgsConstructor
public class NsearchadRepository {

    @Nullable
    @Value("${nsearchad.domain:}")
    private final String nsearchadDomain;

    @Nullable
    @Value("${nsearchad.customer-id:}")
    private final String nsearchadCustomerId;

    @Nullable
    @Value("${nsearchad.api-key:}")
    private final String nsearchadApiKey;

    @Nullable
    @Value("${nsearchad.secret-key:}")
    private final String nsearchadSecretKey;

    public synchronized ResNsearchadKeywordstoolDTO getKeywordstool(String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return ResNsearchadKeywordstoolDTO.builder().keywordList(List.of()).build();
        }

        if (nsearchadDomain == null || nsearchadDomain.isBlank()
                || nsearchadCustomerId == null || nsearchadCustomerId.isBlank()
                || nsearchadApiKey == null || nsearchadApiKey.isBlank()
                || nsearchadSecretKey == null || nsearchadSecretKey.isBlank()) {
            log.warn("Nsearchad 환경변수가 설정되지 않아 빈 결과를 반환합니다.");
            return ResNsearchadKeywordstoolDTO.builder().keywordList(List.of()).build();
        }

        String keywordWithTrim = keyword.replaceAll(" ", "");
        String timestampString = String.valueOf(System.currentTimeMillis());
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("https://%s/keywordstool".formatted(nsearchadDomain))
                .queryParam("hintKeywords", keywordWithTrim)
                .queryParam("showDetail", "1")
                .build();
        log.info("uriComponents: {}", uriComponents.toUriString());
        ResponseEntity<ResNsearchadKeywordstoolDTO> responseEntity = UtilFunction.getWebClientAutoRedirect("json")
                .get()
                .uri(uriComponents.toUriString())
                .header("X-Customer", nsearchadCustomerId)
                .header("X-API-KEY", nsearchadApiKey)
                .header("X-Timestamp", timestampString)
                .header("X-Signature", NsearchadSignatures.of(
                        timestampString,
                        "GET",
                        "/keywordstool",
                        nsearchadSecretKey
                ))
                .exchangeToMono(clientResponse -> clientResponse.toEntity(ResNsearchadKeywordstoolDTO.class))
                .block();
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            throw new NomadscrapException("검색광고 API 호출에 실패했습니다." + responseEntity);
        }
        try {
            return responseEntity.getBody();
        } finally {
            try {
                Thread.sleep(500);
            } catch (Exception ignored) {
            }
        }
    }

}
