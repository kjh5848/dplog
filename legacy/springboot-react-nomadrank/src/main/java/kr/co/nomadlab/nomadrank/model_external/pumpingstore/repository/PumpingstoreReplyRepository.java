package kr.co.nomadlab.nomadrank.model_external.pumpingstore.repository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import kr.co.nomadlab.nomadrank.common.exception.NomadscrapException;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.request.ReqPumpingstorePostSellerNvidDTO;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.request.ReqPumpingstorePutSellerNvidDTO;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.response.ResPumpingstoreDeleteSellerNvidDTO;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.response.ResPumpingstorePostSellerNvidDTO;
import kr.co.nomadlab.nomadrank.model_external.pumpingstore.dto.response.ResPumpingstorePutSellerNvidDTO;
import kr.co.nomadlab.nomadrank.util.UtilFunction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Repository
@RequiredArgsConstructor
public class PumpingstoreReplyRepository {

    @Nullable
    @Value("${pumpingstore-server.ip}")
    private final String pumpingstoreServerIp;

    @Nullable
    @Value("${pumpingstore-server.api-key}")
    private final String pumpingstoreServerApiKey;

    public ResPumpingstorePostSellerNvidDTO postSellerNvid(ReqPumpingstorePostSellerNvidDTO reqDto) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/seller-nvid".formatted(pumpingstoreServerIp))
                .queryParam("restApiKey", pumpingstoreServerApiKey)
                .build();
        log.info("[Pumpingstore][Request] POST {} body={}", uriComponents.toUriString(), reqDto);
        ResponseEntity<ResPumpingstorePostSellerNvidDTO> responseEntity = UtilFunction.getWebClientAutoRedirect("json")
                .post()
                .uri(uriComponents.toUriString())
                .bodyValue(reqDto)
                .exchangeToMono(clientResponse -> clientResponse.toEntity(ResPumpingstorePostSellerNvidDTO.class))
                .block();
        log.info("[Pumpingstore][Response] POST {} status={} body={}", uriComponents.toUriString(),
                responseEntity.getStatusCode(), responseEntity.getBody());
        if (responseEntity.getBody() == null) {
            log.warn("[Pumpingstore][Response] POST {} empty body received", uriComponents.toUriString());
        }
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

    public ResPumpingstorePutSellerNvidDTO putSellerNvid(ReqPumpingstorePutSellerNvidDTO reqDto, String nvId) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/seller-nvid".formatted(pumpingstoreServerIp))
                .path("/%s".formatted(nvId))
                .queryParam("restApiKey", pumpingstoreServerApiKey)
                .build();
        log.info("[Pumpingstore][Request] PUT {} body={}", uriComponents.toUriString(), reqDto);
        ResponseEntity<ResPumpingstorePutSellerNvidDTO> responseEntity = UtilFunction.getWebClientAutoRedirect("json")
                .put()
                .uri(uriComponents.toUriString())
                .bodyValue(reqDto)
                .exchangeToMono(clientResponse -> clientResponse.toEntity(ResPumpingstorePutSellerNvidDTO.class))
                .block();
        log.info("[Pumpingstore][Response] PUT {} status={} body={}", uriComponents.toUriString(),
                responseEntity.getStatusCode(), responseEntity.getBody());
        if (responseEntity.getBody() == null) {
            log.warn("[Pumpingstore][Response] PUT {} empty body received", uriComponents.toUriString());
        }

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

    public ResPumpingstoreDeleteSellerNvidDTO deleteSellerNvid(String nvId) {
        final UriComponents uriComponents = UriComponentsBuilder
                .fromHttpUrl("http://%s/v1/seller-nvid".formatted(pumpingstoreServerIp))
                .path("/%s".formatted(nvId))
                .queryParam("restApiKey", pumpingstoreServerApiKey)
                .build();
        log.info("[Pumpingstore][Request] DELETE {}", uriComponents.toUriString());
        ResponseEntity<ResPumpingstoreDeleteSellerNvidDTO> responseEntity = UtilFunction
                .getWebClientAutoRedirect("json")
                .delete()
                .uri(uriComponents.toUriString())
                .exchangeToMono(clientResponse -> clientResponse.toEntity(ResPumpingstoreDeleteSellerNvidDTO.class))
                .block();
        log.info("[Pumpingstore][Response] DELETE {} status={} body={}", uriComponents.toUriString(),
                responseEntity.getStatusCode(), responseEntity.getBody());
        if (responseEntity.getBody() == null) {
            log.warn("[Pumpingstore][Response] DELETE {} empty body received", uriComponents.toUriString());
        }

        if (responseEntity.getStatusCode() == HttpStatus.BAD_REQUEST) {
            if (responseEntity.getBody() != null
                    && (responseEntity.getBody().getCode() == 1 || responseEntity.getBody().getCode() == -1)) {
                return responseEntity.getBody();
            }
            throw new NomadscrapException(responseEntity.getBody().getMessage());
        } else if (responseEntity.getStatusCode() != HttpStatus.OK) {
            throw new NomadscrapException(responseEntity.getBody().getMessage());
        }
        return responseEntity.getBody();
    }
}
