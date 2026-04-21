# D-PLOG DDD 아키텍처 상세 문서 (모듈러 모놀리스)

## 1. 목적
DDD(도메인 주도 설계)를 기반으로 D‑PLOG 백엔드를 **모듈러 모놀리스(Java/Spring Boot) + AI 마이크로서비스(Python/FastAPI) 투트랙 아키텍처**로 재구성한다.  
메인 비즈니스 로직(회원, 상점, 결제 등)은 단일 Spring Boot 앱으로 견고하게 유지하고, RAG 및 공공데이터 연산 같은 AI 로직은 파이썬 생태계를 활용하여 **확장성과 개발 효율성**을 극대화한다.

## 2. 기본 원칙
1) 메인 비즈니스: Spring Boot 모듈러 모놀리스  
`app-api` 모듈만 `@SpringBootApplication`을 보유하는 단일 실행 앱으로 구성하여 복잡한 도메인 통신 오버헤드를 줄인다.

2) AI 집중: Python 마이크로서비스  
RAG 및 Pandas 연산이 필요한 기능은 별도의 FastAPI 서버로 위임(Decoupling)하여 목적에 맞는 언어(Polyglot)를 채택한다.

3) 계층 분리  
Presentation → Application → Domain → Infrastructure 순서로 의존성을 고정한다.

4) 컨텍스트 경계 준수  
도메인 간 직접 의존 금지. 다른 컨텍스트는 Application 레이어에서 조합한다.

5) 외부 연동 캡슐화  
모든 외부 API 호출은 Infrastructure 레이어의 클라이언트/레포지토리로 고립한다.

## 3. 전체 모듈 구성
### [Spring Boot 메인 애플리케이션 내부]
1) `app-api`  
API 엔드포인트, 보안 설정, 글로벌 예외 처리, 공통 응답 포맷

2) `auth`  
JWT 기반 인증/인가, 사용자 인증 흐름

3) `store`  
가게 정보, 진단 요청 컨텍스트 관리

4) `ranking`  
키워드/순위 조회, 내순이 API 연동 결과 관리

5) `report`  
진단 리포트 생성/저장/조회

6) `billing`  
결제/구독/플랜 관리

7) `integration`  
외부 API 통합 레이어 (SNS, 내순이 등)

8) `batch`  
폴링/스케줄링/배치 잡 실행

9) `common`  
예외/유틸/공통 DTO/로깅/상수

### [Python 별도 마이크로서비스]
10) `ai-rag (FastAPI)`  
Bedrock Knowledge Bases 연동, 프롬프트 체이닝, RAG 응답 생성, 공공데이터 Pandas 연산 전담 서버. Spring Boot 서버와 REST API로 통신한다.

## 4. 디렉터리 예시
```text
dplog-backend/        # 메인 Spring Boot 레포지토리
  modules/
    app-api/
    auth/
      application/
      domain/
      infrastructure/
      presentation/
    store/
    ranking/
    report/
    billing/
    integration/
    batch/
    common/

dplog-ai-server/      # 파이썬 AI 마이크로서비스 레포지토리 (루트 기준 별도 폴더 권장)
  app/
    api/              # FastAPI 엔드포인트 (Spring Boot가 호출)
    core/             # 설정, 의존성 주입 등
    services/         # RAG 로직, LLM 호출 파이프라인
    utils/            # 데이터프레임(Pandas) 전처리 유틸
  requirements.txt
```

## 5. 모듈별 상세 사양
### 5.1 app-api
1) 목적  
외부 요청의 진입점, 보안/라우팅/공통 응답 처리

2) 주요 구성  
`Controller`, `SecurityConfig`, `ExceptionHandler`, `ResponseWrapper`

3) 의존 모듈  
`auth`, `store`, `ranking`, `report`, `billing`, `ai-rag`, `common`

4) 공개 API 범위  
`/v1/auth/*`, `/v1/store/*`, `/v1/diagnosis/*`, `/v1/rank/*`, `/v1/report/*`, `/v1/billing/*`

### 5.2 auth
1) 목적  
JWT 기반 인증/인가 및 사용자 세션 제거

2) 주요 유스케이스  
로그인, 토큰 발급/갱신, 로그아웃, 권한 검증

3) 토큰 정책  
Access Token + Refresh Token  
Access TTL 15~60분, Refresh TTL 7~30일 (정책 확정 필요)  
토큰 저장: 클라이언트 보관 (HttpOnly Cookie 또는 Authorization 헤더)

4) 구성 요소  
`TokenProvider`, `AuthService`, `AuthRepository`, `JwtFilter`

