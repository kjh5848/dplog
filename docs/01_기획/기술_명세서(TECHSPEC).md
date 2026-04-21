# D-PLOG TECH SPEC (외식업 소상공인 플레이스 노출 진단)

- 문서 목적: PRD 요구사항을 구현하기 위한 백엔드/프론트/데이터/연동 설계를 정리한다.
- PDF 반영 상태: **미반영** (PDF 경로 필요)
- 참조 문서: `ai_backend_strategy.md` **(반영 완료)**

## 1. 아키텍처 방향

### 1.1 전체 아키텍처: 투트랙 (Spring Boot + Python FastAPI)

> [!IMPORTANT]
> `ai_backend_strategy.md` 에서 확정된 **Option A: 투트랙** 구조를 채택합니다.

| 서버 | 기술 스택 | 담당 모듈 | 역할 |
|------|-----------|-----------|------|
| **메인 서버** | Spring Boot 4.0 (Java 25, Spring Framework 7) | `app-api`, `auth`, `store`, `ranking`, `report`, `billing`, `integration`, `common` | API 진입점, 인증/보안, 결제, CRUD, 트랜잭션 |
| **AI 워커 서버** | Python FastAPI | `ai-rag`, `data-pipeline` | Bedrock RAG, LangChain 프롬프트 체이닝, 공공데이터 통계 처리 |

**선택 근거:**
1. **도메인 복잡도 해결** — 결제, 유저 권한, 프랜차이즈 상점 관리 등 전통적 웹 비즈니스 로직은 Spring Boot의 안정성 활용
2. **AI 생태계 편승** — RAG 고도화, Vector DB 연동, 공공데이터 JSON 통계 처리는 Python(Pandas, LangChain) 생태계가 압도적으로 유리
3. **스케일아웃 독립성** — AI 서버만 별도 증설 가능, 메인 결제/로그인 서버 보호
4. **Spring Boot 4.0 활용** — Virtual Threads(동시성 간소화), Declarative HTTP Client(외부 API 연동 보일러플레이트 감소), Spring AI Core(`@AiClient` 로 간단한 LLM 호출), API Versioning 네이티브 지원, OpenTelemetry 1st-class Starter

**서버 간 통신:**
- Spring Boot → FastAPI: 내부 HTTP (또는 gRPC/메시지큐)로 비동기 작업 의뢰(Trigger)
- FastAPI → Spring Boot: 작업 완료 콜백 또는 폴링

### 1.2 모듈 구성

- **메인 서버 (Spring Boot) — 모듈러 모놀리스(DDD)**
  - `app-api`: API 진입점, 보안, 예외/응답
  - `store`: 가게/프로필/진단 요청 컨텍스트
  - `ranking`: 키워드/순위/스냅샷
  - `report`: 리포트 생성/저장/조회
  - `integration`: 내순이/크롤러/SNS 등 외부 클라이언트
  - `batch`: 스케줄러/워커(비동기 잡)
  - `billing`: 결제/구독(옵션)
  - `common`: 공통 예외/유틸/상수

- **AI 워커 서버 (Python FastAPI)**
  - `ai-rag`: RAG 검색/생성 (Bedrock KB + LangChain)
  - `data-pipeline`: 공공데이터 수집/정제/집계 (Pandas)

## 2. 주요 도메인 모델(초안)
- `Store`
  - id, name, category, address, placeUrl(옵션), phone(옵션), createdAt
- `StoreProfile`
  - storeId, openingHours(옵션), 대표 이미지/메타(옵션)
- `DiagnosisRequest`
  - id, storeId, status(PENDING/RUNNING/SUCCESS/FAILED/PARTIAL), createdAt, startedAt, finishedAt
- `KeywordSet`
  - id, storeId, 대표/희망 키워드 목록, validationInfo
- `RankingSnapshot`
  - id, diagnosisRequestId, capturedAt
- `RankingItem`
  - snapshotId, keyword, rank, delta(옵션), positionMeta(옵션)
- `DiagnosisReport`
  - id, diagnosisRequestId, summary, createdAt
- `ReportSection`
  - reportId, type(SUMMARY/EVIDENCE/ACTIONS/PRIORITY...), content
- `ReportEvidence`
  - reportId, source(RAG/Ranking/Manual), reference

## 3. API 설계(초안)

### 3.1 진단 플로우
- `POST /v1/diagnosis`
  - 입력: storeInput(또는 storeId), keywordSet
  - 응답: `202 Accepted` + `jobId`
- `GET /v1/diagnosis/{jobId}/status`
  - 응답: status, progress(옵션), lastUpdated
- `GET /v1/diagnosis/{jobId}`
  - 응답: store, keywordSet, rankingSnapshot, report

### 3.2 스토어/키워드
- `POST /v1/stores`
- `GET /v1/stores/{storeId}`
- `POST /v1/stores/{storeId}/keyword-sets`

### 3.3 리포트
- `GET /v1/reports/{reportId}`
- `GET /v1/stores/{storeId}/reports`

## 4. 외부 연동

### 4.1 내순이(순위 수집 서비스)
- 호출 방식: Spring Boot 서버 → 내순이 퍼블릭 REST API (폴링 방식)
- 인증: `apiKey` 쿼리 파라미터
- 예시:
  - `GET http://{nomadscrap-server.ip}/v1/nplace/rank/realtime?apiKey=***&keyword=...&province=...`

