package kr.co.nomadlab.dplog.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import kr.co.nomadlab.dplog.common.ApiException;
import kr.co.nomadlab.dplog.config.DplogProperties;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class KakaoOidcService {
    private static final String SESSION_STATE = "dplog_kakao_state";
    private static final String SESSION_NONCE = "dplog_kakao_nonce";

    private final DplogProperties properties;
    private final AppUserRepository userRepository;
    private final UserConsentRepository consentRepository;
    private final KakaoChannelRelationRepository channelRelationRepository;
    private final RestClient restClient;
    private final SecureRandom secureRandom = new SecureRandom();
    private final JwtDecoder jwtDecoder;

    public KakaoOidcService(
            DplogProperties properties,
            AppUserRepository userRepository,
            UserConsentRepository consentRepository,
            KakaoChannelRelationRepository channelRelationRepository
    ) {
        this.properties = properties;
        this.userRepository = userRepository;
        this.consentRepository = consentRepository;
        this.channelRelationRepository = channelRelationRepository;
        this.restClient = RestClient.builder().build();

        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(properties.getKakao().getJwkSetUri()).build();
        OAuth2TokenValidator<Jwt> issuerValidator = JwtValidators.createDefaultWithIssuer(properties.getKakao().getIssuer());
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(issuerValidator, this::validateAudience));
        this.jwtDecoder = decoder;
    }

    public KakaoAuthorizeResponse createAuthorizeUrl(HttpSession session) {
        DplogProperties.Kakao kakao = properties.getKakao();
        if (isBlank(kakao.getClientId())) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "KAKAO_NOT_CONFIGURED", "카카오 로그인 설정이 필요합니다.");
        }

        String state = randomUrlToken();
        String nonce = randomUrlToken();
        session.setAttribute(SESSION_STATE, state);
        session.setAttribute(SESSION_NONCE, nonce);

        String scope = String.join(" ", kakao.getRequiredScopes());
        String authorizeUrl = UriComponentsBuilder
                .fromUriString(kakao.getAuthorizeUri())
                .queryParam("response_type", "code")
                .queryParam("client_id", kakao.getClientId())
                .queryParam("redirect_uri", kakao.getRedirectUri())
                .queryParam("state", state)
                .queryParam("nonce", nonce)
                .queryParam("scope", scope)
                .build()
                .toUriString();

        return new KakaoAuthorizeResponse(authorizeUrl, state);
    }

    @Transactional
    public KakaoLoginResponse handleCallback(KakaoCallbackRequest request, HttpServletRequest servletRequest) {
        HttpSession session = servletRequest.getSession(false);
        if (session == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "OAUTH_SESSION_MISSING", "로그인 세션이 만료되었습니다.");
        }
        String expectedState = Objects.toString(session.getAttribute(SESSION_STATE), "");
        String expectedNonce = Objects.toString(session.getAttribute(SESSION_NONCE), "");
        session.removeAttribute(SESSION_STATE);
        session.removeAttribute(SESSION_NONCE);

        if (isBlank(expectedState) || !expectedState.equals(request.state())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "OAUTH_STATE_MISMATCH", "카카오 로그인 보안 검증에 실패했습니다.");
        }

        KakaoTokenResponse token = exchangeToken(request.code());
        Jwt jwt = decodeAndValidate(token.idToken(), expectedNonce);
        Map<String, Object> kakaoUserInfo = fetchKakaoUserInfo(token.accessToken());

        AppUser user = upsertUser(jwt, kakaoUserInfo);
        saveDefaultConsents(user, request.marketingConsent());
        KakaoChannelRelation channel = saveChannelRelation(user, token);
        authenticateSession(user, servletRequest);

        return new KakaoLoginResponse(AuthUserDto.from(user), ChannelRelationDto.from(channel));
    }

    private KakaoTokenResponse exchangeToken(String code) {
        DplogProperties.Kakao kakao = properties.getKakao();
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", "authorization_code");
        form.add("client_id", kakao.getClientId());
        form.add("redirect_uri", kakao.getRedirectUri());
        form.add("code", code);
        if (!isBlank(kakao.getClientSecret())) {
            form.add("client_secret", kakao.getClientSecret());
        }

        KakaoTokenResponse response = restClient.post()
                .uri(URI.create(kakao.getTokenUri()))
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(form)
                .retrieve()
                .body(KakaoTokenResponse.class);

        if (response == null || isBlank(response.idToken()) || isBlank(response.accessToken())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "KAKAO_TOKEN_INVALID", "카카오 토큰 응답이 올바르지 않습니다.");
        }
        return response;
    }

    private Jwt decodeAndValidate(String idToken, String expectedNonce) {
        try {
            Jwt jwt = jwtDecoder.decode(idToken);
            String nonce = jwt.getClaimAsString("nonce");
            if (isBlank(expectedNonce) || !expectedNonce.equals(nonce)) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "OIDC_NONCE_MISMATCH", "카카오 OIDC nonce 검증에 실패했습니다.");
            }
            return jwt;
        } catch (JwtException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "OIDC_ID_TOKEN_INVALID", "카카오 ID 토큰 검증에 실패했습니다.");
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchKakaoUserInfo(String accessToken) {
        try {
            Map<String, Object> response = restClient.get()
                    .uri(URI.create(properties.getKakao().getUserInfoUri()))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .body(Map.class);
            return response == null ? Map.of() : response;
        } catch (RuntimeException ex) {
            return Map.of();
        }
    }

    @SuppressWarnings("unchecked")
    private AppUser upsertUser(Jwt jwt, Map<String, Object> kakaoUserInfo) {
        String subject = jwt.getSubject();
        Map<String, Object> kakaoAccount = getMap(kakaoUserInfo, "kakao_account");
        Map<String, Object> profile = getMap(kakaoAccount, "profile");

        String email = firstNonBlank(
                stringValue(jwt.getClaim("email")),
                stringValue(kakaoAccount.get("email"))
        );
        String nickname = firstNonBlank(
                stringValue(jwt.getClaim("nickname")),
                stringValue(profile.get("nickname")),
                email
        );
        String name = firstNonBlank(
                stringValue(jwt.getClaim("name")),
                stringValue(kakaoAccount.get("name")),
                nickname
        );
        String imageUrl = firstNonBlank(
                stringValue(jwt.getClaim("picture")),
                stringValue(profile.get("profile_image_url")),
                stringValue(profile.get("thumbnail_image_url"))
        );

        AppUser user = userRepository.findByKakaoSubject(subject).orElseGet(AppUser::new);
        user.setKakaoSubject(subject);
        user.setEmail(email);
        user.setNickname(nickname);
        user.setName(name);
        user.setProfileImageUrl(imageUrl);
        user.setLastLoginAt(Instant.now());
        user.setRole(resolveRole(email));
        return userRepository.save(user);
    }

    private UserRole resolveRole(String email) {
        if (email == null) {
            return UserRole.USER;
        }
        return properties.getAdminEmails().stream()
                .filter(adminEmail -> email.equalsIgnoreCase(adminEmail.trim()))
                .findFirst()
                .map(ignore -> UserRole.ADMIN)
                .orElse(UserRole.USER);
    }

    private void saveDefaultConsents(AppUser user, Boolean marketingConsent) {
        upsertConsent(user, "KAKAO", "KAKAO_SYNC", true, true, "kakao-sync", Instant.now());
        upsertConsent(user, "DPLOG", "TERMS_OF_SERVICE", true, true, "2026-04-29", Instant.now());
        upsertConsent(user, "DPLOG", "PRIVACY_POLICY", true, true, "2026-04-29", Instant.now());
        upsertConsent(user, "DPLOG", "MARKETING", false, Boolean.TRUE.equals(marketingConsent), "2026-04-29",
                Boolean.TRUE.equals(marketingConsent) ? Instant.now() : null);
    }

    private void upsertConsent(
            AppUser user,
            String provider,
            String termCode,
            boolean required,
            boolean agreed,
            String version,
            Instant agreedAt
    ) {
        UserConsent consent = consentRepository.findByUserAndTermCode(user, termCode).orElseGet(UserConsent::new);
        consent.setUser(user);
        consent.setProvider(provider);
        consent.setTermCode(termCode);
        consent.setRequired(required);
        consent.setAgreed(agreed);
        consent.setVersion(version);
        consent.setAgreedAt(agreedAt);
        consentRepository.save(consent);
    }

    private KakaoChannelRelation saveChannelRelation(AppUser user, KakaoTokenResponse token) {
        String channelPublicId = properties.getKakao().getChannelPublicId();
        if (isBlank(channelPublicId)) {
            return null;
        }

        KakaoChannelRelation relation = channelRelationRepository
                .findByUserAndChannelPublicId(user, channelPublicId)
                .orElseGet(KakaoChannelRelation::new);
        relation.setUser(user);
        relation.setChannelPublicId(channelPublicId);
        relation.setScopeGranted(hasChannelScope(token.scope()));
        relation.setCheckedAt(Instant.now());

        if (!relation.isScopeGranted()) {
            relation.setRelation(ChannelRelationStatus.CONSENT_REQUIRED);
            return channelRelationRepository.save(relation);
        }

        relation.setRelation(fetchChannelRelation(token.accessToken(), channelPublicId));
        return channelRelationRepository.save(relation);
    }

    @SuppressWarnings("unchecked")
    private ChannelRelationStatus fetchChannelRelation(String accessToken, String channelPublicId) {
        try {
            Map<String, Object> body = restClient.get()
                    .uri(properties.getKakao().getChannelRelationUri() + "?channel_public_id="
                            + URLEncoder.encode(channelPublicId, StandardCharsets.UTF_8))
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .retrieve()
                    .body(Map.class);

            Object channelsValue = body == null ? null : body.get("channels");
            if (channelsValue instanceof List<?> channels && !channels.isEmpty()) {
                Object first = channels.get(0);
                if (first instanceof Map<?, ?> channel) {
                    return parseChannelRelation(stringValue(channel.get("relation")));
                }
            }
            return ChannelRelationStatus.NONE;
        } catch (RuntimeException ex) {
            return ChannelRelationStatus.NONE;
        }
    }

    private ChannelRelationStatus parseChannelRelation(String relation) {
        if (isBlank(relation)) {
            return ChannelRelationStatus.NONE;
        }
        return switch (relation.toUpperCase(Locale.ROOT)) {
            case "ADDED" -> ChannelRelationStatus.ADDED;
            case "BLOCKED" -> ChannelRelationStatus.BLOCKED;
            default -> ChannelRelationStatus.NONE;
        };
    }

    private boolean hasChannelScope(String scope) {
        if (scope == null) {
            return false;
        }
        List<String> scopes = List.of(scope.split("\\s+"));
        return scopes.contains("talk_channel") || scopes.contains("plusfriends") || scopes.contains("talk_message");
    }

    private OAuth2TokenValidatorResult validateAudience(Jwt jwt) {
        String clientId = properties.getKakao().getClientId();
        if (!isBlank(clientId) && jwt.getAudience().contains(clientId)) {
            return OAuth2TokenValidatorResult.success();
        }
        return OAuth2TokenValidatorResult.failure(new OAuth2Error(
                "invalid_token",
                "Kakao ID token audience does not match configured client id.",
                null
        ));
    }

    private void authenticateSession(AppUser user, HttpServletRequest request) {
        DplogPrincipal principal = new DplogPrincipal(user.getId(), user.getEmail(), user.getRole());
        Collection<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
        );
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(principal, null, authorities);
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        request.getSession(true).setAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
                context
        );
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> getMap(Map<String, Object> source, String key) {
        Object value = source.get(key);
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return Map.of();
    }

    private String randomUrlToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (!isBlank(value)) {
                return value;
            }
        }
        return null;
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
