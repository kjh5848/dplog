# 프런트엔드 operationId 멱등 처리 계획 (2025-12-04)

> 백엔드 구독 상태 머신/멱등 설계(이벤트 전환, `eventId = <event-type>-<subscriptionId>-<operationId>` 규칙)에 맞춰, 프런트에서 사용자 주도 요청마다 `operationId`를 생성·전파해 동일 요청 재시도 시 중복 실행을 막는다.

## 1) 대상 플로우 (프런트 → App Route)
- 구독 해지: `DELETE /api/subscriptions/[subscriptionId]/cancel`
- 해지 예약 취소(되돌리기): `POST /api/subscriptions/[subscriptionId]/cancel/undo`
- 다운그레이드 예약: `POST /api/subscriptions/[subscriptionId]/downgrade`
- 다운그레이드 예약 취소: `POST /api/subscriptions/[subscriptionId]/downgrade/cancel`
- 업그레이드/연→월 상향: `POST /api/payments/upgrade`
- 빌링키 삭제(예정): `DELETE /api/payments/billing-key` 또는 `/api/subscriptions/[subscriptionId]/billing-key` 추가 시 적용
- 제외: 결제/웹훅/스케줄러는 `paymentId`/`scheduleId` 기반 멱등이 이미 존재하므로 operationId 불필요.

## 2) operationId 생성 규칙 & 수명
- 포맷: `op-<userId>-<timestamp>-<uuid4>` (`userId` 미노출 시 `anon` 대체). 모달/CTA 최초 클릭 시 1회 생성.
- 동일 세션 내 재시도/재호출 시 **같은 operationId 재사용**: `useRef` 보관 + `sessionStorage`(`operation:<userId>:<subscriptionId>:<action>`)로 새로고침 대비.
- 성공/실패(최종 오류 코드 수신) 시 캐시 삭제. 사용자가 CTA 취소/모달 닫기 시에는 새 시도마다 재생성.
- App Route 요청에 `Idempotency-Key` 헤더 = `operationId` 설정 + 요청 Body에 `operationId` 포함하여 서버 상태 머신에서 멱등 키로 활용.

## 3) 타입/계약 변경 (프런트)
- `src/types/payment.ts`
  - `SubscriptionCancelRequest`, `SubscriptionDowngradeRequest`, `SubscriptionDowngradeCancelResponse?` → `operationId: string` 필수 필드 추가.
  - `SubscriptionUpgradeRequest`에 `operationId` 추가(결제/차액 결제 멱등).
  - 추후 빌링키 삭제 요청 DTO(`BillingKeyDeleteRequest`, 가칭) 정의 시 `operationId` 포함.
- `src/model/PaymentRepository.ts`
  - 위 요청 DTO를 serialize 시 `operationId` 포함 + `Idempotency-Key` 헤더 주입. 로그에 `operationId` 함께 남기기.
- `src/app/api/...` Route Handlers
  - `cancel`, `cancel/undo`, `downgrade`, `downgrade/cancel`, `payments/upgrade`에서 `operationId` 파싱 후 `SubscriptionServiceApiV1`/`PaymentServiceApiV1` 호출 파라미터/헤더로 전달.
  - 멱등 실패(중복 요청) 시 백엔드 메시지를 그대로 반환하고, 프런트에서 동일 `operationId` 유지한 채 재시도 유도.

## 4) UI 적용 상세 (핵심 파일 기준)
- `src/app/(home)/payment/PaymentClientPage.tsx`
  - 해지/되돌리기/다운·업그레이드 CTA 핸들러 내 `const opId = ensureOperationId(actionKey)` 유틸 호출 → fetch payload/headers에 주입.
  - 오류 토스트에 `operationId` 포함해 로깅/CS 추적 가능하도록 `logError` metadata에 추가.
  - 업그레이드 실패 후 재시도 시 동일 `operationId`를 유지하도록 `useRef`로 보관하고, 성공 시 `sessionStorage`에서 제거.
