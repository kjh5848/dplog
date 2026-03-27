package kr.co.nomadlab.nomadrank.domain.auth.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.HttpSession;
import kr.co.nomadlab.nomadrank.common.constants.Constants;
import kr.co.nomadlab.nomadrank.common.dto.ResDTO;
import kr.co.nomadlab.nomadrank.common.exception.AuthenticationException;
import kr.co.nomadlab.nomadrank.config.SessionManager;
import kr.co.nomadlab.nomadrank.domain.auth.dto.request.ReqAuthLoginDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.dto.request.ReqKakaoCallbackDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResAuthInfoDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.dto.response.ResGetSessionListDTOApiV1;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserAuthoritySort;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserStatus;
import kr.co.nomadlab.nomadrank.model.user.entity.UserEntity;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceApiV1 {

        private final UserRepository userRepository;
        private final SessionManager sessionManager;
        private final KakaoOAuthService kakaoOAuthService;

        @Transactional
        public HttpEntity<?> login(ReqAuthLoginDTOApiV1 reqDto, HttpSession session) {
                Optional<UserEntity> userEntityOptional = userRepository
                                .findByUsernameAndDeleteDateIsNull(reqDto.getUser().getUsername());
                if (userEntityOptional.isEmpty()) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                                                        .message("존재하지 않는 사용자입니다.")
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }
                UserEntity userEntity = userEntityOptional.get();
                if (!BCrypt.checkpw(reqDto.getUser().getPassword(), userEntity.getPassword())) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                                                        .message("비밀번호가 일치하지 않습니다.")
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }
                if (LocalDateTime.now().isAfter(userEntity.getExpireDate())) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                                                        .message("만료된 계정입니다.")
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }
                if (userEntity.getStatus().equals(UserStatus.WAITING)) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                                                        .message("승인 대기중인 계정입니다.")
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }
                if (userEntity.getStatus().equals(UserStatus.WITHDRAW)) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                                                        .message("탈퇴된 계정입니다.")
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }
                if (userEntity.getStatus().equals(UserStatus.STOP)) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                                                        .message("사용중지된 계정입니다.")
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }
                if (sessionManager.existsSession(userEntity.getUsername())) {
                        return new ResponseEntity<>(
                                        ResDTO.builder()
                                                        .code(Constants.ResCode.BAD_REQUEST_EXCEPTION)
                                                        .message("이미 로그인 중인 계정입니다.")
                                                        .build(),
                                        HttpStatus.BAD_REQUEST);
                }

                ResAuthInfoDTOApiV1 resDto = ResAuthInfoDTOApiV1.of(userEntity);
                session.setAttribute("authInfo", resDto);
                sessionManager.addSession(userEntity.getUsername(), session);

                userEntity.setLastLoginDate(LocalDateTime.now());

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(resDto)
                                                .build(),
                                HttpStatus.OK);
        }

        public HttpEntity<?> logout(HttpSession session) {
                ResAuthInfoDTOApiV1 resAuthInfoDTOApiV1 = (ResAuthInfoDTOApiV1) session.getAttribute("authInfo");
                if (resAuthInfoDTOApiV1 == null) {
                        throw new AuthenticationException(null);
                }

                String username = resAuthInfoDTOApiV1.getUser().getUsername();

                // SessionManager에서 세션 제거 (testuser, richmanager 제외)
                if (!username.equals("testuser") && !username.equals("richmanager")) {
                        sessionManager.removeSession(username);
                } else {
                        // 특수 계정은 세션만 무효화
                        session.invalidate();
                }

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
        }

        public HttpEntity<?> getSessionList(List<UserAuthoritySort> authority) {
                if (authority.contains(UserAuthoritySort.USER)) {
                        throw new AuthenticationException("권한이 없습니다.");
                }

                Map<String, HttpSession> activeSessions = sessionManager.getActiveSessions();

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .data(ResGetSessionListDTOApiV1.of(activeSessions))
                                                .build(),
                                HttpStatus.OK);
        }

        public HttpEntity<?> deleteSession(List<UserAuthoritySort> authority, String username) {
                if (authority.contains(UserAuthoritySort.USER)) {
                        throw new AuthenticationException("권한이 없습니다.");
                }

                sessionManager.removeSession(username);

                return new ResponseEntity<>(
                                ResDTO.builder()
                                                .code(0)
                                                .message("success")
                                                .build(),
                                HttpStatus.OK);
        }

        /**
         * 카카오 OAuth 콜백 처리
         * 
         * 카카오 인증 코드를 받아서 사용자 정보를 조회하고 로그인 처리를 수행합니다.
         * 신규 사용자인 경우 자동으로 계정을 생성하고 FREE 멤버십을 할당합니다.
         * 
         * @param reqDto  카카오 콜백 요청 DTO (인증 코드, state)
         * @param session HTTP 세션
         * @return 로그인 성공 응답 또는 에러 응답
         */
        @Transactional
        public HttpEntity<?> kakaoCallback(ReqKakaoCallbackDTOApiV1 reqDto, HttpSession session) {
                return kakaoOAuthService.handleCallback(reqDto, session);
        }

        /**
         * 기존 카카오 사용자의 프로필 정보 업데이트
         */
        // Kakao 프로필 업데이트 로직은 KakaoOAuthService로 이전됨

        // Kakao 약관 동의 내역 저장/갱신 로직은 KakaoOAuthService로 이전됨

        // Kakao 동의시간 파싱 유틸은 KakaoOAuthService로 이전됨

        /**
         * 신규 카카오 사용자 계정 생성
         */
        // Kakao 신규 사용자 생성 로직은 KakaoOAuthService로 이전됨

        /**
         * 사용자 상태 검증
         */
        // Kakao 사용자 상태 검증 로직은 KakaoOAuthService로 이전됨

        /**
         * 신규 사용자에게 FREE 멤버십 자동 할당
         */
        // Kakao 신규 사용자 FREE 멤버십 할당 로직은 KakaoOAuthService로 이전됨
}
