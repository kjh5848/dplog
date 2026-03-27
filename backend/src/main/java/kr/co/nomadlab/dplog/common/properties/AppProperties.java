package kr.co.nomadlab.dplog.common.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * D-PLOG 커스텀 프로퍼티 바인딩
 * - application.yml의 dplog.* 속성을 타입 안전하게 바인딩
 */
@ConfigurationProperties(prefix = "dplog")
public record AppProperties(
        NomadscrapProperties nomadscrap,
        NsearchadProperties nsearchad,
        AiWorkerProperties aiWorker,
        JwtProperties jwt,
        KakaoProperties kakao
) {
    /** 내순이 (순위 수집 서비스) 설정 */
    public record NomadscrapProperties(
            String baseUrl,
            String apiKey,
            boolean useMock
    ) {}

    /** 네이버 검색광고 설정 */
    public record NsearchadProperties(
            String domain,
            String customerId,
            String apiKey,
            String secretKey
    ) {}

    /** AI 워커 서버 설정 */
    public record AiWorkerProperties(
            String url,
            String apiKey
    ) {}

    /** JWT 인증 설정 */
    public record JwtProperties(
            String secret,
            long expirationMs,
            long refreshExpirationMs
    ) {}

    /** 카카오 OIDC 설정 */
    public record KakaoProperties(
            String clientId,
            String redirectUri
    ) {}
}
