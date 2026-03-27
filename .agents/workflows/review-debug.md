---
description: "디버깅" + "리뷰" + 백엔드(Spring Boot + FastAPI)와 프론트엔드(Next.js) 코드를 리뷰하고 디버그하는 표준 검증 워크플로우
---

# 리뷰 & 디버그 워크플로우

백엔드(Spring Boot, FastAPI)와 프론트엔드(Next.js)를 체계적으로 검증하는 절차입니다.
문제점을 발견하면 원인을 분석하고 수정 방안을 제시합니다.

---

## Phase 1: 백엔드 — Spring Boot 검증

### 1.1 빌드 검증

// turbo

```bash
cd /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/backend && ./gradlew build --warning-mode all 2>&1 | tail -80
```

빌드 실패 시:
- 컴파일 에러 로그를 분석하여 원인 파악
- 의존성 충돌, 타입 불일치, 누락된 import 등 확인
- 수정 후 재빌드

### 1.2 테스트 실행

// turbo

```bash
cd /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/backend && ./gradlew test 2>&1 | tail -60
```

테스트 실패 시:
- 실패한 테스트 케이스의 스택트레이스 분석
- `build/reports/tests/test/index.html` 리포트 확인
- 유닛 테스트/통합 테스트 구분하여 원인 파악

### 1.3 정적 분석 및 코드 리뷰

다음 항목을 코드 리뷰합니다:

- [ ] **보안**: Spring Security 설정, JWT 토큰 검증 로직, CORS 설정
- [ ] **DTO 규칙**: Request/Response DTO가 `record`로 선언되었는지
- [ ] **응답 형식**: `ResDTO<T>` 래퍼 패턴 준수 여부
- [ ] **에러 처리**: `@RestControllerAdvice` 글로벌 예외 핸들러 동작 확인
- [ ] **환경변수**: `application.yml`에 시크릿 하드코딩 여부
- [ ] **JPA N+1**: `@EntityGraph` 또는 `fetch join` 활용 여부
- [ ] **NullSafety**: `@Nullable` / `@NonNull` 어노테이션 적용

### 1.4 API 엔드포인트 검증

서버가 실행 중이면 Actuator 헬스체크로 기본 상태 확인:

// turbo

```bash
curl -s http://localhost:8080/actuator/health 2>&1 || echo "서버 미실행"
```

---

## Phase 2: 백엔드 — FastAPI AI 워커 검증

### 2.1 의존성 및 실행 검증

// turbo

```bash
cd /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/ai-worker && \
  ([ -d ".venv" ] && source .venv/bin/activate; python -c "import fastapi; print('FastAPI OK')") 2>&1 || echo "FastAPI 환경 미설정"
```

### 2.2 코드 리뷰

다음 항목을 코드 리뷰합니다:

- [ ] **Pydantic 모델**: v2 스타일 (`BaseModel`, `model_validator`) 사용 여부
- [ ] **라우터 구조**: `app/routers/` 하위 엔드포인트 정의 확인
- [ ] **비동기 처리**: `async def` 활용 적절성
- [ ] **에러 핸들링**: `HTTPException` 적절한 상태 코드 반환
- [ ] **API 키 인증**: 내부 통신용 `AI_WORKER_API_KEY` 검증 미들웨어

---

## Phase 3: 프론트엔드 — Next.js 검증

### 3.1 TypeScript 컴파일 검증

// turbo

```bash
cd /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/frontend_dplog && npx tsc --noEmit 2>&1 | tail -80
```

타입 에러 발생 시:
- 에러 위치와 타입 불일치 원인 분석
- `any` 타입 남용, 누락된 타입 정의, 잘못된 import 확인
- 수정 후 재검증

### 3.2 ESLint 검증

// turbo

```bash
cd /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/frontend_dplog && npm run lint 2>&1 | tail -60
```

### 3.3 빌드 검증

// turbo

```bash
cd /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/frontend_dplog && npm run build 2>&1 | tail -80
```

빌드 실패 시:
- SSR/CSR 경계 관련 에러 (`useClient`, `useServer`) 확인
- Dynamic import 관련 이슈 확인
- 환경변수 누락 여부 점검 (`.env.local`)

### 3.4 FSD 아키텍처 리뷰

다음 항목을 코드 리뷰합니다:

- [ ] **레이어 규칙**: `shared → entities → features → widgets → pages → app` 단방향 의존성
- [ ] **Cross-import 금지**: 같은 레이어 내 모듈 간 직접 import 없는지
- [ ] **Public API**: 각 모듈의 `index.ts` 배럴 파일을 통한 내보내기
- [ ] **컴포넌트 분리**: `model/`, `ui/`, `api/` 슬라이스 구조 준수

### 3.5 UI/UX 리뷰 (브라우저)

서버가 실행 중이면 브라우저로 직접 검증:

1. `http://localhost:3000`에 접속
2. 콘솔 에러/경고 확인
3. 네트워크 탭에서 API 요청 실패 여부 확인
4. 반응형 디자인 확인 (모바일/태블릿/데스크탑)
5. 다크 모드 스타일 깨짐 확인

---

## Phase 4: 프론트-백 통합 검증

### 4.1 API 연동 확인

- [ ] 프론트에서 호출하는 API 엔드포인트가 백엔드에 존재하는지
- [ ] Request/Response 타입이 프론트(TypeScript)와 백엔드(Java record)에서 일치하는지
- [ ] CORS 설정이 프론트엔드 도메인을 허용하는지
- [ ] 인증 헤더(`Authorization: Bearer {jwt}`) 전달이 정상적인지
- [ ] 에러 응답(`ResDTO` code/message) 프론트에서 적절히 처리하는지

### 4.2 환경변수 일관성

// turbo

```bash
echo "=== Backend ===" && \
grep -r 'NEXT_PUBLIC\|API_URL\|BASE_URL' /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/backend/src/main/resources/ 2>/dev/null | head -10 && \
echo "" && \
echo "=== Frontend ===" && \
cat /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/frontend_dplog/.env.local 2>/dev/null | grep -v '#' | head -10
```

---

## Phase 5: 결과 보고

검증 결과를 다음 형식으로 정리합니다:

```markdown
## 검증 결과 요약

| 항목 | 상태 | 비고 |
|------|:----:|------|
| BE 빌드 | ✅/❌ | |
| BE 테스트 | ✅/❌ | |
| BE 코드 리뷰 | ✅/⚠️ | |
| AI 워커 | ✅/❌ | |
| FE 타입체크 | ✅/❌ | |
| FE 린트 | ✅/❌ | |
| FE 빌드 | ✅/❌ | |
| FE 아키텍처 | ✅/⚠️ | |
| 통합 검증 | ✅/❌ | |

### 발견된 이슈
1. ...

### 수정 제안
1. ...
```
