package kr.co.nomadlab.dplog.auth.client;

import kr.co.nomadlab.dplog.common.exception.BusinessException;
import kr.co.nomadlab.dplog.common.properties.AppProperties;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.text.ParseException;
import java.util.Map;

/**
 * 카카오 OIDC 클라이언트
 * - 인가 코드 → 토큰 교환 → id_token 파싱
 * - RestClient 사용 (Spring Boot 4.0 권장)
 */
@Component
public class KakaoOidcClient {

    private static final Logger log = LoggerFactory.getLogger(KakaoOidcClient.class);
    private static final String KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";

    private final String clientId;
    private final String redirectUri;
    private final RestClient restClient;

    public KakaoOidcClient(AppProperties appProperties) {
        this.clientId = appProperties.kakao().clientId();
        this.redirectUri = appProperties.kakao().redirectUri();
        this.restClient = RestClient.builder()
                .baseUrl(KAKAO_TOKEN_URL)
                .build();
    }

    /**
     * 카카오 인가 코드로 토큰 교환 → id_token에서 유저 정보 추출
     *
     * @param code 카카오 인가 코드
     * @return 카카오 유저 정보 (sub, nickname, email, picture)
     */
    public KakaoUserInfo exchangeCodeForUserInfo(String code) {
        try {
            // 1. 인가 코드 → 카카오 OAuth 토큰 교환
            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("grant_type", "authorization_code");
            formData.add("client_id", clientId);
            formData.add("redirect_uri", redirectUri);
            formData.add("code", code);

            @SuppressWarnings("unchecked")
            Map<String, Object> tokenResponse = restClient.post()
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(formData)
                    .retrieve()
                    .body(Map.class);

            if (tokenResponse == null || !tokenResponse.containsKey("id_token")) {
                log.error("카카오 토큰 응답에 id_token이 없습니다: {}", tokenResponse);
                throw new BusinessException("AUTH_KAKAO_ERROR", 502, "카카오 인증 응답이 유효하지 않습니다.");
            }

            String idToken = (String) tokenResponse.get("id_token");
            log.debug("카카오 id_token 수신 성공");

            // 2. id_token(JWT) 파싱 → 유저 정보 추출
            return parseIdToken(idToken);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("카카오 토큰 교환 실패", e);
            throw new BusinessException("AUTH_KAKAO_ERROR", 502, "카카오 인증에 실패했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 카카오 id_token(JWT) 파싱 → 유저 정보 추출
     */
    private KakaoUserInfo parseIdToken(String idToken) {
        try {
            SignedJWT jwt = SignedJWT.parse(idToken);
            var claims = jwt.getJWTClaimsSet();

            String sub = claims.getSubject();
            String nickname = (String) claims.getClaim("nickname");
            String email = (String) claims.getClaim("email");
            String picture = (String) claims.getClaim("picture");

            // 닉네임이 없으면 이메일의 @ 앞부분 사용
            if (nickname == null || nickname.isBlank()) {
                nickname = email != null ? email.split("@")[0] : "사용자";
            }

            // 이메일이 없으면 기본값 설정
            if (email == null || email.isBlank()) {
                email = sub + "@kakao.user";
            }

            log.debug("카카오 유저 정보 추출: sub={}, nickname={}, email={}", sub, nickname, email);

            return new KakaoUserInfo(sub, nickname, email, picture);
        } catch (ParseException e) {
            throw new BusinessException("AUTH_KAKAO_ERROR", 502, "카카오 id_token 파싱 실패", e);
        }
    }

    /**
     * 카카오 유저 정보 DTO
     */
    public record KakaoUserInfo(
            /** 카카오 고유 ID (sub 클레임) */
            String sub,
            /** 닉네임 */
            String nickname,
            /** 이메일 */
            String email,
            /** 프로필 이미지 URL */
            String picture
    ) {}
}
