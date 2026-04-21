# [Spec] 공통 응답/에러 규격(ApiError)

## 0. 메타
- 상태: TODO(할 일)
- 관련 PRD: NFR-4, API 안정성(ddd-architecture 운영 요소)
- 관련 문서:
  - [`../../planning/TECHSPEC.md`](../../planning/TECHSPEC.md)
  - [`../../ddd-architecture.md`](../../ddd-architecture.md)
  - [`../../frontend-architecture.md`](../../frontend-architecture.md)

## 1. 목적
- FE/BE가 공유하는 “에러 형식”을 고정해, 사용자 메시지/재시도/로그 추적(traceId)을 일관되게 만든다.

## 2. 범위
### 2.1 In scope
- 성공 응답 래핑 여부(ResDTO 등)와 스키마
- 에러 응답 스키마(`ApiError`)
- 에러 코드 네이밍 규칙(예: `DIAGNOSIS_TIMEOUT`)
- traceId/requestId 포함 규칙
- FE 표시용 메시지 vs 내부 디버그 메시지 구분

## 3. 제안 스키마(초안)
### 3.1 Success
```json
{
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

### 3.2 Error (ApiError)
```json
{
  "error": {
    "code": "STRING_CODE",
    "message": "USER_SAFE_MESSAGE",
    "detail": "OPTIONAL_DEBUG_MESSAGE",
    "traceId": "TRACE_OR_REQUEST_ID"
  }
}
```

## 4. 에러 코드 체계(초안)
- `AUTH_*`
- `STORE_*`
- `KEYWORD_*`
- `RANKING_*`
- `REPORT_*`
- `DIAGNOSIS_*`
- `COMMON_*`

## 5. 수용 기준(AC)
- [ ] FE에서 에러 처리를 위한 최소 필드(code/message/traceId)가 항상 제공된다.
- [ ] 에러 코드 규칙이 도메인별로 구분된다.

## 6. 오픈 이슈
- [ ] 성공 응답 래핑 여부(현재 백엔드 `ResDTO` 정책과 정합)
