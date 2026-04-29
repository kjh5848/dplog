# D-PLOG 로그인/제품키/삭제키 운영 백엔드 구현 메모

## 목적

D-PLOG 데스크톱 배포를 위해 다운로드 권한, 제품키, 삭제키, 관리자 모니터링을 Python 패키징 서버에서 분리한다. 운영 인증 서버는 `backend_spring` Spring Boot 애플리케이션이 담당한다.

## 구현 범위

- 카카오 로그인은 서버가 `/v1/auth/kakao/authorize-url`에서 `state`와 `nonce`를 생성하고, `/v1/auth/kakao/callback`에서 OIDC ID token을 Nimbus 기반으로 검증한다.
- 웹 인증은 HttpOnly `DPL_SESSION` 세션 쿠키를 사용한다. 프론트는 access token과 refresh token을 저장하지 않는다.
- 카카오톡 채널은 로그인 시 스코프 동의를 확인하고, 설정된 `KAKAO_CHANNEL_PUBLIC_ID`가 있으면 채널 관계를 `ADDED`, `BLOCKED`, `NONE`, `CONSENT_REQUIRED`로 저장한다.
- 사업자 확인은 공공데이터포털 국세청 사업자등록정보 진위확인 API를 사용한다. `PUBLIC_DATA_SERVICE_KEY`가 없으면 `EXTERNAL_UNAVAILABLE`로 저장하고 제품키 발급은 막는다.
- 제품키는 사업자 진위확인과 음식점 카테고리 확인이 끝난 계정에서만 발급한다. 제품키 전문은 최초 발급 응답에서만 내려가며 서버에는 해시만 저장한다.
- 삭제키는 제품키와 별도 랜덤 키로 생성한다. 사용자가 직접 발급할 수 없고, 관리자 승인 시 1회 표시하며 서버에는 해시만 저장한다.

## 주요 API

- `GET /v1/auth/kakao/authorize-url`
- `POST /v1/auth/kakao/callback`
- `GET /v1/auth/me`
- `POST /v1/auth/logout`
- `POST /v1/auth/verify-license`
- `POST /v1/owner-verifications`
- `GET /v1/owner-verifications/me`
- `GET /v1/account/license`
- `POST /v1/account/license/request`
- `GET /v1/downloads/artifacts`
- `GET /v1/admin/dashboard/summary`
- `GET /v1/admin/licenses`
- `GET /v1/admin/delete-key-requests`
- `POST /v1/admin/delete-key-requests/{id}/approve`
- `POST /v1/admin/licenses/{id}/revoke`

## 운영 환경변수

- `KAKAO_REST_API_KEY`
- `KAKAO_CLIENT_SECRET`
- `KAKAO_REDIRECT_URI`
- `KAKAO_CHANNEL_PUBLIC_ID`
- `PUBLIC_DATA_SERVICE_KEY`
- `DPLOG_LICENSE_HASH_PEPPER`
- `DPLOG_ADMIN_EMAILS`
- `FRONTEND_BASE_URL`
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DRIVER`
- `DPLOG_MAC_DOWNLOAD_URL`, `DPLOG_WINDOWS_DOWNLOAD_URL`

## 보안 주의사항

- `DPLOG_LICENSE_HASH_PEPPER`는 운영 반영 전 반드시 교체한다.
- 레거시 Spring Boot 설정 파일에 남아 있는 민감정보는 운영 승격 전에 전부 회수하고 재발급한다.
- `/v1/admin/**`는 Spring Security의 `ROLE_ADMIN`만 접근할 수 있다. 관리자는 `DPLOG_ADMIN_EMAILS`에 등록된 카카오 계정 이메일로 판별한다.
- CSRF는 `XSRF-TOKEN` 쿠키와 `X-XSRF-TOKEN` 헤더를 사용한다. 카카오 콜백과 데스크톱 라이선스 검증 API만 CSRF 예외다.
- 제품키와 삭제키는 원문 저장 금지다. UI에서 1회 표시한 뒤에는 prefix/last4와 해시만 남긴다.

## 프론트 연결

- `frontend_dplog`는 `withCredentials` 기반 API 클라이언트로 변경했다.
- `/download`에서 사업자 확인, 제품키 발급, 앱 다운로드 링크를 제공한다.
- `/admin`에서 활성 제품키, 삭제키 승인 대기, 기기 활성화 수, 라이선스 폐기를 확인한다.
- 로그인 시작은 프론트가 카카오 URL을 직접 만들지 않고 `/v1/auth/kakao/authorize-url` 응답으로 이동한다.

## 남은 운영 작업

- 실제 Kakao Developers 앱에서 OIDC 활성화, Redirect URI, 카카오톡 채널 권한/동의 항목을 맞춘다.
- 공공데이터포털 API 활용 신청 후 `PUBLIC_DATA_SERVICE_KEY`를 운영 환경에 주입한다.
- 다운로드 파일 업로드 위치가 확정되면 `DPLOG_MAC_DOWNLOAD_URL`, `DPLOG_WINDOWS_DOWNLOAD_URL`을 실제 URL로 교체한다.
- H2 개발 DB 대신 운영 DB로 전환하고 `JPA_DDL_AUTO=validate` 또는 마이그레이션 도구를 도입한다.
