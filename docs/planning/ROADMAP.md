# D-PLOG 개발 로드맵

> 참조: `PRD.md`, `TECHSPEC.md`, `ai_backend_strategy.md`
> 레거시 백엔드: `springboot-react-nomadrank` (참고용 보관)
> 레거시 프론트엔드: `legacy/dplog` (대시보드/결제/유저 UI 참고)
> 마지막 업데이트: 2026-03-04

### 📁 상세 로드맵

| 문서 | 경로 | 내용 |
|------|------|------|
| **백엔드 상세** | [`ROADMAP_BACKEND.md`](./ROADMAP_BACKEND.md) | Spring Boot 4.0 + FastAPI Phase별 구현 순서, 레거시 이관 체크리스트 |
| **프론트엔드 상세** | [`ROADMAP_FRONTEND.md`](./ROADMAP_FRONTEND.md) | FSD 이관 원칙, Phase별 구현 순서, 레거시 이관 체크리스트 |

### 📋 워크플로우

| 워크플로우 | 경로 | 용도 |
|-----------|------|------|
| `/implement-backend-feature` | `.agent/workflows/implement-backend-feature.md` | 백엔드 기능 구현 시 따를 순서 |
| `/implement-fsd-feature` | `.agent/workflows/implement-fsd-feature.md` | 프론트엔드 기능 구현 시 따를 순서 |

---

## 현재 구현 현황

### 프론트엔드 (Next.js — `frontend_dplog`, FSD 아키텍처)
| Feature | 상태 | 설명 |
|---------|------|------|
| `home` | ✅ 구현됨 | 랜딩 페이지 (UI 16개 컴포넌트) |
| `onboarding` | ✅ 구현됨 | 진단 플로우 (Phase 1~5, 18+ 스텝 컴포넌트) |
| `auth` | ✅ 구현됨 | 인증 (API/모델/UI) |
| `dashboard` | 🔨 초기 | 대시보드 (API/모델/UI 골격) |

### 백엔드
| 항목 | 상태 |
|------|------|
| `springboot-react-nomadrank` | ⚠️ **레거시** — 재사용 불가, 참고용으로만 보관 |
| Spring Boot 신규 프로젝트 | ✅ 생성됨 |
| Python AI 워커 서버 | ✅ 생성됨 |

---

## 📌 Phase 요약

| Phase | 기간 | 백엔드 핵심 | 프론트엔드 핵심 |
|-------|------|-----------|---------------|
| **0** | 1~2일 | Spring Boot + FastAPI 프로젝트 생성, DB 설계, 멀티모듈 | API 클라이언트 셋업, MSW, 레거시 분석 |
| **1** | 3~4일 | Security 7 + JWT, 카카오 OIDC | auth feature (타입→API→스토어→UI→미들웨어) |
| **2** | 3~5일 | Store/KeywordSet 모듈, 검색광고 연동 | store feature + 온보딩 API 연동 |
| **3** | 5~7일 | 비동기 잡 인프라, 내순이 연동, RankingSnapshot | diagnosis 폴링 훅, ranking 시각화 |
| **4** | 7~10일 | FastAPI 공공데이터 + RAG, 리포트 API | report feature (5개 UI), PDF 다운로드 |
| **---** | **---** | **--- 🏆 MVP 출시 (핵심 가치 검증) ---** | **------------------------------------** |
| **5** (Post-MVP)| 5~7일 | Billing 모듈, PortOne V2, 구독/웹훅 | 결제 플로우, 구독 관리, 청구서 |
| **6** (Post-MVP)| 5~7일 | — (프론트 중심) | 대시보드 레이아웃, 유저/프로필/알림 |
| **7** (Post-MVP)| 3~5일 | 관측성, Sentry, OpenTelemetry | 접근성, SEO, 에러 바운더리, 성능 최적화 |

---

## ⏱️ 전체 타임라인

```
Phase 0 ████                         인프라 셋업        (1~2일)
Phase 1 ░░░░████                     인증 시스템        (3~4일)
Phase 2 ░░░░░░░░████                 가게+키워드        (3~5일)
Phase 3 ░░░░░░░░░░░░██████           순위조회+비동기    (5~7일)
Phase 4 ░░░░░░░░░░░░░░░░░░████████   AI 리포트 생성    (7~10일)
----------------[ 여기까지 MVP 출시 (진단 플로우 검증) ]----------------
Phase 5 ░░░░░░░░░░░░░░░░░░░░░░░░░░██████ 결제 시스템   (5~7일, Post-MVP)
Phase 6 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░████ 대시보드  (5~7일, Post-MVP)
Phase 7 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░██ 관측성  (3~5일, Post-MVP)
```

**예상 총 기간: 약 9~12주** (1인 기준, 풀타임)

