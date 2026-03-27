package kr.co.nomadlab.dplog.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI 3.0 설정
 * - Swagger UI: /swagger-ui.html
 * - API 명세: /v3/api-docs
 * - JWT Bearer 인증 스키마 설정
 */
@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("D-PLOG API")
                        .description("외식업 소상공인 플레이스 노출 진단 서비스 API")
                        .version("v1")
                        .contact(new Contact()
                                .name("NomadLab")
                                .url("https://nomadlab.co.kr")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(BEARER_SCHEME,
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT 액세스 토큰을 입력하세요. (Dev 환경: POST /v1/auth/dev/login으로 발급)")));
    }
}