- `src/model/PriceRepository.ts` 혹은 멤버십 카드 액션 생성부
  - 액션 키(`cancel`, `cancel_undo`, `downgrade`, `upgrade`) 별로 `operationId` 캐시 key 생성 로직 삽입.
  - 모달 닫힘/다른 플랜 선택 시 캐시 초기화 여부를 분기(실행 완료 전 플로우 전환 시만 삭제).
- 추후 빌링키 삭제 UI 추가 시 동일 패턴을 재사용하여 `operationId`를 생성/전파.

## 5) 이벤트/멱등 키 매핑 가이드
| 사용자 액션 | 프런트 operationId | 서버 eventId 예시 | 비고 |
| --- | --- | --- | --- |
| 구독 해지 | `op-<uid>-<ts>-<uuid>` | `cancel-<subId>-<operationId>` | 해지 예약/즉시 해지 모두 동일 규칙 |
| 해지 되돌리기 | 동일 | `cancel-undo-<subId>-<operationId>` | 예약 취소용 |
| 다운그레이드 예약 | 동일 | `downgrade-<subId>-<operationId>` | 예약/취소 모두 operationId 필요 |
| 업그레이드 | 동일 | `upgrade-<subId>-<operationId>` | 결제/차액 결제 멱등 |
| 빌링키 삭제 | 동일 | `billingkey-delete-<subId>-<operationId>` | App Route 추가 시 적용 |

## 6) 에러/재시도 UX
- 중복 실행 에러(`409` 등) 수신 시 “이미 처리된 요청입니다” 메시지 노출, 동일 `operationId` 유지한 채 상태만 갱신(refresh).
- 네트워크 오류 재시도 시 기존 `operationId` 재사용. 사용자 강제 새 시도(모달 재열기) 시에도 캐시에 남아 있으면 그대로 전송.
- 세션 만료/로그아웃 발생 시 캐시 초기화 후 로그인 후 새 `operationId` 발급.

## 7) 리팩터링 수행 단계 (이번 스코프: 테스트/QA 제외)
1. **공통 계약/유틸 추가**: `ensureOperationId`/`persistOperationId` 유틸 작성, `Idempotency-Key` 헤더 주입 규약 명시.
2. **타입/Repository 반영**: `operationId` 필드 추가(`payment.ts` DTO) 후 `PaymentRepository`/`Subscription*` Repository 요청 헤더·Body에 반영.
3. **App Route 연동**: `cancel`, `cancel/undo`, `downgrade`, `downgrade/cancel`, `payments/upgrade` Route Handler에서 `operationId` 파싱 후 서비스 호출로 전달.
4. **UI 핸들러 적용**: `PaymentClientPage.tsx` 등 CTA별 핸들러에 `ensureOperationId(actionKey)` 호출, 요청·로깅에 포함. 모달 전환 시 캐시 초기화 규칙 적용.
5. **문서 반영**: 백엔드 상태 머신 이벤트 ID 규칙과 매핑된 `operationId` 사용 규약을 개발자 노트/README에 링크.
6. **QA/테스트**: 이번 스코프에서 실행 생략. 이후 별도 티켓으로 Playwright/UT 추가 예정.

## 9) 현재 적용 현황 (2025-12-04)
- **공통 유틸**: `src/utils/operationId.ts`에서 세션스토리지+메모리 fallback 기반 생성/저장/삭제 유틸 추가, `src/utils/index.ts`로 export.
- **타입/레포지토리**: `src/types/payment.ts` DTO에 `operationId` 필드 추가, `src/model/PaymentRepository.ts` 업그레이드 요청 시 Body+`Idempotency-Key` 헤더 포함.
- **UI 핸들러**: `src/viewModel/price/usePriceViewModel.ts`(해지/다운/되돌리기), `src/app/(home)/payment/PaymentClientPage.tsx`(업그레이드)에서 `ensureOperationId` 호출 후 요청/로깅에 포함하고 응답 후 `clearOperationId`.
- **서버(App Route/Service)**: `src/lib/services/subscriptionService.ts`, `src/lib/services/paymentService.ts` 및 대응 Route(`cancel`, `cancel/undo`, `downgrade`, `downgrade/cancel`, `payments/upgrade`)에서 `operationId` 파싱 후 Body와 `Idempotency-Key` 헤더로 백엔드에 전달.
- **테스트**: 요청에 따라 실행/추가하지 않음. 이후 별도 QA/Playwright/UT 티켓 필요.