---

## 💡 병렬 작업 전략

1. **Phase 0** 에서 OpenAPI 스펙(Swagger) 먼저 확정
2. 프론트는 MSW(Mock Service Worker)로 목 데이터 기반 개발
3. 백엔드 API 완성되면 목 → 실제 API로 교체
4. Phase 1(인증)은 다른 모든 API의 선행 조건이므로 **최우선 구현**

---

## 레거시 → 신규 API 비교표

### 인증 (Auth)

| 기능 | 레거시 (NomadRank) | 신규 (D-PLOG) | 비고 |
|------|-------------------|---------------|------|
| 카카오 로그인 | `GET /kakao/callback` (REST API) | `POST /v1/auth/kakao/login` (OIDC) | 카카오 OIDC로 변경 |
| 카카오 콜백 | 세션(JSESSIONID) 기반 | JWT 토큰 기반 | OIDC id_token → 서버 JWT 발급 |
| 로그아웃 | 세션 무효화 | `POST /v1/auth/logout` | 토큰 블랙리스트 |
| 회원정보 조회 | 세션에서 추출 | `GET /v1/auth/me` | JWT에서 추출 |

### 멤버십 (Membership → Billing)

| 기능 | 레거시 (NomadRank) | 신규 (D-PLOG) | 비고 |
|------|-------------------|---------------|------|
| 멤버십 목록 | `POST /v1/membership/list` | `GET /v1/billing/plans` | GET으로 변경 |
| 현재 구독 조회 | `GET /v1/membership/current` | `GET /v1/billing/subscription` | JWT에서 userId 추출 |
| 무료 멤버십 | `GET /v1/membership/free` | `GET /v1/billing/plans/free` | |
| 인기 멤버십 | `GET /v1/membership/popular` | `GET /v1/billing/plans?popular=true` | 쿼리 파라미터 |
| 가격대 조회 | `GET /v1/membership/price-range` | `GET /v1/billing/plans?minPrice=&maxPrice=` | |

### 결제 (Payment)

| 기능 | 레거시 (NomadRank) | 신규 (D-PLOG) | 비고 |
|------|-------------------|---------------|------|
| 결제 사전등록 | `POST /v1/payments/pre-register` | `POST /v1/billing/payments/pre-register` | 경로 통합 |
| 빌링키 발급 완료 | `POST /v1/payments/billing-key/complete` | `POST /v1/billing/payments/billing-key/complete` | |
| 빌링키 발급 실패 | `POST /v1/payments/billing-key/fail` | `POST /v1/billing/payments/billing-key/fail` | |
| 단건 결제 | `POST /v1/payments/charge` (스텁) | `POST /v1/billing/payments/charge` | 구현 예정 |
| 정기결제 예약 | `POST /v1/payments/subscribe` | `POST /v1/billing/subscriptions` | RESTful 리소스 |
| 구독 상태 조회 | `GET /v1/payments/subscriptions/status` | `GET /v1/billing/subscriptions/status` | |
| 구독 해지 | (문서만 존재) | `DELETE /v1/billing/subscriptions` | |
| 웹훅 | `POST /v1/payments/webhook` | `POST /v1/billing/webhook` | |

### 진단/스토어/리포트 (신규)

| 기능 | 신규 (D-PLOG) | 비고 |
|------|---------------|------|
| 진단 요청 | `POST /v1/diagnosis` | 비동기 202 + jobId |
| 진단 상태 | `GET /v1/diagnosis/{jobId}/status` | 폴링 |
| 진단 결과 | `GET /v1/diagnosis/{jobId}` | |
| 가게 등록 | `POST /v1/stores` | |
| 가게 조회 | `GET /v1/stores/{storeId}` | |
| 키워드 저장 | `POST /v1/stores/{storeId}/keyword-sets` | |
| 리포트 조회 | `GET /v1/reports/{reportId}` | |
| 리포트 히스토리 | `GET /v1/stores/{storeId}/reports` | |
| AI 리포트 생성 | `POST http://{ai-worker}/ai/v1/generate-report` | Spring → FastAPI |

### 외부 연동 (서버 간)

| 기능 | 레거시 (NomadRank) | 신규 (D-PLOG) | 비고 |
|------|-------------------|---------------|------|
| 순위 조회 (내순이) | `GET http://{ip}/v1/nplace/rank/realtime` | 동일 유지 | apiKey 인증 |
| 네이버 검색광고 | `nsearchad` HMAC 서명 호출 | 동일 유지 (Declarative HTTP Client) | |
| 펌핑스토어 | `GET http://{ip}/...` | 동일 유지 | |

---

## 환경변수 설계 (신규 프로젝트)

### Spring Boot 메인 서버 (`application.yml`)

