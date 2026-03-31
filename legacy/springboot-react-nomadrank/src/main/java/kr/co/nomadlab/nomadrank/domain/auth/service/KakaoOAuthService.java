package kr.co.nomadlab.nomadrank.domain.auth.service;

import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import jakarta.servlet.http.HttpSession;
import kr.co.nomadlab.nomadrank.common.constants.Constants.ResCode;
import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.config.SessionManager;
// duplicate imports removed
import kr.co.nomadlab.nomadrank.domain.auth.dto.external.ChannelRelationResponse;
import kr.co.nomadlab.nomadrank.domain.auth.dto.external.KakaoTokenResponseDTO;
import kr.co.nomadlab.nomadrank.domain.auth.dto.external.KakaoUserResponseDTO;
import kr.co.nomadlab.nomadrank.domain.auth.dto.request.ReqKakaoCallbackDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResKakaoLoginDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserStatus;
import kr.co.nomadlab.nomadrank.domain.membership.enums.MembershipState;
import kr.co.nomadlab.nomadrank.model.membership.entity.MembershipUserEntity;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipRepository;
import kr.co.nomadlab.nomadrank.model.membership.repository.MembershipUserRepository;
import kr.co.nomadlab.nomadrank.model.terms.entity.UserTermsAgreementEntity;
import kr.co.nomadlab.nomadrank.model.terms.repository.UserTermsAgreementRepository;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 카카오 OAuth 연동 서비스
 * 
 * 카카오 OAuth 2.0 API와 연동하여 토큰 발급 및 사용자 정보 조회 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 인증 코드를 이용한 액세스 토큰 발급
 * - 액세스 토큰을 이용한 사용자 정보 조회
 * - 카카오 API 에러 처리 및 로깅
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoOAuthService {

    private final WebClient webClient;
    private final SessionManager sessionManager;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;
    private final MembershipUserRepository membershipUserRepository;
    private final UserTermsAgreementRepository userTermsAgreementRepository;

    @Value("${kakao.rest-api-key}")
    private String kakaoRestApiKey;

    @Value("${kakao.client-secret:}")
    private String kakaoClientSecret;

    @Value("${kakao.redirect-uri}")
    private String kakaoRedirectUri;

    @Value("${kakao.channel-public-id:}")
    private String kakaoChannelPublicId;

    @Value("${kakao.authorize-uri:https://kauth.kakao.com/oauth/authorize}")
    private String kakaoAuthorizeUri;

    @Value("${kakao.required-scopes:}")
    private String kakaoRequiredScopes;

    @Value("${membership.free-trial-days:7}")
    private int freeTrialDays;

    // dev 용으로 state 검증을 비활성화할 수 있는 옵션 (기본 true = 검증)
    @Value("${kakao.state-validation.enabled:true}")
    private boolean kakaoStateValidationEnabled;

    // 카카오 OAuth 엔드포인트
    private static final String KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
    private static final String KAKAO_USER_INFO_URL = "https://kapi.kakao.com/v2/user/me";

    /**
     * 인증 코드를 사용하여 카카오 액세스 토큰 발급
     * 
     * @param authorizationCode 카카오에서 제공한 인증 코드
     * @return 카카오 토큰 응답 DTO
     * @throws AuthenticationException 토큰 발급 실패 시
     */
    public KakaoTokenResponseDTO getAccessToken(String authorizationCode) {
        log.info("카카오 액세스 토큰 발급 요청 - 인증코드: {}",
                authorizationCode.substring(0, Math.min(10, authorizationCode.length())) + "...");

        try {
            // 요청 파라미터 구성
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "authorization_code");
            params.add("client_id", kakaoRestApiKey);
            if (kakaoClientSecret != null && !kakaoClientSecret.trim().isEmpty()) {
                params.add("client_secret", kakaoClientSecret);
            }
            params.add("redirect_uri", kakaoRedirectUri);
            params.add("code", authorizationCode);

            // 카카오 토큰 발급 API 호출
            KakaoTokenResponseDTO response = webClient.post()
                    .uri(KAKAO_TOKEN_URL)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .body(BodyInserters.fromFormData(params))
                    .retrieve()
                    .bodyToMono(KakaoTokenResponseDTO.class)
                    .block();

            if (response == null || response.getAccessToken() == null) {
                log.error("카카오 토큰 발급 실패 - 응답이 null이거나 액세스 토큰이 없음");
                throw new AuthenticationException("카카오 로그인에 실패했습니다. 다시 시도해주세요.");
            }

            log.info("카카오 액세스 토큰 발급 성공 - 토큰타입: {}, 만료시간: {}초", response.getTokenType(), response.getExpiresIn());
            return response;

        } catch (WebClientResponseException e) {
            log.error("카카오 토큰 발급 API 호출 실패 - Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());

            if (e.getStatusCode() == HttpStatus.BAD_REQUEST) {
                throw new AuthenticationException("유효하지 않은 카카오 인증 코드입니다.");
            } else if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new AuthenticationException("카카오 API 키 설정을 확인해주세요.");
            } else {
                throw new AuthenticationException("카카오 로그인 처리 중 오류가 발생했습니다.");
            }
        } catch (Exception e) {
            log.error("카카오 토큰 발급 중 예상치 못한 오류", e);
            throw new AuthenticationException("카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    /**
     * 액세스 토큰을 사용하여 카카오 사용자 정보 조회
     * 
     * @param accessToken 카카오 액세스 토큰
     * @return 카카오 사용자 정보 DTO
     * @throws AuthenticationException 사용자 정보 조회 실패 시
     */
    public KakaoUserResponseDTO getUserInfo(String accessToken) {
        log.info("카카오 사용자 정보 조회 요청 - 토큰: {}...", accessToken.substring(0, Math.min(10, accessToken.length())));

        try {
            // 카카오 사용자 정보 조회 API 호출
            KakaoUserResponseDTO response = webClient.get()
                    .uri(KAKAO_USER_INFO_URL)
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .retrieve()
                    .bodyToMono(KakaoUserResponseDTO.class)
                    .block();

            if (response == null || response.getId() == null) {
                log.error("카카오 사용자 정보 조회 실패 - 응답이 null이거나 사용자 ID가 없음");
                throw new AuthenticationException("카카오 사용자 정보 조회에 실패했습니다.");
            }

            log.info("카카오 사용자 정보 조회 성공 - 사용자ID: {}, 닉네임: {}, 이메일: {}",
                    response.getId(),
                    response.getNickname(),
                    response.getEmail() != null ? response.getEmail() : "미제공");

            return response;

        } catch (WebClientResponseException e) {
            log.error("카카오 사용자 정보 조회 API 호출 실패 - Status: {}, Body: {}", e.getStatusCode(), e.getResponseBodyAsString());

            if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                throw new AuthenticationException("카카오 액세스 토큰이 유효하지 않습니다.");
            } else if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                throw new AuthenticationException("카카오 사용자 정보 접근 권한이 없습니다.");
            } else {
                throw new AuthenticationException("카카오 사용자 정보 조회 중 오류가 발생했습니다.");
            }
        } catch (Exception e) {
            log.error("카카오 사용자 정보 조회 중 예상치 못한 오류", e);
            throw new AuthenticationException("카카오 사용자 정보 조회에 실패했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    /**
     * 카카오 OAuth 전체 플로우 실행
     * 인증 코드 → 액세스 토큰 → 사용자 정보 순으로 처리
     * 
     * @param authorizationCode 카카오 인증 코드
     * @return 카카오 사용자 정보 DTO
     * @throws AuthenticationException OAuth 플로우 실행 실패 시
     */
    public KakaoUserResponseDTO processOAuthFlow(String authorizationCode) {
        log.info("카카오 OAuth 플로우 시작");

        try {
            // 1. 액세스 토큰 발급
            KakaoTokenResponseDTO tokenResponse = getAccessToken(authorizationCode);

            // 2. 사용자 정보 조회
            KakaoUserResponseDTO userResponse = getUserInfo(tokenResponse.getAccessToken());

            log.info("카카오 OAuth 플로우 완료 - 사용자ID: {}", userResponse.getId());
            return userResponse;

        } catch (AuthenticationException e) {
            log.error("카카오 OAuth 플로우 실패: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("카카오 OAuth 플로우 중 예상치 못한 오류", e);
            throw new AuthenticationException("카카오 로그인 처리 중 시스템 오류가 발생했습니다.");
        }
    }

    /**
     * 카카오 콜백 처리 통합 로직
     * AuthServiceApiV1에 있던 카카오 로직을 이 서비스로 통일했습니다.
     */
    @Transactional
    public HttpEntity<?> handleCallback(
            ReqKakaoCallbackDTOApiV1 reqDto,
            HttpSession session) {
        try {
            // 0) CSRF 방지용 state 검증 (옵션)
            Object sessionStateObj = session.getAttribute("kakao_oauth_state");
            String sessionState = sessionStateObj instanceof String ? (String) sessionStateObj : null;
            if (kakaoStateValidationEnabled) {
                if (sessionState == null || !sessionState.equals(reqDto.getState())) {
                    return new ResponseEntity<>(
                            ResDTO.builder()
                                    .code(ResCode.BAD_REQUEST_EXCEPTION)
                                    .message("유효하지 않은 state 값입니다.")
                                    .build(),
                            HttpStatus.BAD_REQUEST);
                }
            } else {
                // 검증 비활성화 시에도 세션에 남아있다면 제거
                if (sessionState != null) {
                    log.debug("Kakao state validation disabled. sessionState and request state are not enforced.");
                } else {
                    log.debug(
                            "Kakao state validation disabled and no session state present. Proceeding without check.");
                }
            }
            // 일회성 사용을 위해 state 제거 (있을 경우)
            session.removeAttribute("kakao_oauth_state");

            // 1) 액세스 토큰 발급 및 사용자 정보 조회
            KakaoTokenResponseDTO tokenResponse = getAccessToken(reqDto.getCode());
            KakaoUserResponseDTO kakaoUserInfo = getUserInfo(tokenResponse.getAccessToken());

            // 1-1) 필수 스코프(동의 항목) 충족 여부 검증 및 재동의 유도
            List<String> missingScopes = detectMissingScopes(tokenResponse, kakaoUserInfo);
            if (!missingScopes.isEmpty()) {
                // 재동의용 새로운 state 발급 및 세션 저장
                String reauthState = UUID.randomUUID().toString();
                session.setAttribute("kakao_oauth_state", reauthState);

                String reauthorizeUrl = buildAuthorizeUrl(reauthState, String.join(" ", missingScopes));
                return new ResponseEntity<>(
                        ResDTO.builder()
                                .code(ResCode.BAD_REQUEST_EXCEPTION)
                                .message("필수 동의 항목에 대한 재동의가 필요합니다.")
                                .data(Map.of(
                                        "missingScopes", missingScopes,
                                        "reauthorizeUrl", reauthorizeUrl))
                                .build(),
                        HttpStatus.BAD_REQUEST);
            }

            // 2) 필수 약관 동의 확인
            List<String> missingConsents = null;
            if (kakaoUserInfo.getKakaoAccount() != null &&
                    kakaoUserInfo.getKakaoAccount().getLegalNeeds() != null) {
                missingConsents = kakaoUserInfo.getKakaoAccount().getLegalNeeds().stream()
                        .filter(need -> Boolean.TRUE.equals(need.getRequired()))
                        .filter(need -> !Boolean.TRUE.equals(need.getAgreed()))
                        .map(KakaoUserResponseDTO.KakaoAccount.LegalNeed::getCode)
                        .distinct()
                        .toList();
            }
            if (missingConsents != null && !missingConsents.isEmpty()) {
                return new ResponseEntity<>(
                        ResDTO.builder()
                                .code(ResCode.BAD_REQUEST_EXCEPTION)
                                .message("필수 약관에 동의해야 합니다.")
                                .data(Map.of("missingConsents", missingConsents))
                                .build(),
                        HttpStatus.BAD_REQUEST);
            }

            // 3) 사용자 조회/생성 및 프로필 업데이트
            String providerId = kakaoUserInfo.getId().toString();
            Optional<UserEntity> existingUserOptional = userRepository
                    .findByProviderAndProviderIdAndDeleteDateIsNull("KAKAO", providerId);

            UserEntity userEntity;
            boolean isNewUser = false;

            if (existingUserOptional.isPresent()) {
                userEntity = existingUserOptional.get();
                updateKakaoUserProfile(userEntity, kakaoUserInfo);
            } else {
                userEntity = createKakaoUser(kakaoUserInfo);
                isNewUser = true;
            }

            // 4) 상태 검증
            validateUserStatus(userEntity);

            // 5) 중복 로그인 처리
            HttpSession existingSession = sessionManager.getSession(userEntity.getUsername());
            if (existingSession != null && !existingSession.getId().equals(session.getId())) {
                sessionManager.removeSession(userEntity.getUsername());
            }

            // 6) 신규 사용자라면 FREE 멤버십 할당
            if (isNewUser) {
                assignDefaultMembership(userEntity);
            }

            // 7) 약관 동의 내역 저장/갱신
            if (kakaoUserInfo.getKakaoAccount() != null && kakaoUserInfo.getKakaoAccount().getLegalNeeds() != null) {
                upsertKakaoConsents(userEntity, kakaoUserInfo);
            }

            // 8) 세션 생성 및 마지막 로그인 갱신
            ResAuthInfoDTOApiV1 authInfo = ResAuthInfoDTOApiV1.of(userEntity);

            session.setAttribute("authInfo", authInfo);
            sessionManager.addSession(userEntity.getUsername(), session);

            userEntity.setLastLoginDate(java.time.LocalDateTime.now());

            // 9) 채널 관계 요약 (서버 내 처리)
            var channelSummary = buildChannelSummary(tokenResponse, userEntity);

            // 10) 응답
            var responseData = new LinkedHashMap<String, Object>();
            responseData.put("user", ResKakaoLoginDTOApiV1.of(userEntity, kakaoUserInfo));
            responseData.put("isNewUser", isNewUser);
            if (channelSummary != null) {
                responseData.put("channel", channelSummary);
            }
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(0)
                            .message("카카오 로그인에 성공했습니다.")
                            .data(responseData)
                            .build(),
                    HttpStatus.OK);

        } catch (AuthenticationException e) {
            throw e;
        } catch (Exception e) {
            log.error("카카오 로그인 처리 중 시스템 오류", e);
            return new ResponseEntity<>(
                    ResDTO.builder()
                            .code(ResCode.EXCEPTION)
                            .message("카카오 로그인 처리 중 시스템 오류가 발생했습니다.")
                            .build(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * 필수 스코프(동의 항목) 충족 여부 판단
     */
    private List<String> detectMissingScopes(KakaoTokenResponseDTO token,
            KakaoUserResponseDTO user) {
        Set<String> required = new LinkedHashSet<>();
        if (kakaoRequiredScopes != null && !kakaoRequiredScopes.isBlank()) {
            for (String s : kakaoRequiredScopes.split(",")) {
                String v = s.trim();
                if (!v.isEmpty())
                    required.add(v);
            }
        }
        if (required.isEmpty())
            return List.of();

        Set<String> missing = new LinkedHashSet<>();
        String tokenScope = token.getScope() != null ? token.getScope() : "";

        KakaoUserResponseDTO.KakaoAccount acc = user.getKakaoAccount();
        boolean hasAcc = acc != null;

        for (String scope : required) {
            switch (scope) {
                case "profile_nickname" -> {
                    boolean need = hasAcc && Boolean.TRUE.equals(acc.getProfileNicknameNeedsAgreement());
                    boolean empty = user.getNickname() == null || user.getNickname().isBlank();
                    if (need || empty)
                        missing.add(scope);
                }
                case "profile_image" -> {
                    boolean need = hasAcc && Boolean.TRUE.equals(acc.getProfileImageNeedsAgreement());
                    boolean empty = user.getProfileImageUrl() == null || user.getProfileImageUrl().isBlank();
                    if (need || empty)
                        missing.add(scope);
                }
                case "account_email" -> {
                    boolean need = hasAcc && Boolean.TRUE.equals(   acc.getEmailNeedsAgreement());
                    boolean empty = user.getEmail() == null || user.getEmail().isBlank();
                    if (need || empty)
                        missing.add(scope);
                }
                case "name" -> {
                    boolean need = hasAcc && Boolean.TRUE.equals(acc.getNameNeedsAgreement());
                    boolean empty = user.getRealName() == null || user.getRealName().isBlank();
                    if (need || empty)
                        missing.add(scope);
                }
                case "gender" -> {
                    boolean need = hasAcc && Boolean.TRUE.equals(acc.getGenderNeedsAgreement());
                    boolean empty = user.getGender() == null || user.getGender().isBlank();
                    if (need || empty)
                        missing.add(scope);
                }
                case "age_range" -> {
                    boolean need = hasAcc && Boolean.TRUE.equals(acc.getAgeRangeNeedsAgreement());
                    boolean empty = user.getAgeRange() == null || user.getAgeRange().isBlank();
                    if (need || empty)
                        missing.add(scope);
                }
                case "birthday" -> {
                    boolean need = hasAcc && Boolean.TRUE.equals(acc.getBirthdayNeedsAgreement());
                    boolean empty = user.getBirthday() == null || user.getBirthday().isBlank();
                    if (need || empty)
                        missing.add(scope);
                }
                case "birthyear" -> {
                    boolean need = hasAcc && Boolean.TRUE.equals(acc.getBirthyearNeedsAgreement());
                    boolean empty = user.getBirthyear() == null || user.getBirthyear().isBlank();
                    if (need || empty)
                        missing.add(scope);
                }
                case "phone_number" -> {
                    boolean need = hasAcc && Boolean.TRUE.equals(acc.getPhoneNumberNeedsAgreement());
                    boolean empty = user.getPhoneNumber() == null || user.getPhoneNumber().isBlank();
                    if (need || empty)
                        missing.add(scope);
                }
                case "plusfriends", "talk_message" -> {
                    if (!tokenScope.contains(scope))
                        missing.add(scope);
                }
                default -> {
                    // 알 수 없는 스코프는 토큰 scope 문자열에서 일치 여부만 확인
                    if (!tokenScope.contains(scope))
                        missing.add(scope);
                }
            }
        }
        return List.copyOf(missing);
    }

    /**
     * 동의(재동의) 페이지로 이동시키는 카카오 authorize URL 생성
     */
    private String buildAuthorizeUrl(String state, String scopes) {
        StringBuilder sb = new StringBuilder(kakaoAuthorizeUri);
        sb.append("?response_type=code");
        sb.append("&client_id=").append(urlEncode(kakaoRestApiKey));
        sb.append("&redirect_uri=").append(urlEncode(kakaoRedirectUri));
        if (state != null && !state.isBlank()) {
            sb.append("&state=").append(urlEncode(state));
        }
        if (scopes != null && !scopes.isBlank()) {
            // 공백 구분으로 요청 (카카오는 공백/쉼표 모두 허용. 공백 사용)
            sb.append("&scope=").append(urlEncode(scopes));
        }
        return sb.toString();
    }

    private String urlEncode(String v) {
        try {
            return java.net.URLEncoder.encode(v, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return v;
        }
    }

    /**
     * 설정된 필수 스코프 전체를 포함한 authorize URL 생성
     */
    public String buildAuthorizeUrlWithRequiredScopes(String state) {
        String scopes = kakaoRequiredScopes != null ? kakaoRequiredScopes.replace(",", " ") : "";
        return buildAuthorizeUrl(state, scopes);
    }

    /**
     * JS SDK에서 사용할 수 있도록 공백 구분 스코프 문자열 제공
     */
    public String getRequiredScopesForAuthorize() {
        return kakaoRequiredScopes != null ? kakaoRequiredScopes.replace(",", " ") : "";
    }

    private Map<String, Object> buildChannelSummary(KakaoTokenResponseDTO tokenResponse,
            UserEntity userEntity) {
        String scopeStr = tokenResponse.getScope() != null ? tokenResponse.getScope() : "";
        boolean scopeGranted = scopeStr.contains("talk_channel") || scopeStr.contains("plusfriends");
        if (!scopeGranted) {
            return Map.of(
                    "status", ChannelRelationResponse.RelationStatus.NONE.name(),
                    "scopeGranted", false);
        }

        if (kakaoChannelPublicId == null || kakaoChannelPublicId.isBlank()) {
            return Map.of(
                    "status", ChannelRelationResponse.RelationStatus.NONE.name(),
                    "scopeGranted", true);
        }

        try {
            ChannelRelationResponse relation = fetchChannelRelation(tokenResponse.getAccessToken(), userEntity.getId());
            ChannelRelationResponse.RelationStatus status = ChannelRelationResponse.RelationStatus.NONE;
            if (relation != null && relation.getChannels() != null && !relation.getChannels().isEmpty()) {
                ChannelRelationResponse.ChannelInfo info = relation.getChannels().get(0);
                if (info.getRelation() != null) {
                    status = info.getRelation();
                }
            }
            return Map.of(
                    "status", status.name(),
                    "scopeGranted", true);
        } catch (Exception e) {
            log.warn("채널 관계 조회 실패: {}", e.getMessage());
            return Map.of(
                    "status", ChannelRelationResponse.RelationStatus.NONE.name(),
                    "scopeGranted", true);
        }
    }

    private ChannelRelationResponse fetchChannelRelation(String accessToken, Long appUserId) {
        try {
            ChannelRelationResponse response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .scheme("https")
                            .host("kapi.kakao.com")
                            .path("/v2/api/talk/channel")
                            .queryParam("channel_public_id", kakaoChannelPublicId)
                            .build())
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(ChannelRelationResponse.class)
                    .block();

            if (response == null) {
                ChannelRelationResponse fallback = new ChannelRelationResponse();
                fallback.setUserId(appUserId);
                ChannelRelationResponse.ChannelInfo info = new ChannelRelationResponse.ChannelInfo();
                info.setChannelPublicId(kakaoChannelPublicId);
                info.setRelation(ChannelRelationResponse.RelationStatus.NONE);
                fallback.setChannels(List.of(info));
                return fallback;
            }

            // 보조: userId 세팅 보장
            if (response.getUserId() == null) {
                response.setUserId(appUserId);
            }
            return response;

        } catch (WebClientResponseException e) {
            ChannelRelationResponse resp = new ChannelRelationResponse();
            resp.setUserId(appUserId);
            ChannelRelationResponse.ChannelInfo info = new ChannelRelationResponse.ChannelInfo();
            info.setChannelPublicId(kakaoChannelPublicId);

            if (e.getStatusCode() == HttpStatus.FORBIDDEN) {
                // 차단 혹은 권한 거부 상황을 BLOCKED로 표기
                info.setRelation(ChannelRelationResponse.RelationStatus.BLOCKED);
            } else if (e.getStatusCode() == HttpStatus.UNAUTHORIZED) {
                // 토큰 문제 → NONE 처리(상위에서 별도 에러로도 핸들링 가능)
                info.setRelation(ChannelRelationResponse.RelationStatus.NONE);
            } else if (e.getStatusCode() == HttpStatus.NOT_FOUND) {
                // 채널 ID 불일치 → NONE
                info.setRelation(ChannelRelationResponse.RelationStatus.NONE);
            } else {
                info.setRelation(ChannelRelationResponse.RelationStatus.NONE);
            }

            resp.setChannels(List.of(info));
            return resp;
        }
    }

    // ===== 내부 헬퍼 로직 (AuthServiceApiV1에서 이관) =====

    private void updateKakaoUserProfile(UserEntity userEntity,
            KakaoUserResponseDTO kakaoUserInfo) {
        boolean isUpdated = false;
        // 이름(실명) 우선, 없으면 닉네임
        String newRealName = kakaoUserInfo.getRealName();
        String newNickname = kakaoUserInfo.getNickname();
        String candidateName = newRealName != null ? newRealName : newNickname;
        if (candidateName != null && !candidateName.equals(userEntity.getName())) {
            userEntity.setName(candidateName);
            isUpdated = true;
        }

        String newProfileImage = kakaoUserInfo.getProfileImageUrl();
        if (newProfileImage != null && !newProfileImage.equals(userEntity.getProfileImage())) {
            userEntity.setProfileImage(newProfileImage);
            isUpdated = true;
        }

        String newEmail = kakaoUserInfo.getEmail();
        if (newEmail != null && userEntity.getEmail() == null) {
            var duplicateEmailUser = userRepository.findByEmail(newEmail);
            if (duplicateEmailUser.isEmpty()) {
                userEntity.setEmail(newEmail);
                isUpdated = true;
            }
        }

        // 성별
        String newGender = kakaoUserInfo.getGender();
        if (newGender != null && (userEntity.getGender() == null || userEntity.getGender().isBlank())) {
            userEntity.setGender(newGender);
            isUpdated = true;
        }

        // 생년월일 (SOLAR만)
        java.time.LocalDate newBirthDate = kakaoUserInfo.getBirthDateOrNull();
        if (newBirthDate != null && userEntity.getBirthDate() == null) {
            userEntity.setBirthDate(newBirthDate);
            isUpdated = true;
        }

        // 전화번호
        String newPhone = kakaoUserInfo.getPhoneNumber();
        if (newPhone != null && (userEntity.getTel() == null || userEntity.getTel().isBlank())) {
            userEntity.setTel(newPhone);
            isUpdated = true;
        }

        if (isUpdated) {
            userRepository.save(userEntity);
            log.info("카카오 사용자 프로필 업데이트: {}", userEntity.getUsername());
        }
    }

    private void upsertKakaoConsents(UserEntity userEntity,
            KakaoUserResponseDTO kakaoUserInfo) {
        var legalNeeds = kakaoUserInfo.getKakaoAccount().getLegalNeeds();
        if (legalNeeds == null)
            return;

        for (var need : legalNeeds) {
            if (need.getCode() == null)
                continue;

            var entityOpt = userTermsAgreementRepository.findByUserEntityAndTermCode(userEntity, need.getCode());
            var entity = entityOpt.orElseGet(() -> UserTermsAgreementEntity.builder()
                    .userEntity(userEntity)
                    .provider("KAKAO")
                    .termCode(need.getCode())
                    .build());

            entity.setRequired(Boolean.TRUE.equals(need.getRequired()));
            entity.setAgreed(Boolean.TRUE.equals(need.getAgreed()));
            entity.setVersion(need.getRevisionTime());
            entity.setAgreedAt(parseIsoDateTimeOrNull(need.getAgreedAt()));

            userTermsAgreementRepository.save(entity);
        }
    }

    private java.time.LocalDateTime parseIsoDateTimeOrNull(String iso) {
        if (iso == null || iso.isBlank())
            return null;
        try {
            return java.time.OffsetDateTime.parse(iso).toLocalDateTime();
        } catch (Exception e1) {
            try {
                return java.time.LocalDateTime.parse(iso);
            } catch (Exception e2) {
                return null;
            }
        }
    }

    private UserEntity createKakaoUser(KakaoUserResponseDTO kakaoUserInfo) {
        String providerId = kakaoUserInfo.getId().toString();
        String username = "kakao_" + providerId;

        int counter = 1;
        String originalUsername = username;
        while (userRepository.existsByUsername(username)) {
            username = originalUsername + "_" + counter++;
        }

        String email = kakaoUserInfo.getEmail();
        if (email != null && userRepository.existsByEmail(email)) {
            email = null;
        }

        var newUser = UserEntity.builder()
                .username(username)
                .name(kakaoUserInfo.getRealName() != null ? kakaoUserInfo.getRealName() : kakaoUserInfo.getNickname())
                .email(email)
                .password(BCrypt.hashpw("KAKAO_USER_NO_PASSWORD", BCrypt.gensalt()))
                .provider("KAKAO")
                .providerId(providerId)
                .profileImage(kakaoUserInfo.getProfileImageUrl())
                .status(UserStatus.COMPLETION)
                .balance(0)
                .authority(List.of(UserAuthoritySort.USER))
                .gender(kakaoUserInfo.getGender())
                .birthDate(kakaoUserInfo.getBirthDateOrNull())
                .tel(kakaoUserInfo.getPhoneNumber())
                .build();

        var saved = userRepository.save(newUser);
        log.info("신규 카카오 사용자 생성: {}", saved.getUsername());
        return saved;
    }

    private void validateUserStatus(UserEntity userEntity) {
        if (java.time.LocalDateTime.now().isAfter(userEntity.getExpireDate())) {
            throw new AuthenticationException("만료된 계정입니다.");
        }
        if (userEntity.getStatus().equals(UserStatus.WAITING)) {
            throw new AuthenticationException("승인 대기중인 계정입니다.");
        }
        if (userEntity.getStatus().equals(UserStatus.WITHDRAW)) {
            throw new AuthenticationException("탈퇴된 계정입니다.");
        }
        if (userEntity.getStatus().equals(UserStatus.STOP)) {
            throw new AuthenticationException("사용중지된 계정입니다.");
        }
    }

    private void assignDefaultMembership(UserEntity userEntity) {
        try {
            var freeMembership = membershipRepository.findByName("FREE");
            if (freeMembership == null) {
                log.warn("FREE 멤버십을 찾을 수 없습니다. 멤버십 할당 건너뜀");
                return;
            }

            var existingMembership = membershipUserRepository
                    .findByUserEntityAndMembershipState(userEntity, MembershipState.ACTIVATE);
            if (existingMembership.isPresent()) {
                log.info("사용자가 이미 활성 멤버십을 보유: {}", userEntity.getUsername());
                return;
            }

            // 필수 컬럼(start_date, end_date)이 NOT NULL 이므로 값 설정
            java.time.LocalDate start = java.time.LocalDate.now();
            java.time.LocalDate end = freeTrialDays > 0 ? start.plusDays(freeTrialDays) : null;

            var membershipUser = MembershipUserEntity.builder()
                    .userEntity(userEntity)
                    .membershipEntity(freeMembership)
                    .startDate(start)
                    .endDate(end)
                    .membershipState(MembershipState.ACTIVATE)
                    .build();

            membershipUserRepository.save(membershipUser);

            if (end == null) {
                log.info("FREE 멤버십 할당 완료(무제한): {}", userEntity.getUsername());
            } else {
                log.info("FREE 멤버십 할당 완료: {} ({} ~ {})", userEntity.getUsername(), start, end);
            }

        } catch (Exception e) {
            log.error("FREE 멤버십 할당 중 오류", e);
        }
    }

}
