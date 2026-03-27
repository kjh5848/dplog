---
description: "백엔드 구현" D-PLOG 백엔드 (Spring Boot 4.0 + Python FastAPI) 투트랙 아키텍처 기반 기능 구현 가이드
---

# 백엔드 기능 구현 워크플로우

이 워크플로우는 D-PLOG 백엔드에 새로운 기능을 추가할 때 사용하는 표준 절차입니다.
투트랙 아키텍처(Spring Boot 메인 + Python FastAPI AI 워커)를 기반으로 합니다.

> 참조: `docs/planning/TECHSPEC.md`, `docs/planning/ai_backend_strategy.md`, `docs/planning/ROADMAP.md`

## 0. 로드맵 및 상태 점검 (사전 필수 단계)

가장 먼저 `docs/planning/ROADMAP.md`, `docs/planning/ROADMAP_BACKEND.md` 그리고 `docs/planning/roadmap_status.json`을 `view_file` 도구로 확인하십시오.
사용자가 요청한 기능 구현 프롬프트가 현재 로드맵 진행 상황과 일치하는지 판단합니다.
- 요구사항 중 **새로 추가된 것**이나 **로드맵에서 누락된 부분**이 있다면, 분석 결과를 정리하고 `notify_user`를 통해 사용자에게 컨펌을 받으십시오.
- 불일치 사항이 없거나 사용자의 승인이 떨어진 경우에만 다음 단계의 구현 프롬프트를 실행합니다.

## 1. 기능이 어디에 속하는지 판단

```
기능이 AI/RAG/공공데이터 연산인가?
├─ YES → Python FastAPI (ai-worker)
└─ NO → Spring Boot (메인 서버)
         ├─ 어떤 모듈에 해당하는가?
         │   ├─ 인증/보안      → auth (Spring Security 7 + JWT + 카카오 OIDC)
         │   ├─ 가게/프로필    → store
         │   ├─ 키워드/순위    → ranking
         │   ├─ 리포트         → report
         │   ├─ 결제/구독      → billing
         │   ├─ 외부 API 호출  → integration
         │   └─ 공통           → common
         └─ 비동기 잡인가?
             ├─ YES → batch 모듈 + Virtual Threads
             └─ NO  → 해당 모듈 내 동기 처리
```

## 2. Spring Boot 메인 서버 구현 절차

### 2.1 기술 스택 확인
- Spring Boot 4.0, Java 25, Gradle 9
- Spring Security 7 + JWT (Nimbus JOSE+JWT)
- Spring Data JPA + MySQL (dev: H2)
- Declarative HTTP Client (외부 API 연동)
- Virtual Threads (기본 활성화)
- OpenTelemetry Starter (관측성)
- JSpecify Null Safety (`@Nullable`, `@NonNull` 컴파일 타임 검증)
- Built-in Resilience (외부 API retry/circuit breaker — 별도 라이브러리 불필요)
- Scoped Values (JEP 506 — Virtual Threads 환경 요청 컨텍스트 전파)
- Structured Concurrency (JEP 505 — 다중 비동기 작업 단위 관리)
- RestTestClient (REST API 통합 테스트 전용)
- Jackson 3.0 (JSON 직렬화)
- Project Leyden (AOT 캐시, 프로덕션 콜드 스타트 단축 — 선택)

### 2.2 구현 순서

// turbo-all

1. **도메인 모델 (Entity) 생성**
   - `src/main/java/kr/co/nomadlab/dplog/{module}/domain/` 하위에 JPA Entity 생성
   - TECHSPEC §2 도메인 모델 참고

2. **Repository 생성**
   - `src/main/java/kr/co/nomadlab/dplog/{module}/repository/`
   - Spring Data JPA Repository 인터페이스

3. **Service 구현**
   - `src/main/java/kr/co/nomadlab/dplog/{module}/service/`
   - 비즈니스 로직 캡슐화
   - 트랜잭션 경계 설정 (`@Transactional`)

4. **DTO 정의 (Java record 필수)**
   - `src/main/java/kr/co/nomadlab/dplog/{module}/dto/`
   - Request/Response DTO는 반드시 `record`로 생성
   - 레거시 `ResDTO<T>` 응답 래퍼 패턴 유지
   ```java
   // DTO 예시 — 반드시 record 사용
   public record StoreCreateRequest(
       @NotBlank String placeName,
       @NotBlank String placeUrl,
       @NotBlank String category
   ) {}

   public record StoreResponse(
       Long id,
       String placeName,
       String placeUrl,
       LocalDateTime createdAt
   ) {}
   ```

