package kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.repository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;
import org.springframework.web.reactive.function.client.ClientResponse;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.model_external.nomadscrap.nplace.rank.dto.response.ResNomadscrapNplaceRankGetRealtimeDTO;
import kr.co.nomadlab.nomadrank.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Repository
@RequiredArgsConstructor
public class NomadscrapNplaceRankRealtimeRepository {

    @Nullable
    @Value("${nomadscrap-server.ip}")
    private final String nomadscrapServerIp;

    @Nullable
    @Value("${nomadscrap-server.api-key}")
    private final String nomadscrapServerApiKey;

    public ResNomadscrapNplaceRankGetRealtimeDTO getRealtime(String keyword, String province, String filterType,
            String filterValue) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/nplace/rank/realtime".formatted(nomadscrapServerIp))
                .queryParam("apiKey", nomadscrapServerApiKey)
                .queryParam("keyword", keyword)
                .queryParam("province", province)
                .queryParam("filterType", filterType)
                .queryParam("filterValue", filterValue)
                .build();
        return fetchRealtime(uriComponents);
    }

    public ResNomadscrapNplaceRankGetRealtimeDTO getRealtime(String keyword, String province) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/nplace/rank/realtime".formatted(nomadscrapServerIp))
                .queryParam("apiKey", nomadscrapServerApiKey)
                .queryParam("keyword", keyword)
                .queryParam("province", province)
                .build();
        return fetchRealtime(uriComponents);
    }

    private ResNomadscrapNplaceRankGetRealtimeDTO fetchRealtime(UriComponents uriComponents) {
        ResponseEntity<ResNomadscrapNplaceRankGetRealtimeDTO> responseEntity = UtilFunction
                .getWebClientAutoRedirect("json")
                .get()
                .uri(uriComponents.toUriString())
                .exchangeToMono(response -> handleResponse(response, uriComponents.toUriString()))
                .block();

        if (responseEntity == null) {
            throw new NomadscrapException("노매드스크랩 응답이 비어 있습니다.");
        }

        if (responseEntity.getStatusCode() != HttpStatus.OK) {
            String message = responseEntity.getBody() != null ? responseEntity.getBody().getMessage() : "노매드스크랩 요청 실패";
            throw new NomadscrapException(message + " (status=" + responseEntity.getStatusCode() + ")");
        }
        return responseEntity.getBody();
    }

    private Mono<ResponseEntity<ResNomadscrapNplaceRankGetRealtimeDTO>> handleResponse(ClientResponse response,
            String uri) {
        MediaType mediaType = response.headers().contentType().orElse(MediaType.APPLICATION_JSON);
        if (!MediaType.APPLICATION_JSON.isCompatibleWith(mediaType)) {
            return response.bodyToMono(String.class)
                    .defaultIfEmpty("empty body")
                    .flatMap(body -> {
                        log.warn("[Nomadscrap] Unexpected content-type {} for URI {}, body(snippet)={}",
                                mediaType, uri, truncate(body, 500));
                        return Mono.error(new NomadscrapException("노매드스크랩 응답이 JSON이 아닙니다. contentType=" + mediaType));
                    });
        }
        return response.toEntity(ResNomadscrapNplaceRankGetRealtimeDTO.class);
    }

    private String truncate(String body, int max) {
        if (body == null)
            return "null";
        return body.length() > max ? body.substring(0, max) + "...(truncated)" : body;
    }

}