### 4.2 RAG (AWS)
- Knowledge Base: Bedrock Knowledge Bases
- Vector Store: OpenSearch Serverless
- 문서 소스: S3
- 호출: Python FastAPI 서버에서 Retrieve / RetrieveAndGenerate (boto3 + LangChain)

### 4.3 공공데이터 API (상권 분석용) — `ai_backend_strategy.md` 반영

#### 활용 가능 공공 API (무료)

| # | API명 | 용도 |
|---|--------|------|
| 1 | **국세청 사업자등록상태조회** | 실시간 휴폐업 여부 → 골목 '폐업률' 산출 |
| 2 | **소상공인 상가(상권)정보 OpenAPI** | 경쟁점(동일 업종) 포화도, 카테고리별 상가 밀집도 |
| 3 | **한국부동산원 상업용부동산 임대동향** | 임대료, 공실률, 투자수익률 동향 |
| 4 | **교통카드이용 합성데이터** | 유동인구 볼륨, 평일/주말 타겟 이탈률 |
| 5 | **최빈교통이용경로데이터** | 고객 출발지 동선, 상권 광역적 흡수력 |
| 6 | **행안부 성/연령별 주민등록 인구수** | 상주인구(배후 수요) 성별/연령별 밀집도 |

#### 민간/지자체 데이터 (유료 또는 제한적)

- **대안 A:** SKT Data Hub(유동인구), NICE/KCB(카드 매출) — 가장 정확, 호출 비용 발생
- **대안 B:** 지자체별 오픈 API (부산 상권 점포이력, 서울열린데이터 등) — 행정구역별 동적 분기
- **대안 C:** 네이버 지도 데이터랩 등 웹 스크래핑 — 합법적 범위 내 Headless 브라우저

## 5. LLM 컨텍스트 데이터 최적화 전략

### 5.1 백엔드 중심 데이터 정제/집계 (Aggregation)

> [!CAUTION]
> LLM에게 원시 JSON 배열을 그대로 주입하면 **컨텍스트 폭발, 비용 급증, 환각** 이 발생합니다.

- **Bad:** `[{"상태":"폐업"}, {"상태":"영업"}, ...]` (수백 개 객체를 LLM에 전달)
- **Good:** 백엔드(Python)에서 집계 후 `{"총_경쟁점": 47, "폐업비율": "41.2%", "주말_이탈률": "82%"}` 고밀도 요약 지표만 전달

### 5.2 MCP / Tool(Function) Calling 아키텍처

1. 프롬프트에 도구(Tool) 목록만 제공 (예: `get_competitor_count(address)`, `get_weekend_population_drop(address, target)`)
2. LLM이 런타임에 해당 도구 호출 요청
3. Python 백엔드가 API를 대신 호출 → 연산 → 수치만 LLM에 반환
4. LLM은 수치를 활용해 최종 분석 텍스트만 생성(Generation)

## 6. 비동기 처리
- 긴 작업(순위 조회 대기/리포트 생성)은 비동기 잡으로 분리
- 상태 전이: `PENDING → RUNNING → SUCCESS/FAILED` (+ `PARTIAL`)
- 중복 방지
  - 작업 키(jobKey) = storeId + keywordSetHash + dateBucket
  - 동일 jobKey 요청은 기존 jobId 반환(아이템포턴시)
- **Structured Concurrency** (JEP 505) 활용
  - 다중 키워드 순위 동시 조회를 하나의 작업 단위로 묶음
  - 하나 실패 시 나머지 자동 취소 → `PARTIAL` 상태 전환
- **Scoped Values** (JEP 506) 활용
  - 요청 ID(Correlation ID)를 Virtual Thread 간 자연스럽게 전파
  - ThreadLocal 대비 메모리 효율적, 불변(immutable)

## 7. 캐시/저장 전략
- 순위 조회 실패 시
  - 최근 `RankingSnapshot` 캐시로 대체
  - `PARTIAL` 상태로 리포트 생성(실패 사유 명시)
- 리포트 재생성 비용 절감
  - 동일 입력 조합은 결과 캐시(RDS) 재사용

## 8. 보안/시크릿
- 내순이 API 키, 크롤링 토큰, Bedrock 자격증명은 환경변수/Secrets Manager로만 관리
- 클라이언트로 내려가지 않게 서버에서만 호출

## 9. 관측성(운영 필수)
- **요청 ID 전파** — Scoped Values (JEP 506) 로 Correlation ID 전체 체인 전파
- 구조화 로그(JSON)
- 에러 트래킹(Sentry 등)
- 메트릭/트레이싱(OpenTelemetry 1st-class Starter)
- **외부 API 복원력** — Built-in Resilience로 retry/circuit breaker 적용 (내순이, 포트원, 카카오 등)
- **테스트** — RestTestClient로 Controller 통합 테스트 간소화

## 10. 프론트엔드 요구사항(초안)
- 랜딩 페이지
  - 외식업 소상공인 대상 가치 제안
  - CTA → 진단 플로우
- 진단 플로우
  - 입력 최소화(플레이스 URL 우선)
  - 진행률/상태 표시
  - 결과 요약 → 리포트 상세
- 접근성
  - 키보드 포커스 표시, 대비 준수, reduced motion

## 11. PDF 기반 확정 필요
- 리포트 템플릿(섹션/톤/출력 형식)
- 데이터 수집 범위(지역/반경/카테고리 규칙)
- 내순이 API 실제 스펙(응답 필드, rate limit, SLA)
- 비용/과금 정책(사용량 기반/구독)
