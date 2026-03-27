# Nplace Reply – 어드민 한도 면제 방향 & 리뷰 답글 사용량/한도 부여案

요청사항: (1) 어드민을 멤버십 한도 면제로 전환하는 로직 구상, (2) 리뷰 답글 기능에 사용량을 측정해 한도를 부여할 수 있는지 검토. 아직 코드는 변경하지 않고 계획만 정리했습니다.

## 1) 현재 상태 요약
- 모든 사용자 기능은 멤버십 한도에 따라 제어; 어드민 권한이 있어도 무료/무제한이 되지 않음.
- 리뷰 답글(`/v1/reply`)은 프리미엄 마스터 플랜 전용이며, `UsageLimitPolicy`에서 마스터만 `limit=null`(무제한), 그 외 `0`(미제공)로 정의.
- NplaceReplyServiceApiV1는 사용량 기록/차단 로직이 없고, 플랜 검증만 수행.

## 2) 어드민 한도 면제 설계 옵션
- 공통 목표: 어드민이면 멤버십 한도를 보지 않고 기능을 모두 허용(무제한).
- Option A: 중앙 훅에서 우선 반환  
  - `UsageLimitPolicy.getDailyLimit(...)` 앞단 혹은 별도 헬퍼에서 `if (authority contains ADMIN) return null;`로 처리.  
  - 장점: 모든 서비스가 재사용, 코드 변경 범위 최소.  
  - 단점: 기존 한도 표와 로그가 어드민 기준으로 왜곡될 수 있음(모니터링 시 주의).
- Option B: 어드민을 자동 마스터 플랜으로 매핑  
  - 멤버십 조회 시 어드민이면 가상의 `프리미엄 마스터` MembershipEntity를 리턴.  
  - 장점: 기존 정책 로직/메타 생성 재사용.  
  - 단점: Membership 조회 경로를 모두 만져야 하고, MembershipUsage 리턴 값이 관리자도 노출됨.
- 권장: Option A (공통 헬퍼)로 빠르게 면제 → 필요 시 모니터링용 플래그(“adminBypass=true”)를 메타에 추가해 로그 왜곡 최소화.

### 적용 포인트(예시)
1. `UsageLimitPolicy`에 `isAdminUnlimited(List<UserAuthoritySort>)` 헬퍼 추가.  
2. 각 서비스에서 한도 계산 전에 `if (isAdminUnlimited(authority)) { return allow; }` 패턴 적용.  
3. 리뷰 답글은 현재 플랜 검증을 어드민도 패스시키려면 `validateMasterMembership` 내부에서 어드민 체크를 먼저 통과시키면 됨.

## 3) 리뷰 답글 사용량 측정 + 한도 부여 가능성
- 가능 여부: 가능. `UseLog`와 기존 일간 한도 로직을 재사용하면 됨.
- 권장 기준: **일간 호출 수** 기준으로 `POST /v1/reply` (댓글 ON/OFF 토글)만 카운트. `GET` 상태 조회는 무료, `DELETE`는 보정/초기화 성격으로 미카운트 권장.
- 구현 러프 플랜
  1. `UsageLimitPolicy`에서 `NPLACE_REVIEW_REPLY`의 한도 값을 플랜별로 정의 (예: FREE/실속/성장/마스터 = 0/0/0/무제한 또는 0/5/10/무제한 등 정책 결정 필요).
  2. `NplaceReplyServiceApiV1.changeNplaceReply`에서  
     - 일간 범위 계산(LocalDate today start/end)  
     - `useLogRepository.countByUserEntityAndServiceSortAndCreateDateBetween(..., NPLACE_REVIEW_REPLY, ...)`  
     - 한도 초과 시 AuthenticationException 메시지 표준 사용 (`limitCount + "회 사용횟수를 모두 사용하였습니다."`)  
     - 성공 시 `UseLogEntity` 저장.
  3. 메타 응답 필요 시(선택): `data.meta`에 `used/limit/period=DAILY` 구조를 붙여 UI에서 남은 횟수 표시 가능.
  4. 어드민 면제 적용 시: 위 한도 체크 전에 어드민이면 바로 통과(return).
- 데이터 모델: 기존 `UseLogEntity`/`UseLogRepository` 재사용 가능. 신규 테이블 불필요.
- 주의사항: Pumpingstore 호출이 실패하면 사용량을 차감하지 않도록, 외부 호출 성공 이후에 `UseLog`를 적재하거나 트랜잭션 경계를 명확히 할 것.

## 4) 권장 결정 포인트
- 어드민 면제 여부: 전역 면제(Option A) vs 멤버십 매핑(Option B) 중 선택.
- 리뷰 답글 한도 수치: FREE/실속/성장 플랜에서 허용할지(0 또는 소량), 마스터는 계속 무제한 유지 여부.
- 카운트 대상: POST만 카운트(권장) vs DELETE도 카운트(비권장, 복구/정리 성격).

추가 요구/결정이 나오면 이 문서를 업데이트하겠습니다.***
