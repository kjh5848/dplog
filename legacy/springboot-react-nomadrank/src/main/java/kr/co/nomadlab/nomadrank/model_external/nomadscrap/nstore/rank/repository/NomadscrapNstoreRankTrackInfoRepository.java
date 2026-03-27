package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.repository;


import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.request.ReqNomadscrapNstoreRankPostTrackInfoDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response.ResNomadscrapNstoreRankPostTrackInfoDTO;
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
public class NomadscrapNstoreRankTrackInfoRepository {

    @Nullable
    @Value("${nomadscrap-server.ip}")
    private final String nomadscrapServerIp;

    @Nullable
    @Value("${nomadscrap-server.api-key}")
    private final String nomadscrapServerApiKey;

    public ResNomadscrapNstoreRankPostTrackInfoDTO postTrackInfo(ReqNomadscrapNstoreRankPostTrackInfoDTO reqDto) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/nstore/rank/track/info".formatted(nomadscrapServerIp))
                .queryParam("apiKey", nomadscrapServerApiKey)
                .build();
        ResponseEntity<ResNomadscrapNstoreRankPostTrackInfoDTO> responseEntity = UtilFunction.getWebClientAutoRedirect("json")
                .post()
                .uri(uriComponents.toUriString())
                .bodyValue(reqDto)
                .exchangeToMono(clientResponse -> clientResponse.toEntity(ResNomadscrapNstoreRankPostTrackInfoDTO.class))
                .block();
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            throw new NomadscrapException(responseEntity.getBody().getMessage());
        }
        return responseEntity.getBody();
    }
}
