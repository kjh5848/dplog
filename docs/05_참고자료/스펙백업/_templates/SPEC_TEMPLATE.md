# [Spec] 제목

## 0. 메타
- 상태: TODO(할 일) | WIP(진행 중) | DONE(완료)
- 작성일:
- 관련 PRD: (예: `docs/planning/PRD.md`의 FR-*, NFR-*)
- 관련 문서:
  - (예: `docs/store-diagnosis-flow.md`)
  - (예: `docs/planning/TECHSPEC.md`)
- 담당:

## 1. 목적
- 무엇을 해결/정의하는 문서인지 3줄 이내

## 2. 범위
### 2.1 In scope
- 

### 2.2 Out of scope
- 

## 3. 용어/정의
- 

## 4. 사용자 시나리오
- Happy path:
- 실패/예외:
- 재시도/복구:

## 5. UX / 화면(해당 시)
- 라우트:
- 화면 구성:
- 상태(UI):
  - loading / empty / error / success
- 접근성:

## 6. API 계약
> “UI에서 fetch 금지” 원칙: 여기서는 **계약**만 정의합니다.

### 6.1 Endpoint
- Method + Path:
- Auth:
- Idempotency:
- Timeout:
- Rate limit:

### 6.2 Request
```json
{}
```

### 6.3 Response (Success)
```json
{}
```

### 6.4 Response (Error)
- 에러 코드 표
- 예: `ApiError` 스키마 링크

## 7. 데이터/상태 모델
- 엔티티/필드 정의
- 상태 전이(필요 시)

## 8. 규칙/정책
- validation
- 보안/권한
- 캐시/부분 결과(해당 시)

## 9. 관측성(운영)
- 로그(필드)
- 이벤트/메트릭(예: 진단 요청 수, 성공률, 평균 소요 시간)
- traceId/requestId 전파

## 10. 수용 기준(AC)
- [ ] 
- [ ] 

## 11. 엣지 케이스
- 

## 12. 오픈 이슈 / 결정 필요(ADR)
- [ ] 

## 13. 테스트(최소)
- 유닛:
- 통합:
- E2E:
