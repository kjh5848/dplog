# Repository Guidelines

## Project Structure & Module Organization
- Backend (Spring Boot): `src/main/java`, root package `kr.co.nomadlab.nomadrank`.
- Resources: `src/main/resources` (profiles: `application.yml`, `application-dev.yml`, `application-prod.yml`; static assets; SQL seeds).
- Tests: `src/test/java` mirroring backend packages.
- Dev SSL: repository root contains `cert.pem` and `key.pem` used by the dev profile.

## Build, Test, and Development Commands
- `./gradlew bootRun` — run the API locally (dev profile). Default dev HTTPS: `https://localhost:8443`.
- `PORT=8081 SSL_ENABLED=false ./gradlew bootRun` — run on HTTP 8081 (no TLS).
- `./gradlew test` — execute unit/integration tests.
- `./gradlew build` — build the application jar.

## Coding Style & Naming Conventions
- Java 17, Spring Boot 3; 4-space indentation.
- Naming: classes PascalCase; methods/fields lowerCamelCase; packages by feature (e.g., `...controller`, `...service`, `...dto`, `...repository`).
- Suffix patterns: `...ControllerApiV1`, `...ServiceApiV1`, DTOs end with `DTO`.
- Prefer Lombok for boilerplate; avoid one-letter variables; keep methods cohesive and small.

## Testing Guidelines
- Frameworks: JUnit 5 (`spring-boot-starter-test`), `spring-security-test`.
- Place tests under `src/test/java` matching package paths; name tests `ClassNameTests`.
- Mock external integrations (e.g., WebClient calls) and keep tests deterministic.
- Run `./gradlew test` before submitting changes.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject (≤72 chars) with optional body for context.
- PRs: clear description, linked issues, reproduction steps, and note any config/env changes.
- Keep scope focused; avoid unrelated refactors; update docs/config when behavior changes.

## Security & Configuration Tips
- Profiles: use `application-dev.yml` for local, `application-prod.yml` for production; pass secrets via environment variables.
- CORS is configured in `SecurityConfig`; update allowed origins when client origins change.
- Dev HTTPS uses `cert.pem`/`key.pem`; trust locally or accept browser warnings.
- Validate session/cookie changes with browser DevTools (cookies and request headers).

## 서비스 계층 운영 원칙
- 서비스는 다른 서비스 구현체를 직접 참조하지 않는다. (컨트롤러 → 서비스 → 레포지토리/클라이언트 구조 유지)
- 여러 도메인 로직을 합치는 경우에도 Orchestrator 형태 대신 단일 서비스에서 필요한 의존성만 주입해서 사용한다.
- 모든 DB 변경 작업은 단일 트랜잭션 안에서 처리한다. (필요 시 `@Transactional` 전파 옵션으로 세부 조정)
- 외부 API 연동(PortOne, Nomadscrap 등)은 각 도메인 전용 클라이언트/레포지토리를 통해 수행하고, 서비스는 결과만 해석한다.

## 결제/구독 리팩토링 정리
- `PaymentServiceApiV1`가 결제/빌링키/보상 로직의 단일 서비스 진입점이다.
  - 기존 `PaymentService`, `BillingKeyService`, `PaymentCompensationService` 기능을 통합했다.
  - PortOne API 호출은 `domain/payment/client/PortOneV2Client`에서 담당.
  - 카드/빌링키 마스킹 등 공통 로직은 `util/PaymentUtils`로 분리.
- 컨트롤러(`PaymentControllerApiV1`)는 `PaymentServiceApiV1`만 의존하도록 정리했다.
- 테스트에서는 외부 연동(PortOne, Nomadscrap, Kakao OAuth)을 `@MockBean`이나 테스트 전용 구성으로 대체해 컨텍스트 로딩 실패를 방지한다.
