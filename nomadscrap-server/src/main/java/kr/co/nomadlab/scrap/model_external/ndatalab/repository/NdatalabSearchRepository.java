package kr.co.nomadlab.scrap.model_external.ndatalab.repository;

import kr.co.nomadlab.scrap.model_external.ndatalab.dto.req.ReqNdatalabSearchDTO;
import kr.co.nomadlab.scrap.model_external.ndatalab.dto.res.ResNdatalabSearchDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.RequestEntity;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Repository
@RequiredArgsConstructor
public class NdatalabSearchRepository {

    @Nullable
    @Value("${ndatalab.client-id}")
    private final String clientId;

    @Nullable
    @Value("${ndatalab.client-secret}")
    private final String clientSecret;

    private final RestTemplate restTemplate;

    public ResNdatalabSearchDTO post(ReqNdatalabSearchDTO reqNdatalabSearchDTO) {

        try {
            RequestEntity<ReqNdatalabSearchDTO> requestEntity = RequestEntity
                    .post("https://openapi.naver.com/v1/datalab/search")
                    .header("X-Naver-Client-Id", clientId)
                    .header("X-Naver-Client-Secret", clientSecret)
                    .header("Content-Type", "application/json")
                    .body(reqNdatalabSearchDTO);
            ResponseEntity<ResNdatalabSearchDTO> responseEntity = restTemplate.exchange(requestEntity, ResNdatalabSearchDTO.class);
            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                return responseEntity.getBody();
            }
            try {
                log.error(responseEntity.getBody().toString());
            } catch (Exception ignored) {
            }
            throw new RuntimeException("datalab 정보를 가져오지 못했습니다.");
        } catch (Exception e) {
            log.error(e.getMessage());
            return null;
        }
    }

}
