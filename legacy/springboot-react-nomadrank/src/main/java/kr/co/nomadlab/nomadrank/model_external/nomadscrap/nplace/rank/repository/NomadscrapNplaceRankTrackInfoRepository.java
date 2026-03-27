package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.repository;


import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.request.ReqNomadscrapNplaceRankPostTrackInfoDTO;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankPostTrackInfoDTO;
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
public class NomadscrapNplaceRankTrackInfoRepository {

    @Nullable
    @Value("${nomadscrap-server.ip}")
    private final String nomadscrapServerIp;

    @Nullable
    @Value("${nomadscrap-server.api-key}")
    private final String nomadscrapServerApiKey;

    public ResNomadscrapNplaceRankPostTrackInfoDTO postTrackInfo(ReqNomadscrapNplaceRankPostTrackInfoDTO reqDto) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/nplace/rank/track/info".formatted(nomadscrapServerIp))
                .queryParam("apiKey", nomadscrapServerApiKey)
                .build();
        ResponseEntity<ResNomadscrapNplaceRankPostTrackInfoDTO> responseEntity = UtilFunction.getWebClientAutoRedirect("json")
                .post()
                .uri(uriComponents.toUriString())
                .bodyValue(reqDto)
                .exchangeToMono(clientResponse -> clientResponse.toEntity(ResNomadscrapNplaceRankPostTrackInfoDTO.class))
                .block();
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            throw new NomadscrapException(responseEntity.getBody().getMessage());
        }
        return responseEntity.getBody();
    }

    public ResNomadscrapNplaceRankPostTrackInfoDTO getTrackInfo() {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/nplace/rank/track/info".formatted(nomadscrapServerIp))
                .queryParam("apiKey", nomadscrapServerApiKey)
                .build();
        ResponseEntity<ResNomadscrapNplaceRankPostTrackInfoDTO> responseEntity = UtilFunction.getWebClientAutoRedirect("json")
                .get()
                .uri(uriComponents.toUriString())
                .exchangeToMono(clientResponse -> clientResponse.toEntity(ResNomadscrapNplaceRankPostTrackInfoDTO.class))
                .block();
        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            throw new NomadscrapException(responseEntity.getBody().getMessage());
        }
        return responseEntity.getBody();
    }
}