## 10) 타임존·청구 시각 연동 프런트 리팩터링 계획
### 배경
- 백엔드가 `nextBillingAt(OffsetDateTime)`/`user.timezone`/`billingTime`을 도입하고, `SubscriptionRequest`에 `timezone`(IANA)·`billingTime`(HH:mm)·옵션 `scheduleAt`(OffsetDateTime)을 추가함. 잘못된 값은 기본값(Asia/Seoul 09:00)으로 폴백.

### 프런트 영향 범위
- **요청 DTO/타입**: `SubscriptionRequest`/`BillingReservationRequest`/`PaymentPreRegisterRequest` 등 구독/결제 시작 경로에 `timezone`/`billingTime`/`scheduleAt?` 필드 추가.
- **레포지토리**: `PaymentRepository.preRegisterPayment`, `/api/payments/subscribe` 호출부, `PaymentClientPage` 최초 구독 흐름에 신규 필드 전송.
- **사용자 설정**: 프로필/설정 화면에 IANA 타임존, 선호 청구 시각(HH:mm) 저장 UI 추가 후 전역 스토어/쿼리에서 노출.
- **기본값**: 값이 없으면 브라우저 `Intl.DateTimeFormat().resolvedOptions().timeZone` + 추천 시각(예: 09:00)으로 채워 서버에 전달. 서버 폴백과 동일하도록 문구/주석 정리.

### 리팩터링 단계
1. **타입/계약 반영**: `src/types/payment.ts`에 `timezone?: string`, `billingTime?: string`, `scheduleAt?: string` 필드 추가(관련 Request/Response에 전파). App Route 핸들러에서 Body 파싱/검증 추가.
2. **레포지토리/서비스 수정**: `PaymentRepository`와 `paymentService`(`pre-register`, `subscribe`)가 헤더 그대로 두고 Body에 신규 필드 전달. `Idempotency-Key` 로직과 병치.
3. **UI 데이터 소스**: 사용자 설정에서 타임존/청구 시각을 불러오거나, 미설정 시 브라우저 타임존 + 기본 시각을 계산하는 헬퍼 추가(`getClientTimezone`, `getDefaultBillingTime`).
4. **요청 주입**: `PaymentClientPage`의 결제/예약 요청에 `timezone`/`billingTime`을 주입하고, 사용자가 시각을 직접 선택한 경우 `scheduleAt`(ISO Offset)으로 덮어쓰기.
5. **표시/안내**: 결제 확인 모달과 성공 토스트에 “청구 시각: {localTime} ({timezone})” 노출, 잘못된 입력 시 기본값 적용 안내를 포함.
6. **QA(후속)**: 다른 티켓에서 타임존 값 누락/오류 시 기본값 적용, 청구 시각 표시 로직을 Playwright로 검증.

### 현재 진행 상황 (프런트)
- DTO/서비스/Route: `payment.ts` 요청 필드에 `timezone`/`billingTime`/`scheduleAt` 옵션 추가, `paymentService.preRegister`가 그대로 백엔드에 전달.
- UI/요청: `PaymentClientPage` 사전결제 요청에 브라우저 타임존(`Intl`)과 기본 청구 시각(`09:00`)을 포함.
- 유틸: `src/utils/browser/timezone.ts` 추가로 기본 타임존/시각 헬퍼 제공.
