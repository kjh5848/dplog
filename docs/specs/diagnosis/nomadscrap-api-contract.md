# [Spec] 내순이(순위) 연동 API 계약

## 0. 메타
- 상태: TODO(할 일)
- 관련 PRD: FR-R1, FR-R2, FR-R3
- 관련 문서:
  - [`../../planning/PRD.md`](../../planning/PRD.md)
  - [`../../planning/TECHSPEC.md`](../../planning/TECHSPEC.md)
  - [`../../store-diagnosis-flow.md`](../../store-diagnosis-flow.md)

## 1. 목적
- 내순이(순위 수집 서비스) 호출의 **요청/응답 스키마**, 실패/타임아웃 정책, 저장 규칙을 명시하여 연동 품질을 보장한다.

## 2. 범위
### 2.1 In scope
- 엔드포인트/파라미터(예: keyword, province, apiKey)
- 응답 필드(순위, 변동, 노출 위치 등) 정의
- 타임아웃/재시도/레이트리밋/캐시 정책
- 저장 모델 매핑(`RankingSnapshot`, `RankingItem`)

### 2.2 Out of scope
- 내순이 내부 구현/수집 로직

## 3. API 계약(초안)
> 현재 문서 예시:  
> `GET http://{nomadscrap-server.ip}/v1/nplace/rank/realtime?apiKey=***&keyword=...&province=...`

### 3.1 Endpoint
- Method: `GET`
- Path: `/v1/nplace/rank/realtime`
- Auth: `apiKey` query parameter (서버 간 통신 전용)
- Timeout: (확정 필요)
- Rate limit/SLA: (확정 필요)

### 3.2 Query Params
- `apiKey`: string (required)
- `keyword`: string (required)
- `province`: string (required?) — 지역 모델 확정 필요
- 기타: (응답 스펙 확인 후 확정)

### 3.3 Response (TODO)
- 실제 응답 예시(JSON) 확보 후 스키마 확정

## 4. 실패/대체 전략
- 타임아웃/5xx:
  - (권장) 제한 재시도 + 실패 시 최근 스냅샷 캐시 또는 `PARTIAL`
- 4xx:
  - 잘못된 파라미터/인증 → 즉시 실패

## 5. 수용 기준(AC)
- [ ] 내순이 “실제 응답” 기반 스키마가 문서화되어 있다.
- [ ] 실패 시 대체/부분 결과 기준이 정의되어 있다.

## 6. 오픈 이슈
- [ ] 내순이 API의 공식 문서/스펙/레이트리밋 확보
- [ ] 지역 모델(province/district/반경 등) 확정
