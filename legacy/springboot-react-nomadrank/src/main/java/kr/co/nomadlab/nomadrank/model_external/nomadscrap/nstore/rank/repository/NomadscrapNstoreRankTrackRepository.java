package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.repository;


import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.request.ReqNomadscrapNstoreRankPostTrackDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response.ResNomadscrapNstoreRankDeleteTrackDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nstore.rank.dto.response.ResNomadscrapNstoreRankPostTrackDTO;
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
public class NomadscrapNstoreRankTrackRepository {

    @Nullable
    @Value("${nomadscrap-server.ip}")
    private final String nomadscrapServerIp;

    @Nullable
    @Value("${nomadscrap-server.api-key}")
    private final String nomadscrapServerApiKey;

    public ResNomadscrapNstoreRankPostTrackDTO postTrack(ReqNomadscrapNstoreRankPostTrackDTO reqDto) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/nstore/rank/track".formatted(nomadscrapServerIp))
                .queryParam("apiKey", nomadscrapServerApiKey)
                .build();
        ResponseEntity<ResNomadscrapNstoreRankPostTrackDTO> responseEntity = UtilFunction.getWebClientAutoRedirect("json")
                .post()
                .uri(uriComponents.toUriString())
                .bodyValue(reqDto)
                .exchangeToMono(clientResponse -> clientResponse.toEntity(ResNomadscrapNstoreRankPostTrackDTO.class))
                .block();
        if (responseEntity.getStatusCode() == HttpStatus.BAD_REQUEST) {
            if (responseEntity.getBody() != null && responseEntity.getBody().getCode() == 1) {
                return responseEntity.getBody();
            }
            throw new NomadscrapException(responseEntity.getBody().getMessage());
        } else if (responseEntity.getStatusCode() != HttpStatus.OK) {
            throw new NomadscrapException(responseEntity.getBody().getMessage());
        }
        return responseEntity.getBody();
    }

    public ResNomadscrapNstoreRankDeleteTrackDTO deleteTrack(Long nomadscrapNstoreRankTrackInfoId) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/nstore/rank/track/%d".formatted(nomadscrapServerIp, nomadscrapNstoreRankTrackInfoId))
                .queryParam("apiKey", nomadscrapServerApiKey)
                .build();
        ResponseEntity<ResNomadscrapNstoreRankDeleteTrackDTO> responseEntity = UtilFunction.getWebClientAutoRedirect("json")
                .delete()
                .uri(uriComponents.toUriString())
                .exchangeToMono(clientResponse -> clientResponse.toEntity(ResNomadscrapNstoreRankDeleteTrackDTO.class))
                .block();
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            throw new NomadscrapException(responseEntity.getBody().getMessage());
        }
        return responseEntity.getBody();
    }

}
