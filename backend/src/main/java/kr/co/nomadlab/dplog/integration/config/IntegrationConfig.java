package kr.co.nomadlab.dplog.integration.config;

import kr.co.nomadlab.dplog.common.properties.AppProperties;
import kr.co.nomadlab.dplog.integration.nomadscrap.NomadscrapClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.support.RestClientAdapter;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.service.invoker.HttpServiceProxyFactory;

/**
 * 외부 API 연동 설정
 * - NomadscrapClient: RestClient 기반 Declarative HTTP Client 프록시 빈
 * - WebClient: nsearchad 전용 (HMAC 동적 서명 필요)
 */
@Configuration
public class IntegrationConfig {

    /**
     * 내순이(NomadScrap) HTTP Client 프록시 빈 생성
     * - RestClient 기반 (Spring Boot 4.0 WebMVC 환경 호환)
     */
    @Bean
    public NomadscrapClient nomadscrapClient(AppProperties appProperties) {
        RestClient restClient = RestClient.builder()
                .baseUrl(appProperties.nomadscrap().baseUrl())
                .build();

        HttpServiceProxyFactory factory = HttpServiceProxyFactory
                .builderFor(RestClientAdapter.create(restClient))
                .build();

        return factory.createClient(NomadscrapClient.class);
    }

    /**
     * nsearchad 전용 WebClient 빈
     * - HMAC 서명 헤더가 매 요청마다 동적 생성되어야 하므로 WebClient 사용
     * - 응답 크기가 클 수 있으므로 버퍼 크기 2MB로 설정
     */
    @Bean
    public WebClient nsearchadWebClient() {
        return WebClient.builder()
                .codecs(configurer -> configurer
                        .defaultCodecs()
                        .maxInMemorySize(2 * 1024 * 1024)) // 2MB
                .build();
    }
}
