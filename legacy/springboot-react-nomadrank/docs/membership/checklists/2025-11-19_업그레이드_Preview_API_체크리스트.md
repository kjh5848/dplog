# 업그레이드 Preview API 체크리스트 (우선순위 6)

- 7-3 Step-by-Step 체크리스트를 기반으로 하며 다음을 추가로 확인한다.
  1. [ ] `/v1/subscription/upgrade` + `preview` 또는 `/v1/subscription/upgrade/quote` 옵션 중 최종 결정.
  2. [ ] preview 응답에서 `paymentRequested=false`, `refundPaymentId=null`이 항상 보장되는지 테스트.
  3. [ ] 프런트 모달과의 계약 테스트(모든 업그레이드 유형에서 차액/환불 값 비교) 수행.
