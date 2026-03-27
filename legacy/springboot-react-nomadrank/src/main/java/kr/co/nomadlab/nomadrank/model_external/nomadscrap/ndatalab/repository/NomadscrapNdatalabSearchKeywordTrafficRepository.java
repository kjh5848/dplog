package kr.co.nomadlab.nomadrank.model_external.nomadscrap.ndatalab.repository;


import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.ndatalab.dto.response.ResNomadscrapNdatalabSearchKeywordTrafficDTO;
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

@Slf4j
@Repository
@RequiredArgsConstructor
public class NomadscrapNdatalabSearchKeywordTrafficRepository {

    @Nullable
    @Value("${nomadscrap-server.ip}")
    private final String nomadscrapServerIp;

    @Nullable
    @Value("${nomadscrap-server.api-key}")
    private final String nomadscrapServerApiKey;

    public ResNomadscrapNdatalabSearchKeywordTrafficDTO searchKeywordTraffic(String keyword, String keywordTraffic) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/ndatalab/search/keyword-traffic".formatted(nomadscrapServerIp))
                .queryParam("apiKey", nomadscrapServerApiKey)
                .queryParam("keyword", keyword)
                .queryParam("keywordTraffic", keywordTraffic)
                .build();
        ResponseEntity<ResNomadscrapNdatalabSearchKeywordTrafficDTO> responseEntity = UtilFunction.getWebClientAutoRedirect("json")
                .get()
                .uri(uriComponents.toUriString())
                .exchangeToMono(clientResponse -> clientResponse.toEntity(ResNomadscrapNdatalabSearchKeywordTrafficDTO.class))
                .block();
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            throw new NomadscrapException(responseEntity.getBody().getMessage());
        }
        return responseEntity.getBody();
    }

}