5) 인프라/구조  
Infrastructure: 사용자 조회용 Repository, Refresh Token 저장소(Redis 권장)  
Storage: RDS(User, RefreshToken) + Redis(블랙리스트/회전 토큰)  
External: Kakao OAuth 콜백(선택)

### 5.3 store
1) 목적  
가게 정보 입력/저장, 진단 요청 컨텍스트 생성

2) 주요 엔티티  
`Store`, `StoreProfile`, `DiagnosisRequest`

3) 주요 유스케이스  
가게 등록/수정, 가게 조회, 진단 요청 생성

4) 외부 연동  
네이버 플레이스 URL 크롤링 데이터 수집 (integration 모듈 경유)

5) 인프라/구조  
Infrastructure: StoreRepository, DiagnosisRequestRepository, CrawlClient  
Storage: RDS(Store, StoreProfile, DiagnosisRequest)  
External: Naver Place 크롤링 API

### 5.4 ranking
1) 목적  
키워드 기반 순위 조회 및 저장

2) 주요 엔티티  
`KeywordSet`, `RankingSnapshot`, `RankingItem`

3) 주요 유스케이스  
키워드 등록, 실시간 순위 조회, 순위 이력 저장

4) 외부 연동  
내순이(순위 수집 서비스) REST API 호출

5) 인프라/구조  
Infrastructure: RankingRepository, KeywordSetRepository, NomadscrapClient  
Storage: RDS(KeywordSet, RankingSnapshot, RankingItem)  
External: 내순이 퍼블릭 REST, API Key 인증

### 5.5 report
1) 목적  
진단 리포트 생성/저장/조회

2) 주요 엔티티  
`DiagnosisReport`, `ReportSection`, `ReportEvidence`

3) 주요 유스케이스  
리포트 생성, 리포트 조회, 히스토리 관리

4) 인프라/구조  
Infrastructure: ReportRepository, TemplateRepository  
Storage: RDS(DiagnosisReport, ReportSection, ReportEvidence)  
External: 없음(내부 생성)

### 5.6 billing
1) 목적  
구독/결제/플랜 정책을 관리하고 과금 상태를 도메인으로 유지한다.

2) 주요 엔티티  
`Plan`, `Subscription`, `Payment`, `PaymentMethod`, `BillingEvent`

3) 주요 유스케이스  
구독 생성/변경/해지, 결제 승인/취소, 영수증/인보이스 발급, 결제 실패 복구

4) 외부 연동  
결제 게이트웨이(PortOne 등) 호출 및 웹훅 수신

5) 인프라/구조  
Infrastructure: BillingRepository, PaymentGatewayClient, WebhookHandler  
Storage: RDS(Plan, Subscription, Payment, BillingEvent)  
External: 결제 PG, Webhook 인증/서명 검증

### 5.7 ai-rag (Python FastAPI 기반 마이크로서비스)
1) 목적  
LLM RAG 기반 진단 근거 생성 및 공공데이터 전처리(통계/집계) 전담 서버

2) 주요 유스케이스  
지식베이스(Vector DB) 검색, 키워드 분석 근거 생성, 리포트 요약문 작성, 공공데이터 API 통계(Pandas)

3) 외부 연동 (통신)  
Spring Boot 측(`report` 또는 `batch` 모듈)에서 HTTP REST 통신으로 AI 분석 작업을 요청

4) 인프라/구조  
Framework: FastAPI (Python 3.10+), LangChain / LlamaIndex  
Infrastructure: BedrockKbClient, OpenAI/Anthropic Client  
Storage: S3(문서), OpenSearch(벡터)  
External: Bedrock API, 공공데이터 API

### 5.8 integration
1) 목적  
외부 API 클라이언트 집합 (내순이, SNS, 크롤러 등)

2) 주요 구성  
`NomadscrapClient`, `SnsClient`, `CrawlClient`

3) 규칙  
비즈니스 로직 없음. 요청/응답 변환 및 예외 처리만 담당

4) 인프라/구조  
Infrastructure: 각 외부 API 전용 Client/Repository  
Storage: 없음  
External: 내순이, SNS, 크롤링 서비스

### 5.9 batch
1) 목적  
폴링/스케줄링/배치 실행을 중앙화

2) 주요 잡  
순위 일일 스냅샷 저장  
폴링 스케줄 잡 (내순이 호출)  
리포트 자동 생성 (옵션)

3) 실행 규칙  
스케줄러는 batch 모듈에서만 유지한다.

