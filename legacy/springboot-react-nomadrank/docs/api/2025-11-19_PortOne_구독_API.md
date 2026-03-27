# PortOne 구독 결제 백엔드 API

> **Version**: 2025-10-13  
> **Maintainer**: payment squad  
> **Base Path**: `/v1/payments`  
> 모든 응답은 `ResDTO<T>` 래퍼(`code`, `message`, `data`) 형태로 반환됩니다.

## 인증 및 공통 규약

- **세션 기반 인증**: `JSESSIONID` 쿠키에 `authInfo` 세션 값이 존재해야 합니다.  
- **헤더**: `Content-Type: application/json`, `Accept: application/json`.  
- **타임존**: 시간 관련 필드는 ISO-8601(+09:00) 문자열을 사용합니다.  
- **에러 규칙**: 유효성/비즈니스 오류는 `code != 200` 과 함께 의미 있는 메시지를 제공합니다.

---

## 1. 결제 사전등록

빌링키 발급 및 최초 결제에 앞서 PortOne에 결제 정보를 준비시킵니다.

```
POST /v1/payments/pre-register
```

### Request Body (`PaymentPreRegisterRequest`)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `membershipLevel` | Integer | ✅ | 가입하려는 멤버십 레벨 |
| `paymentMethod` | String | ✅ | 결제 수단 (현재 `CARD` 사용) |
| `couponId` | Long |  | 적용할 쿠폰 ID |
| `expectedAmount` | Long | ✅ | 프런트에서 계산한 결제 금액 (검증용) |
| `currency` | String |  | 기본값 `KRW` |
| `billingCycle` | Enum | ✅ | `MONTHLY` 또는 `YEARLY` |

