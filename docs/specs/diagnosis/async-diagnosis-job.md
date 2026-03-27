# [Spec] 비동기 진단 잡(jobId) 상세 명세

## 0. 메타
- 상태: TODO(할 일)
- 관련 PRD: FR-J1, FR-J2, FR-J3
- 관련 문서:
  - [`../../planning/PRD.md`](../../planning/PRD.md)
  - [`../../planning/TECHSPEC.md`](../../planning/TECHSPEC.md)
  - [`../../store-diagnosis-flow.md`](../../store-diagnosis-flow.md)

## 1. 목적
- 진단 요청을 `jobId` 기반 비동기 처리로 표준화하고, 프론트/백 모두가 공유할 **상태/진행률/에러/재시도 계약**을 정의한다.

## 2. 범위
### 2.1 In scope
- `POST /v1/diagnosis`의 비동기 응답 계약(202 + jobId)
- `GET /v1/diagnosis/{jobId}/status` 응답 모델(상태/진행률/타임스탬프)
- `GET /v1/diagnosis/{jobId}` 결과 모델(부분 결과 포함)
- 상태 전이: `PENDING → RUNNING → SUCCESS/FAILED` (+ `PARTIAL`)
- 아이템포턴시(jobKey) 정책(중복 요청 처리)
- 재시도 정책(클라이언트/서버)

### 2.2 Out of scope
- 큐/워커 구현 상세(SQS, 배치 런너 구현체) — 백엔드 설계/코드에서 다룸

## 3. 상태 모델
### 3.1 Status enum
- `PENDING`: 작업 대기(큐 적재/스케줄 대기)
- `RUNNING`: 실행 중
- `PARTIAL`: 일부 결과만 생성(외부 API 실패 등)
- `SUCCESS`: 전체 성공
- `FAILED`: 실패(복구 불가 또는 재시도 초과)

### 3.2 Progress(권장)
- `stage`: `STORE|KEYWORDS|RANKING|RAG|REPORT` (예시)
- `percent`: 0~100 (옵션)
- `message`: 사용자에게 보여줄 수 있는 간단 메시지(옵션)

## 4. API 계약(초안)
### 4.1 POST /v1/diagnosis
- 응답: `202 Accepted` + `jobId`
- 아이템포턴시(권장)
  - 요청 헤더 `Idempotency-Key` 또는 서버 계산 `jobKey`
  - 동일 키면 기존 `jobId` 반환(중복 처리 방지)

### 4.2 GET /v1/diagnosis/{jobId}/status
- 반환: `status`, `progress?`, `lastUpdatedAt`, `startedAt?`, `finishedAt?`
- 폴링 권장(프론트): 2s → 5s backoff, 성공/실패 시 중단

### 4.3 GET /v1/diagnosis/{jobId}
- 반환: store, keywordSet, rankingSnapshot?, report?
- `PARTIAL`일 때: 실패 원인/누락 영역을 명시하는 필드 필요(예: `warnings[]`)

## 5. 에러/재시도
- 4xx: 입력/권한 문제 → 사용자 액션 유도(재시도 X)
- 5xx/네트워크: 제한 재시도(백오프)
- 외부 연동 실패(내순이/RAG):
  - `PARTIAL` + warnings 제공 또는 `FAILED` 기준 정의 필요

## 6. 관측성(운영)
- job 생성/상태 전이 이벤트 로그
- `jobId`, `jobKey`, `requestId/traceId` 전파

## 7. 수용 기준(AC)
- [ ] `jobId` 기반 3개 엔드포인트 계약이 명확하다.
- [ ] 상태 전이/부분 결과 기준이 정의되어 있다.
- [ ] 아이템포턴시/중복 처리 정책이 문서화되어 있다.

## 8. 오픈 이슈
- [ ] progress stage/percent를 어디까지 노출할지
- [ ] `PARTIAL` vs `FAILED` 판단 기준(외부 API 실패, 타임아웃)
- [ ] SSE 지원 여부(폴링 기본, SSE 옵션)