4) 인프라/구조  
Infrastructure: Scheduler, JobRunner  
Storage: RDS(작업 상태), Redis(락/중복 방지)  
External: 없음

### 5.10 common
1) 목적  
공통 유틸, 예외, 응답 포맷, 상수 관리

2) 예시  
`ResDTO`, `ErrorCode`, `CommonExceptionHandler`, `DateUtils`

## 6. 인증/인가 상세 설계 (JWT 기준)
1) 인증 방식  
세션 제거, JWT 전면 적용

2) 토큰 전달  
`Authorization: Bearer <access-token>` 권장  
Refresh는 HttpOnly Cookie 또는 별도 엔드포인트로 관리

3) 권한 모델  
ROLE 기반 (ADMIN, USER, MANAGER 등)  
권한 검증은 Filter + Method Security 혼합

4) 토큰 폐기  
Refresh 토큰 회전(rotate) 방식 권장  
탈취 방지 필요 시 Redis 블랙리스트 사용

## 7. 내 가게 진단 유스케이스 배치
1) Presentation  
`/v1/diagnosis` API

2) Application  
`StoreDiagnosisService`가 Store + Ranking + AI + Report 조합

3) Domain  
`DiagnosisRequest`, `KeywordSet`, `RankingSnapshot`, `DiagnosisReport`

4) Infrastructure  
`NomadscrapClient`, `BedrockKbClient`

## 8. 외부 연동 사양 (내순이)
1) 호출 방식  
D-PLOG 서버 → 내순이 퍼블릭 REST API 폴링

2) 인증 방식  
`apiKey` 쿼리 파라미터

3) 예시  
`GET http://{nomadscrap-server.ip}/v1/nplace/rank/realtime?apiKey=***&keyword=...&province=...`

## 9. 장시간 처리(알림/RAG) 설계
1) 요청 처리 방식  
긴 처리(RAG/리포트)는 **비동기 잡**으로 전환한다.  
`POST /v1/diagnosis` → `202 Accepted + jobId` 반환  
`GET /v1/diagnosis/{jobId}` → 결과 조회  
`GET /v1/diagnosis/{jobId}/status` → 상태 조회  

2) 상태 전이  
`PENDING → RUNNING → SUCCESS/FAILED`  
필요 시 `PARTIAL` 상태로 부분 결과 먼저 제공

3) 큐/워커 구성  
`batch` 모듈이 폴링/리포트 생성 워커 역할  
SQS 같은 메시지 큐를 사용해 작업을 비동기로 처리  
실패 작업은 재시도 및 DLQ(Dead Letter Queue)로 분리

4) 알림 방식  
완료 시점에 사용자에게 **SSE/WebSocket** 또는 **푸시/이메일** 알림  
실시간 UI는 `status` polling 또는 `SSE` 방식 중 하나 선택

5) 타임아웃/성능  
RAG 요청은 타임아웃을 두고, 초과 시 **부분 결과 + 재시도**  
결과는 DB에 저장하여 동일 요청 재생성 비용을 줄인다.

## 10. 필수 운영 요소 (서비스 공통)
1) 관측성(Observability)  
구조화 로그(JSON), 요청 ID 전파, 에러 트래킹(Sentry)  
메트릭/트레이싱(OpenTelemetry + Prometheus/Grafana 권장)

2) 보안/비밀 관리  
시크릿은 환경 변수 또는 AWS Secrets Manager/SSM에서 관리  
TLS 강제, 입력 검증, CORS 최소화

3) 레이트 리미트/오용 방지  
IP/사용자 기준 제한, 비정상 트래픽 차단  
키워드 조회/진단 요청은 별도 Rate Limit 권장

4) 데이터 보존/백업  
DB 자동 백업, 주기적 스냅샷, 복구 시나리오 문서화  
리포트/결제 기록 등은 보존 정책 정의

5) 작업 큐 안정성  
재시도/지연 재시도, DLQ, 중복 처리 방지(아이템포턴시 키)

6) API 안정성  
버저닝(`/v1`), 응답 스키마 고정, 변경 로그 관리

## 11. 마이그레이션 방향
1) JWT 기반 인증 모듈 우선 구축  
2) ranking 모듈에 내순이 연동 이전  
3) billing 모듈 분리 및 결제 흐름 정리  
4) store + report + ai-rag 순서로 이관  
5) 레거시 API 제거 및 정리

## 12. 프론트엔드 아키텍처
- 프론트엔드 확장 구조/폴더 규칙/비동기 job 처리 전략은 `frontend-architecture.md` 문서를 기준으로 진행한다.