### Response (`ResDTO<PaymentPreRegisterResponse>`)

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "paymentId": "mbsp-1-1697196789123-ef2c...",
    "merchantUid": "nomadrank-1-1697196789123-63b0...",
    "totalAmount": 9900,
    "currency": "KRW",
    "status": "PREPARED",
    "preparedAt": "2025-10-13T08:30:12+09:00",
    "billingCycle": "MONTHLY",
    "rawResponse": "{...}"
  }
}
```

> `paymentId` 는 이후 빌링키 발급 완료 콜백 시 반드시 사용됩니다.

---

## 2. 빌링키 발급 완료 처리

PortOne 웹컴포넌트에서 빌링키 발급이 성공한 후 호출하여 내부 DB에 빌링키를 저장하고 첫 결제를 진행합니다.

```
POST /v1/payments/billing-key/complete
```

### Request Body (`BillingKeyCompleteRequest`)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `paymentId` | String | ✅ | 사전등록 시 발급받은 결제 ID |
| `billingKey` | String | ✅ | PortOne에서 전달된 빌링키 값 |
| `issueId` | String | ✅ | PortOne 빌링키 발급 ID |
| `issueResponse` | Object |  | PortOne `POST /billing-keys` 응답 전문 (예시 참조) |
| `customerId` / `customerEmail` / `customerName` / `customerPhone` | String | ✅ | 고객 정보 |

### Response (`ResDTO<SubscriptionResponse>`)

성공 시 구독 및 첫 결제 결과를 반환합니다.

```json
{
  "code": 200,
  "message": "성공",
  "data": {
    "subscriptionId": "sub_1697196789000_1",
    "billingKeyId": "issue_1234567890",
    "productName": "NomadRank 멤버십 (월간)", PaymentRepository.issueBillingKeyManually(브라우저 측)에서 실행되는 fetch 호출입니다. 사용자가 결제 정보를 입력하면,
  클라이언트가 그 정보를 Next.js App Route(/api/payments/billing-key/issue)에 전달해 서버에서 실제 PortOne API를 호출
  하도록 넘기는 역할을 합니다.

  - this.BASE_PATH는 /api/payments; 따라서 최종 경로는 /api/payments/billing-key/issue.
  - this.FETCH_OPTIONS에는 credentials: 'include'가 설정돼 있어 세션 쿠키 등 인증 정보를 같이 보냅니다.
  - headers: { 'Content-Type': 'application/json' }와 body: JSON.stringify(request)로 카드·고객 정보를 JSON 형태로 전
    송합니다.

  이렇게 프런트가 직접 PortOne API를 호출하지 않고, 서버 Route Handler에서 인증 키를 붙여 PortOne에 안전하게 요청하는
  구조를 유지합니다.
    "amount": 9900,
    "billingCycle": "MONTHLY",
    "status": "ACTIVE",
    "nextBillingDate": "2025-11-13",
    "firstPaymentResult": {
      "success": true,
      "paymentId": "first_payment_1697196789456",
      "amount": 9900,
      "paidAt": "2025-10-13T08:33:12"
    },
    "cardInfo": {
      "last4Digits": "1234",
      "issuerName": "국민카드",
      "cardType": "신용"
    }
  }
}
```

> 내부적으로 기존 활성 빌링키를 비활성화하고, 빌링키는 AES-256-CBC 로 암호화 저장됩니다.

#### PortOne `billing-keys` 응답 예시
프런트엔드는 PortOne API 호출 시 아래와 같은 구조로 요청해야 하며, PortOne이 반환한 전문을 `issueResponse` 필드에 그대로 전달합니다. `issue` 정보를 루트에 펼쳐 보내면 오류가 발생하므로 주의하세요.

```json
{
  "issue": {
    "id": "issue_1760347235109_mjwe1mu719m",
    "name": "마스터 정기결제"
  },
  "customer": {
    "id": "customer_53",
    "name": "김주혁",
    "email": "kjh5848@kakao.com",
    "phoneNumber": "010-0000-0000"
  },
  "method": {
    "card": {
      "credential": {
        "number": "4518421244268814",
        "expiryMonth": "02",
        "expiryYear": "27",
        "birthOrBusinessRegistrationNumber": "940208",
        "passwordTwoDigits": "44"
      }
    }
  }
}
```

> ⚠️ **주의**: PortOne은 `issueId`/`issueName` 을 루트에 두는 형식을 허용하지 않습니다. 반드시 `issue` 객체 안에 `id`, `name` 항목을 포함해야 하며, `customer` 객체는 `id`, `name`, `email`, `phoneNumber` 키를 사용해야 합니다.

---

## 3. 빌링키 발급 실패 처리

빌링키 발급 실패 시 결제 이력 상태를 실패로 전환하고 재시도 가능 여부를 판단합니다.

```
POST /v1/payments/billing-key/fail
```

### Request Body

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `paymentId` | String | ✅ | 결제 ID |
| `issueId` | String | ✅ | PortOne 발급 ID |
| `errorCode` | String |  | PortOne 에러 코드 |
| `errorMessage` | String |  | 에러 메시지 |
| `failedAt` | String |  | 실패 시각 |

### Response 예시

```json
{
  "code": 200,
  "message": "성공",
  "data": {
    "retryAvailable": true,
    "remainingRetries": 2,
    "message": "결제 수단 등록에 실패했습니다. 다시 시도해주세요."
  }
}
```

---

## 4. 단건 결제 (스텁)

빌링키를 사용한 즉시 결제 엔드포인트입니다. 현재 PortOne 연동은 구현되지 않았으며 스텁 응답만 제공합니다.

```
POST /v1/payments/charge
```

### Request Body (`PaymentChargeRequest`)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `issueId` | String | ✅ | 저장된 빌링키 발급 ID |
| `orderId` | String | ✅ | 가맹점 주문 번호 |
| `amount` | Long | ✅ | 결제 금액 (원) |
| `customerId` | String | ✅ | 고객 식별자 |
| `orderName` | String |  | 주문명 (미지정 시 내부 기본값 사용 예정) |

### Response (현재)

```json
{
  "code": 501,
  "message": "단건 결제 연동은 준비 중입니다.",
  "data": {
    "status": "NOT_IMPLEMENTED",
    "message": "단건 결제 연동은 준비 중입니다."
  }
}
```

> ⚠️ **주의**: 실제 PortOne `/payments` 연동이 완료된 뒤 문서를 업데이트해야 합니다.

---

## 5. 정기 결제 예약

저장된 빌링키(issueId)를 기반으로 PortOne 반복 결제를 예약합니다.

```
POST /v1/payments/subscribe
```

### Request Body (`SubscriptionRequest`)

| 필드 | 타입 | 필수 | 설명 |
| --- | --- | --- | --- |
| `issueId` | String | ✅ | 빌링키 발급 ID (DB에서 암호화된 빌링키를 조회) |
| `orderId` | String | ✅ | 예약 결제 주문 ID (예: `sub-<timestamp>`) |
| `amount` | Long | ✅ | 결제 금액 (원) |
| `customerId` | String | ✅ | 고객 식별자 |
| `scheduleAt` | String | ✅ | 첫 실행 시각 (ISO-8601, 예: `2025-11-01T00:00:00+09:00`) |
| `interval` | String | ✅ | 반복 주기 (`DAY`, `WEEK`, `MONTH`, `YEAR`) |
| `intervalCount` | Integer | ✅ | 반복 간격 (예: 매월 ⇒ `1`) |
| `orderName` | String |  | 주문명 (미지정 시 `"NomadRank 멤버십 구독"`) |
| `productId` | String |  | 구독 상품 ID (기본값 `nomadrank-membership`) |

### Response (`ResDTO<SubscriptionReservationResponse>`)

```json
{
  "code": 200,
  "message": "정기 결제가 예약되었습니다.",
  "data": {
    "reservationId": "reservation_1748391023",
    "status": "SCHEDULED",
    "scheduleAt": "2025-11-01T00:00:00+09:00",
    "interval": "MONTH",
    "intervalCount": 1,
    "message": "정기 결제가 예약되었습니다."
  }
}
```

### 실패 시 예시

```json
{
  "code": 400,
  "message": "정기 결제 예약에 실패했습니다: billingKey not found",
  "data": null
}
```

> PortOne API 호출은 `PortOneV2Client#createPaymentSchedule` 을 통해 수행되며, 실패 응답 전문(`rawResponse`)은 서버 로그에서 확인할 수 있습니다.