5. **Controller 생성**
   - `src/main/java/kr/co/nomadlab/dplog/{module}/controller/`
   - RESTful API Versioning: `@RequestMapping("/v1/...")`
   - 비동기 잡은 `202 Accepted` + `jobId` 반환

6. **Flyway 마이그레이션 작성**
   - `src/main/resources/db/migration/V{n}__{description}.sql`

7. **테스트 작성**
   - `src/test/java/kr/co/nomadlab/dplog/{module}/`
   - 단위 테스트 (Service) + 통합 테스트 (Controller)

### 2.3 외부 API 연동 시 (integration 모듈)

```java
// Declarative HTTP Client 사용 예시 (Spring Boot 4.0)
@HttpExchange(url = "${nomadscrap.base-url}")
public interface NomadscrapClient {
    @GetExchange("/v1/nplace/rank/realtime")
    RankResponse getRealTimeRank(
        @RequestParam String apiKey,
        @RequestParam String keyword,
        @RequestParam String province
    );
}
```

### 2.4 비동기 잡 처리 시

- 상태 전이: `PENDING → RUNNING → SUCCESS/FAILED/PARTIAL`
- 중복 방지: `jobKey = storeId + keywordSetHash + dateBucket`
- Virtual Threads 기반으로 처리 (별도 스레드풀 불필요)
- **Structured Concurrency** 로 다중 키워드 동시 조회를 하나의 작업 단위로 묶기
- **Scoped Values** 로 요청 ID(Correlation ID)를 Virtual Thread 간 전파

## 3. Python FastAPI AI 워커 구현 절차

### 3.1 기술 스택 확인
- Python 3.12+, FastAPI, Uvicorn
- boto3 (AWS Bedrock), LangChain
- Pandas (공공데이터 집계)
- Pydantic v2 (데이터 모델)

### 3.2 구현 순서

1. **Pydantic 모델 정의**
   - `ai_worker/models/{domain}.py`
   - Request/Response 스키마

2. **서비스 로직 구현**
   - `ai_worker/services/{domain}_service.py`
   - 공공데이터 수집 → 정제/집계 → RAG 생성

3. **라우터 생성**
   - `ai_worker/routers/{domain}_router.py`
   - `POST /ai/v1/generate-report` 등

4. **LLM 컨텍스트 최적화 (필수)**
   - ❌ 원시 JSON 배열을 그대로 LLM에 전달하지 않을 것
   - ✅ 백엔드(Pandas)에서 집계 후 고밀도 요약 지표만 전달
   - Tool/Function Calling 구조 활용

### 3.3 Spring Boot ↔ FastAPI 통신

- Spring Boot가 Declarative HTTP Client로 FastAPI 호출
- 인증: 내부 API 키 (`AI_WORKER_API_KEY`)
- 비동기 작업: Spring Boot에서 트리거 → FastAPI에서 처리 → 콜백 또는 폴링

## 4. 환경변수 체크리스트

새 기능 추가 시 환경변수가 필요하면 다음을 확인:

- [ ] `application.yml`에 `${ENV_VAR:default}` 형태로 추가
- [ ] `@ConfigurationProperties` 바인딩 클래스 생성/업데이트
- [ ] `.env.example` 또는 문서에 설명 추가
- [ ] 시크릿(API 키, 비밀번호)은 절대 코드에 하드코딩하지 않을 것

## 5. API 설계 컨벤션

| 규칙 | 설명 |
|------|------|
| 경로 | `/v1/{resource}` (복수형 소문자) |
| 생성 | `POST /v1/{resource}` → `201 Created` |
| 조회 | `GET /v1/{resource}/{id}` → `200 OK` |
| 수정 | `PUT /v1/{resource}/{id}` → `200 OK` |
| 삭제 | `DELETE /v1/{resource}/{id}` → `204 No Content` |
| 비동기 | `POST /v1/{resource}` → `202 Accepted` + jobId |
| 응답 래퍼 | `ResDTO<T>` (`code`, `message`, `data`) |
| 인증 | `Authorization: Bearer {jwt}` |
| 에러 | `code != 0` + 의미 있는 `message` |

## 6. 검증 (Verification)

- [ ] 로컬 빌드 성공 (`./gradlew build` 또는 `uvicorn`)
- [ ] API 테스트 (curl/httpie/Postman)
- [ ] 단위 테스트 통과
- [ ] DB 마이그레이션 정상 적용
- [ ] 환경변수 누락 없는지 확인
