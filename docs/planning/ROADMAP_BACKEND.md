# D-PLOG 백엔드 로드맵 (상세)

> 통합 로드맵: [`ROADMAP.md`](./ROADMAP.md)
> 프론트엔드 로드맵: [`ROADMAP_FRONTEND.md`](./ROADMAP_FRONTEND.md)
> 워크플로우: `.agent/workflows/implement-backend-feature.md`
> 테스트 전략: [하단 참조](#-테스트-전략)
> 마지막 업데이트: 2026-03-04

---

## Phase 0: 인프라 셋업 (1~2일)

1. **Spring Boot 프로젝트 신규 생성** (Spring Initializr)
   - Spring Boot 4.0, Java 25, Gradle 9
   - 코어 의존성: Web, JPA, Security 7, Validation, WebFlux, Actuator, OpenTelemetry Starter
   - JWT/OIDC 의존성: `nimbus-jose-jwt` (id_token 파싱/검증), `spring-security-oauth2-jose`
   - 신기술 설정: Virtual Threads 기본 활성화, Declarative HTTP Client, JSpecify Null Safety, Built-in Resilience, Jackson 3.0
   - Java 25 기능 활용: Scoped Values (요청 ID 전파), Structured Concurrency (다중 비동기 작업), record DTO
2. **멀티모듈 구조 셋업**
   - `app-api`, `store`, `ranking`, `report`, `integration`, `billing`, `common` 모듈 생성
3. **DB 설계 및 JPA 엔티티 생성** (TECHSPEC §2 도메인 모델 기준)
   - dev: H2, prod: MySQL
4. **공통 인프라 코드**
   - `SecurityConfig` 기본 구조
   - `ResDTO<T>` 응답 래퍼 (레거시 패턴 유지)
   - 글로벌 예외 핸들러
   - 환경변수 `@ConfigurationProperties` 바인딩
5. **Python FastAPI 프로젝트 생성** (`ai-worker/`)

> 🧪 **테스트:** 수동 API 테스트(curl/Postman)로 충분. 빌드 + 컨텍스트 로드 테스트만 유지.
   - 기본 health check 엔드포인트
   - Bedrock/boto3 연결 확인

---

## Phase 1: 인증 시스템 (3~4일)

> 레거시: 세션(JSESSIONID) → 신규: JWT 토큰

1. **Spring Security 7 + JWT 설정**
   - `SecurityConfig` → 레거시 참고하되 JWT 필터로 교체
   - `JwtTokenProvider`: 토큰 생성/검증/갱신
   - `JwtAuthenticationFilter`: 요청마다 토큰 검증
2. **카카오 OIDC 연동**
   - `POST /v1/auth/kakao/login` — 인가코드 → OIDC 토큰 교환 → id_token 검증 → 서버 JWT 발급
   - OIDC Discovery: `https://kauth.kakao.com/.well-known/openid-configuration`
   - id_token에서 `sub`, `nickname`, `email`, `picture` 등 클레임 추출
   - nonce 검증으로 리플레이 공격 방지
   - 레거시 `kakao.*` 환경변수 이관 + `KAKAO_ISSUER_URI` 추가
3. **회원 관리 API**
   - `GET /v1/auth/me` — JWT에서 사용자 정보 추출
   - `POST /v1/auth/logout` — 리프레시 토큰 무효화
   - `POST /v1/auth/refresh` — 토큰 갱신
4. **레거시 암호화 유틸 이관**
   - `BillingKeyEncryptionUtil` → AES-256-CBC 암호화 유지

> 🧪 **테스트:** 수동 API 테스트로 충분. JWT 발급/검증은 curl로 확인.
   - `NsearchadSignatures` → HMAC-SHA256 서명 유지

---

## Phase 2: 가게 등록 + 키워드 (3~5일)

> PRD §7.2 가게 정보 수집, §7.3 키워드 입력/관리
>
> ⚠️ **외부 API 연동 필수** — 가게 등록 시 내순이(NomadScrap) 서버를 통해 플레이스 메타 수집

1. **Store 모듈 — 기본 CRUD** ✅ 완료
   - `POST /v1/stores` — 가게 등록
   - `GET /v1/stores/{storeId}` — 가게 조회
   - `PUT /v1/stores/{storeId}` — 가게 정보 수정
   - `GET /v1/stores/me` — 내 가게 목록
2. **Store 모듈 — 내순이(NomadScrap) 연동** ✅ 완료
   - 플레이스 URL → `GET http://{nomadscrap-server.ip}/v1/nplace/rank/trackable?url=&apiKey=` → 가게 메타(shopName, category, address, shopImageUrl) 자동 수집
   - 레거시: `NomadscrapNplaceRankTrackableRepository.getTrackable(url)` 참고
   - Declarative HTTP Client로 리팩토링
   - 응답 DTO: `{ code, message, data: { nplaceRankShop: JsonNode } }`
3. **KeywordSet 모듈** ✅ 완료
   - `POST /v1/stores/{storeId}/keyword-sets` — 키워드 세트 저장
   - `GET /v1/stores/{storeId}/keyword-sets` — 키워드 세트 목록
   - 유효성: 중복 제거, 길이 제한, 금칙어 검사
4. **네이버 검색광고 API 연동** ✅ 완료
   - 레거시: `NsearchadRepository.getKeywordstool(keyword)` 참고
   - `GET https://{nsearchad.domain}/keywordstool?hintKeywords=&showDetail=1`
   - HMAC-SHA256 서명 필요 (레거시 `NsearchadSignatures` 이관)
   - 헤더: `X-Customer`, `X-API-KEY`, `X-Timestamp`, `X-Signature`
   - 연관 키워드 추천 + 검색량/경쟁도 조회
5. **API 문서 + 테스트 인프라** ✅ 완료
   - SpringDoc OpenAPI (Swagger UI: `/swagger-ui.html`)
   - Dev 자동 로그인 엔드포인트 (`POST /v1/auth/dev/login`, `@Profile("dev")`)
   - `/api-test` 워크플로우

---

## Phase 3: 순위 조회 + 비동기 잡 (5~7일)

> PRD §7.4 순위 조회, §7.6 비동기 잡

1. **비동기 잡 인프라**
   - `DiagnosisRequest` 상태 머신: `PENDING → RUNNING → SUCCESS/FAILED/PARTIAL`
   - Virtual Threads 기반 비동기 처리
   - Structured Concurrency로 다중 키워드 동시 조회를 하나의 작업 단위로 묶기
   - Scoped Values로 요청 ID(Correlation ID) Virtual Thread 간 전파
   - 중복 방지: jobKey = `storeId + keywordSetHash + dateBucket`

> 🧪 **TDD 필수:** 상태 머신 전이 로직 (PENDING→RUNNING→SUCCESS/FAILED/PARTIAL), jobKey 중복 방지 단위 테스트
2. **진단 API**
   - `POST /v1/diagnosis` → `202 Accepted` + jobId
   - `GET /v1/diagnosis/{jobId}/status` — 폴링
   - `GET /v1/diagnosis/{jobId}` — 전체 결과
3. **내순이(NomadScrap) 연동** (`integration` 모듈)
   - 레거시 엔드포인트 참고:
     - `GET /v1/nplace/rank/realtime?apiKey=&keyword=&province=&filterType=&filterValue=` — 실시간 순위 조회
     - `POST /v1/nplace/rank/track/chart` — 순위 차트 + trackInfo(shopName/imageUrl/category/address) 조회
     - `POST /v1/nplace/rank/track/info` — 트래킹 정보 동기화
     - `POST /v1/nplace/rank/track` — 순위 트래킹 등록
     - `DELETE /v1/nplace/rank/track/{id}` — 트래킹 삭제
   - 레거시 코드:
     - `model_external/nomadscrap/nplace/rank/repository/NomadscrapNplaceRank*Repository.java`
     - WebClient + `nomadscrap-server.ip` + `nomadscrap-server.api-key` 환경변수
   - Declarative HTTP Client로 리팩토링
   - Built-in Resilience로 retry/circuit breaker 적용
   - 실패/타임아웃 → 캐시 대체
4. **RankingSnapshot + RankingItem 저장**

---

## Phase 4: AI 리포트 생성 (7~10일)

> PRD §7.5 진단 리포트, TECHSPEC §5 LLM 최적화

### Python FastAPI (AI 워커) 구현 순서
1. **공공데이터 수집 파이프라인**
   - 소상공인 상가정보 API → 경쟁점 포화도
   - 국세청 사업자 조회 → 폐업률 산출
   - 교통카드 합성데이터 → 유동인구/이탈률
   - 행안부 주민등록 인구 → 배후수요
2. **데이터 정제/집계** (Pandas)
   - 원시 JSON → `{"총_경쟁점": 47, "폐업비율": "41.2%"}` 고밀도 지표
3. **RAG 파이프라인**
   - Bedrock KB + LangChain RetrieveAndGenerate
   - Tool/Function Calling 구조
   - 프롬프트 템플릿 (요약/근거/개선/즉시실행/우선순위)
4. **API 엔드포인트**
   - `POST /ai/v1/generate-report`

### Spring Boot (연동)
5. Spring → FastAPI 비동기 호출 (Declarative HTTP Client)
6. 리포트 결과 수신 → `DiagnosisReport` + `ReportSection` 저장
7. **리포트 API**
   - `GET /v1/reports/{reportId}`
   - `GET /v1/stores/{storeId}/reports`

---

## Phase 5: 결제 시스템 (5~7일) [Post-MVP]

> 레거시 PortOne V2 패턴을 Spring Boot 4.0으로 이관
>
> ⚠️ **이 Phase는 TDD 필수** — 돈이 걸린 로직은 반드시 테스트 먼저 작성

1. **Billing 모듈 — 플랜 관리**
   - `GET /v1/billing/plans` — 플랜 목록 (레거시: `POST /v1/membership/list`)
   - `GET /v1/billing/subscription` — 현재 구독 조회
2. **PortOne V2 연동** (레거시 `PortOneV2Config` 참고)
   - `POST /v1/billing/payments/pre-register` — 사전등록
   - `POST /v1/billing/payments/billing-key/complete` — 빌링키 발급 완료
   - `POST /v1/billing/payments/billing-key/fail` — 발급 실패
   - `POST /v1/billing/payments/charge` — 단건 결제
3. **구독 관리**
   - `POST /v1/billing/subscriptions` — 정기 결제 예약
   - `GET /v1/billing/subscriptions/status` — 상태 조회
   - `DELETE /v1/billing/subscriptions` — 해지
4. **웹훅**
   - `POST /v1/billing/webhook` — PortOne 이벤트 수신
5. **결제 스케줄러** (레거시 `SchedulingConfig`, `PaymentSchedulerProperties` 참고)
   - 예약 누락 검사, 재시도 로직
6. **레거시 유틸 이관**
   - `PaymentIdGenerator`, `PaymentUtils`, `RefundCalculator`, `UpgradeCalculator`

> 🧪 **TDD 필수 대상:**
> - `RefundCalculator` — 환불 금액 계산
> - `UpgradeCalculator` — 업/다운그레이드 차액 계산
> - `PaymentIdGenerator` — 결제 ID 생성 규칙
> - 웹훅 서명 검증 로직
> - 결제 스케줄러 재시도/누락 검사

---

## Phase 7: 관측성 + 운영 안정화 (3~5일) [Post-MVP]

1. 요청 ID 전파 — Scoped Values (JEP 506) 로 Correlation ID 전체 체인 전파
2. 구조화 로그 (JSON, Logback)
3. Sentry 에러 트래킹
4. OpenTelemetry 1st-class Starter 활성화
5. Actuator 헬스체크
6. Built-in Resilience 점검 — 외부 API(내순이, 포트원, 카카오) retry/circuit breaker 튜닝

---

## 🧪 테스트 전략

| Phase | 테스트 방식 | 이유 |
|-------|-----------|------|
| **0~2** | 수동 API 테스트 (curl/Postman) | 도메인 모델 변경 빈번, 속도 우선 |
| **3** | 🔴 **TDD** — 상태 머신, 중복 방지 | 비동기 잡 상태 전이는 버그 시 디버깅 난이도 높음 |
| **4** | 수동 + AI 출력 품질 검증 | 프롬프트 변경마다 수동 검토 |
| **5** | 🔴 **TDD 필수** — 결제/환불/업그레이드 | 돈이 걸린 로직은 예외 없이 테스트 |
| **7** | 통합 테스트 | 프로덕션 배포 전 핵심 API 검증 |

---

## 📂 레거시 이관 체크리스트

### 코드 (재작성하되 로직 참고)
- [x] `SecurityConfig.java` → Spring Security 7 + JWT로 재작성
- [ ] `PortOneV2Config.java` → Declarative HTTP Client로 재작성
- [ ] `BillingKeyEncryptionUtil.java` → AES-256-CBC 암호화 로직 이관
- [x] `NsearchadSignatures.java` → HMAC-SHA256 서명 로직 이관
- [ ] `PaymentIdGenerator.java` → 결제 ID 생성 로직 이관
- [ ] `RefundCalculator.java` → 환불 계산 로직 이관
- [ ] `UpgradeCalculator.java` → 업/다운그레이드 계산 로직 이관
- [ ] `AbstractSubscriptionCalculator.java` → 구독 계산 기반 클래스 이관
- [ ] `PaymentSchedulerProperties.java` → 스케줄러 설정 이관
- [x] `SessionManager.java` → JWT 기반으로 대체

### 외부 API 연동 (model_external 재작성)
- [x] `NomadscrapNplaceRankTrackableRepository` → Declarative HTTP Client (Phase 2)
- [ ] `NomadscrapNplaceRankRealtimeRepository` → Declarative HTTP Client (Phase 3)
- [ ] `NomadscrapNplaceRankTrackChartRepository` → Declarative HTTP Client (Phase 3)
- [ ] `NomadscrapNplaceRankTrackInfoRepository` → Declarative HTTP Client (Phase 3)
- [ ] `NomadscrapNplaceRankTrackRepository` → Declarative HTTP Client (Phase 3)
- [x] `NsearchadRepository` → WebClient + HMAC 서명 (Phase 2)

### 문서 (정책/스펙 참고용)
- [ ] `springboot-react-nomadrank/docs/auth/` — 카카오 로그인 플로우, 싱크 도입계획
- [ ] `springboot-react-nomadrank/docs/api/` — 멤버십 API 명세, PortOne 구독 API
- [ ] `springboot-react-nomadrank/docs/payment/` — 결제 보상/환불/해지/다운그레이드 정책
- [ ] `springboot-react-nomadrank/docs/membership/` — 사용량 명세, 업그레이드 정책
- [ ] `springboot-react-nomadrank/docs/reply/` — Nplace 댓글/암호화 (D-PLOG에서 필요 시)
- [ ] `springboot-react-nomadrank/docs/search/` — 연관검색어 기능명세