---

## 6. 구독 상태 조회

사용자의 활성 구독 및 카드 정보를 확인합니다.

```
GET /v1/payments/subscriptions/status
```

### Response (`ResDTO<SubscriptionStatusResponse>`)

활성 구독이 있을 때:

```json
{
  "code": 200,
  "message": "성공",
  "data": {
    "hasActiveSubscription": true,
    "subscription": {
      "subscriptionId": "reservation_1748391023",
      "productName": "NomadRank 멤버십 구독",
      "status": "ACTIVE",
      "amount": 10000,
      "billingCycle": "MONTHLY",
      "startDate": "2025-11-01",
      "nextBillingDate": "2025-12-01",
      "cardInfo": {
        "last4Digits": "1234",
        "issuerName": "국민카드"
      }
    }
  }
}
```

활성 구독이 없을 때:

```json
{
  "code": 200,
  "message": "성공",
  "data": {
    "hasActiveSubscription": false,
    "subscription": null
  }
}
```

---

## 7. Webhook (결제 결과 수신) – 참고

`PaymentWebhookService` 가 PortOne 이벤트를 수신하도록 `/v1/payments/webhook` 엔드포인트를 별도로 제공합니다. 프런트엔드는 호출할 필요가 없으며, PortOne 관리자 콘솔에서 URL 및 서명 검증을 설정해야 합니다.

---

## 변경 이력

| 날짜 | 내용 | 작성자 |
| --- | --- | --- |
| 2025-10-13 | 구독 예약/단건 결제 스텁 반영, 최신 DTO 기준으로 명세 업데이트 | GPT-5 Codex |
