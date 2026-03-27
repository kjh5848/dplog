## 코드 작업 시

- 백엔드 스프링부트의 경우 루트 폴더를 프로젝트로 열어서 작업하면 됩니다

- 프론트엔드 리액트의 경우 src의 frontend폴더를 프로젝트로 열어서 작업하면 됩니다

- 스프링부트 빌드 시 자동으로 리액트도 빌드되서 처리된 후 탑재 됩니다

## PortOne 예약 전환 메모

- `SubscriptionEntity.subscriptionId`는 PortOne 결제 예약의 `scheduleId`와 동일하게 관리하며, 예약 조회/삭제 시 `GET/DELETE /payment-schedules/{scheduleId}` 엔드포인트를 직접 사용합니다.
- 구독 해지·예약 재생성 로직에서는 scheduleId를 포트원 로그 및 운영 알림에 함께 남겨 추적성을 높입니다.