```yaml
server:
  port: ${PORT:8080}

spring:
  profiles:
    active: ${SPRING_PROFILE:dev}
  datasource:
    url: ${DATABASE_URL:jdbc:h2:mem:dplog;DB_CLOSE_DELAY=-1}
    username: ${DATABASE_USERNAME:sa}
    password: ${DATABASE_PASSWORD:}
  jpa:
    hibernate:
      ddl-auto: ${JPA_DDL_AUTO:validate}
    open-in-view: false
  threads:
    virtual:
      enabled: true  # Spring Boot 4.0 Virtual Threads
```

### 레거시 → 신규 환경변수 매핑

| 카테고리 | 레거시 키 | 신규 키 | 설명 |
|----------|----------|---------|------|
| **DB** | (yml 하드코딩) | `DATABASE_URL` | jdbc:mysql://... |
| | (yml 하드코딩) | `DATABASE_USERNAME` | DB 사용자명 |
| | (yml 하드코딩) | `DATABASE_PASSWORD` | DB 비밀번호 |
| **내순이** | `nomadscrap-server.ip` | `NOMADSCRAP_IP` | 내순이 서버 IP |
| | `nomadscrap-server.api-key` | `NOMADSCRAP_API_KEY` | 내순이 API 키 |
| **네이버 검색광고** | `nsearchad.customer-id` | `NSEARCHAD_CUSTOMER_ID` | 네이버 고객 ID |
| | `nsearchad.api-key` | `NSEARCHAD_API_KEY` | API 키 |
| | `nsearchad.secret-key` | `NSEARCHAD_SECRET_KEY` | HMAC 서명용 시크릿 |
| **포트원 V2** | `portone.v2.store-id` | `PORTONE_STORE_ID` | 스토어 ID |
| | `portone.v2.api-secret` | `PORTONE_API_SECRET` | API 시크릿 |
| | `portone.v2.channel-key` | `PORTONE_CHANNEL_KEY` | 채널 키 |
| | `portone.v2.webhook-secret` | `PORTONE_WEBHOOK_SECRET` | 웹훅 검증 시크릿 |
| | `portone.billing.encryption-key` | `BILLING_ENCRYPTION_KEY` | 빌링키 AES 암호화 키 |
| **카카오 OIDC** | `kakao.rest-api-key` | `KAKAO_CLIENT_ID` | OIDC Client ID (= REST API 키) |
| | `kakao.client-secret` | `KAKAO_CLIENT_SECRET` | 클라이언트 시크릿 |
| | `kakao.redirect-uri` | `KAKAO_REDIRECT_URI` | OIDC 콜백 URL |
| | `kakao.channel-public-id` | `KAKAO_CHANNEL_PUBLIC_ID` | 채널 공개 ID |
| | ❌ 없음 | `KAKAO_ISSUER_URI` | `https://kauth.kakao.com` |
| **JWT (신규)** | ❌ 없음 | `JWT_SECRET` | JWT 서명 키 |
| | ❌ 없음 | `JWT_EXPIRATION_MS` | 액세스 토큰 만료 (ms) |
| | ❌ 없음 | `JWT_REFRESH_EXPIRATION_MS` | 리프레시 토큰 만료 (ms) |
| **AI 워커** | ❌ 없음 | `AI_WORKER_URL` | FastAPI 서버 URL |
| | ❌ 없음 | `AI_WORKER_API_KEY` | 내부 통신용 API 키 |
| **결제 스케줄러** | `payment.scheduler.*` | `PAYMENT_INSPECT_START_DAYS` | 예약 검사 시작 기준일 |
| | | `PAYMENT_INSPECT_END_DAYS` | 예약 검사 종료 기준일 |
| | | `PAYMENT_MAX_RETRY` | 최대 재시도 횟수 |

### Python FastAPI AI 워커 (`.env`)

| 키 | 설명 | 예시 |
|----|------|------|
| `AWS_ACCESS_KEY_ID` | AWS 자격증명 | |
| `AWS_SECRET_ACCESS_KEY` | AWS 시크릿 | |
| `AWS_REGION` | 리전 | `ap-northeast-2` |
| `BEDROCK_KB_ID` | Bedrock Knowledge Base ID | |
| `BEDROCK_MODEL_ID` | 사용할 모델 ID | `anthropic.claude-3-5-sonnet-...` |
| `OPENSEARCH_ENDPOINT` | OpenSearch Serverless URL | |
| `DATA_GO_KR_API_KEY` | 공공데이터포털 API 키 (통합) | |
| `SPRING_BOOT_CALLBACK_URL` | Spring Boot 콜백 URL | `http://localhost:8080` |
| `AI_WORKER_API_KEY` | 내부 통신 인증 키 | |
