package kr.co.nomadlab.dplog.owner;

import java.net.URI;
import java.util.List;
import java.util.Map;
import kr.co.nomadlab.dplog.config.DplogProperties;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class PublicDataBusinessRegistrationVerifier implements BusinessRegistrationVerifier {
    private final DplogProperties properties;
    private final RestClient restClient = RestClient.builder().build();

    public PublicDataBusinessRegistrationVerifier(DplogProperties properties) {
        this.properties = properties;
    }

    @Override
    @SuppressWarnings("unchecked")
    public BusinessRegistrationResult verify(String businessNumber, String openingDate, String representativeName) {
        String serviceKey = properties.getPublicData().getServiceKey();
        if (serviceKey == null || serviceKey.isBlank()) {
            return BusinessRegistrationResult.unavailable("공공데이터포털 serviceKey가 설정되지 않았습니다.");
        }

        URI uri = UriComponentsBuilder
                .fromUriString(properties.getPublicData().getBusinessValidationUri())
                .queryParam("serviceKey", serviceKey)
                .build(true)
                .toUri();

        Map<String, Object> body = Map.of("businesses", List.of(Map.of(
                "b_no", businessNumber,
                "start_dt", openingDate,
                "p_nm", representativeName
        )));

        try {
            Map<String, Object> response = restClient.post()
                    .uri(uri)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(Map.class);
            List<?> data = response == null ? List.of() : (List<?>) response.getOrDefault("data", List.of());
            if (data.isEmpty() || !(data.get(0) instanceof Map<?, ?> first)) {
                return BusinessRegistrationResult.invalid("사업자 진위확인 응답이 비어 있습니다.");
            }
            String valid = String.valueOf(first.get("valid"));
            if ("01".equals(valid)) {
                return BusinessRegistrationResult.verified();
            }
            Object messageValue = first.get("valid_msg");
            String message = messageValue == null ? "사업자 정보가 일치하지 않습니다." : String.valueOf(messageValue);
            return BusinessRegistrationResult.invalid(message);
        } catch (RuntimeException ex) {
            return BusinessRegistrationResult.unavailable("사업자 진위확인 API 호출에 실패했습니다.");
        }
    }
}
