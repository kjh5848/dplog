# Nplace Reply – 마스터 전용 접근/로그 노출 계획

NplaceReplyControllerApiV1 요청에 대한 접근권한과 사용량 정책, 마스터 사용자를 위한 상태/로그 노출 방향을 정리했습니다.

## 1) 접근 제어
- 대상: `GET/POST/DELETE /v1/reply` 모두.
- 조건: 활성화된 멤버십이 `프리미엄 마스터`일 때만 통과 (`UsageLimitPolicy.getDailyLimit(ServiceSort.NPLACE_REVIEW_REPLY)`이 `null` → 무제한).
- 실패 시: `AuthenticationException("리뷰 답글 기능은 프리미엄 마스터 플랜에서만 사용할 수 있습니다.")` 반환.
- 구현 위치: `NplaceReplyServiceApiV1.validateMasterMembership` (membership 조회 → limitCount ≤ 0이면 차단).

## 2) 사용량 체크(무제한) 판단
- 정책: `UsageLimitPolicy`에서 `NPLACE_REVIEW_REPLY`는 마스터 플랜만 `limit=null`(무제한), 나머지 플랜은 `0`(미제공).
- 처리: 사용량 카운트/UseLog 적재를 하지 않음. 플랜 자체가 무제한이고, 일단 마스터 여부만 확인하면 되므로 추가 예외 처리 불필요.
- 추후 필요 시: 모니터링 용도로만 UseLog 적재를 붙일 수 있으나, 한도 차단 로직은 그대로 유지.

## 3) 마스터 전용 상태/로그 노출 방향
- **상태 조회**: 기존 `GET /v1/reply` 응답(`ResNplaceReplyListDTOApiV1`)은 마스터 검증을 통과한 사용자에게 그대로 제공 → 현재 활성화 여부 확인 가능.
- **로그 노출(제안)**: `NplaceReplyLogEntity`가 이미 쌓이고 있으므로, 마스터에게만 아래 옵션 중 선택:
  - `GET /v1/reply/logs?placeId=...&limit=50` (최신 순, optional placeId 필터)
  - 응답 필드 예시: `placeId`, `beforeActive`, `afterActive`, `changedByUserId`, `changedAt`
  - 접근 제어: 동일한 `validateMasterMembership` 재사용.
- **UI 가이드**: 마스터 계정은 댓글 ON/OFF 토글과 함께 “최근 변경 로그” 패널을 노출, 일반 플랜은 진입 자체가 차단되므로 안내 메시지로 대체.

## 4) QA 체크리스트
- [ ] 비마스터 계정으로 `/v1/reply` GET/POST/DELETE 호출 시 예외 메시지 확인.
- [ ] 마스터 계정으로 정상 조회/토글/삭제 동작 확인 (네이버 계정/세션 필요).
- [ ] (선택) 로그 API 추가 시, 마스터만 접근 가능 여부 및 최신순 정렬 확인.

추가 요구사항이 생기면 항목을 이어서 적어주세요. 마스터 외 플랜에 대한 한도/예외 메시지는 `UsageLimitPolicy` 표준을 그대로 따릅니다.
