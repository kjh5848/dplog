package kr.co.nomadlab.scrap.model_external.nomadproxy.repository;


import kr.co.nomadlab.scrap.common.exception.NomadproxyException;
import kr.co.nomadlab.scrap.model_external.nomadproxy.entity.NomadproxyWirelessEntity;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Repository;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Repository
@RequiredArgsConstructor
public class NomadproxyWirelessRepository {

    @Nullable
    @Value("${proxy-server.ip}")
    private final String proxyServerIp;

    private final RestTemplate restTemplate;

    public NomadproxyWirelessEntity getWirelessEntityByApiKey(String apiKey) {
        try {
            ResponseEntity<NomadproxyWirelessEntity> responseEntity = restTemplate.getForEntity("http://%s/v1/wireless?apiKey=%s".formatted(proxyServerIp, apiKey), NomadproxyWirelessEntity.class);
            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                return responseEntity.getBody();
            }
            try {
                log.error(responseEntity.getBody().getMessage());
            } catch (Exception ignored) {
            }
            throw new NomadproxyException(apiKey + "의 nomadproxy 정보를 가져오지 못했습니다.");
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new NomadproxyException(e.getMessage());
        }
    }

    public NomadproxyWirelessEntity getNewWirelessEntityByApiKey(String apiKey) {
        try {
            ResponseEntity<NomadproxyWirelessEntity> responseEntity = restTemplate.getForEntity("http://%s/v1/wireless/new?apiKey=%s".formatted(proxyServerIp, apiKey), NomadproxyWirelessEntity.class);
            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                return responseEntity.getBody();
            }
            try {
                log.error(responseEntity.getBody().getMessage());
            } catch (Exception ignored) {
            }
            throw new NomadproxyException(apiKey + "의 nomadproxy 정보를 가져오지 못했습니다.");
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new NomadproxyException(e.getMessage());
        }
    }

    public boolean releaseWirelessEntityByApiKey(String apiKey) {
        try {
            ResponseEntity<NomadproxyWirelessEntity> responseEntity = restTemplate.getForEntity("http://%s/v1/wireless/release?apiKey=%s".formatted(proxyServerIp, apiKey), NomadproxyWirelessEntity.class);
            if (responseEntity.getStatusCode().is2xxSuccessful()) {
                return true;
            }
            try {
                log.error(responseEntity.getBody().getMessage());
            } catch (Exception ignored) {
            }
            throw new NomadproxyException(apiKey + "의 nomadproxy 정보를 가져오지 못했습니다.");
        } catch (Exception e) {
            log.error(e.getMessage());
            return false;
        }
    }

}
