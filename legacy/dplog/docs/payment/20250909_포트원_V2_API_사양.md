# PortOne V2 빌링키 정기결제 시스템 API 명세서

> **Version**: 1.0.0  
> **Last Updated**: 2025-09-08  
> **Base URL**: `http://localhost:8081`

## 📌 개요

PortOne V2 이니시스 빌링키를 활용한 정기결제 시스템 REST API입니다.
서버 사이드에서 안전한 결제 처리와 자동 정기결제 관리를 제공합니다.

## 🔐 인증 방식

### 세션 기반 인증
- **Required**: 모든 결제 API 호출 시 유효한 세션 필요
- **Session Key**: `authInfo`
- **Cookie**: `JSESSIONID` (자동으로 브라우저가 관리)
- **Error**: 미인증 시 `AuthenticationException` 발생

> ⚠️ **보안 주의사항**  
> - JSESSIONID는 절대 요청 바디나 URL 파라미터에 포함시키지 마세요
> - 브라우저가 자동으로 쿠키로 세션을 관리하도록 하세요
> - fetch 사용 시 `credentials: 'include'` 옵션을 사용하세요

```http
Cookie: JSESSIONID=ABC123XYZ789
```

---

## 📋 결제 관련 API

### Base Path: `/v1/payments`

### 1. 결제 사전등록

결제를 시작하기 전에 PortOne에 결제 정보를 사전 등록합니다.

**Endpoint**
```http
POST /v1/payments/pre-register
```

**Headers**
```http
Content-Type: application/json
Cookie: JSESSIONID=<session-id>
```

**Request Body**
```json
{
  "productId": "PREMIUM_MONTHLY",
  "totalAmount": 9900,
  "taxFreeAmount": 0,
  "currency": "KRW",
  "orderName": "프리미엄 월간 구독"
}
```

**Request Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productId` | String | ✅ | 상품 식별자 |
| `totalAmount` | BigDecimal | ✅ | 결제 금액 (0보다 커야 함) |
| `taxFreeAmount` | BigDecimal | | 비과세 금액 (기본값: 0) |
| `currency` | String | | 통화 (기본값: "KRW") |
| `orderName` | String | ✅ | 주문명 |

**Response**
```json
{
  "code": 200,
  "message": "성공",
  "data": {
    "paymentId": "payment_1694154123456_123",
    "merchantUid": "merchant_1694154123456_123",
    "totalAmount": 9900,
    "currency": "KRW",
    "orderName": "프리미엄 월간 구독"
  }
}
```

**Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `paymentId` | String | PortOne 결제 ID |
| `merchantUid` | String | 가맹점 주문번호 |
| `totalAmount` | BigDecimal | 결제 금액 |
| `currency` | String | 통화 |
| `orderName` | String | 주문명 |

---

### 2. 빌링키 발급 완료 처리

프론트엔드에서 빌링키 발급이 완료된 후 호출하여 구독을 활성화합니다.

**Endpoint**
```http
POST /v1/payments/billing-key/complete
```

**Request Body**
```json
{
  "issueId": "issue_1694154123456",
  "paymentId": "payment_1694154123456_123",
  "productId": "PREMIUM_MONTHLY"
}
```

**Request Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `issueId` | String | ✅ | PortOne 빌링키 발급 ID |
| `paymentId` | String | ✅ | 결제 ID |
| `productId` | String | ✅ | 상품 ID |

**Response**
```json
{
  "code": 200,
  "message": "성공",
  "data": {
    "subscriptionId": "sub_1694154123456",
    "status": "ACTIVE",
    "nextPaymentDate": "2025-10-08T09:00:00",
    "amount": 9900,
    "productName": "프리미엄 월간 구독"
  }
}
```

**Response Fields**
| Field | Type | Description |
|-------|------|-------------|
| `subscriptionId` | String | 구독 ID |
| `status` | String | 구독 상태 (`ACTIVE`, `SUSPENDED`, `CANCELLED`) |
| `nextPaymentDate` | String | 다음 결제 예정일 (ISO 8601) |
| `amount` | BigDecimal | 정기결제 금액 |
| `productName` | String | 상품명 |

---

### 3. 빌링키 발급 실패 처리

빌링키 발급이 실패했을 때 호출하여 실패 상태를 기록합니다.

**Endpoint**
```http
POST /v1/payments/billing-key/fail
```

**Request Body**
```json
{
  "paymentId": "payment_1694154123456_123",
  "issueId": "issue_1694154123456",
  "errorCode": "INSUFFICIENT_FUNDS",
  "errorMessage": "잔액 부족",
  "failedAt": "2025-09-08T12:00:00Z"
}
```

**Request Fields**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `paymentId` | String | ✅ | 결제 ID |
| `issueId` | String | ✅ | 빌링키 발급 ID |
| `errorCode` | String | ✅ | 에러 코드 |
| `errorMessage` | String | ✅ | 에러 메시지 |
| `failedAt` | String | ✅ | 실패 시각 (ISO 8601) |

**Response**
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

**Error Codes**
| Error Code | Retry Available | Description |
|------------|----------------|-------------|
| `INSUFFICIENT_FUNDS` | ✅ | 잔액 부족 |
| `CARD_EXPIRED` | ❌ | 카드 만료 |
| `INVALID_CARD` | ❌ | 유효하지 않은 카드 |
| `NETWORK_ERROR` | ✅ | 네트워크 오류 |

---

### 4. 구독 상태 조회

현재 사용자의 구독 상태를 조회합니다.

**Endpoint**
```http
GET /v1/payments/subscriptions/status
```

**Response**
```json
{
  "code": 200,
  "message": "성공",
  "data": {
    "hasActiveSubscription": true,
    "subscriptions": [
      {
        "subscriptionId": "sub_1694154123456",
        "productName": "프리미엄 월간 구독",
        "status": "ACTIVE",
        "amount": 9900,
        "nextPaymentDate": "2025-10-08T09:00:00",
        "failureCount": 0,
        "createdAt": "2025-09-08T12:00:00",
        "lastPaymentDate": "2025-09-08T12:00:00"
      }
    ]
  }
}
```

**Subscription Status**
| Status | Description |
|--------|-------------|
| `ACTIVE` | 활성 구독 |
| `SUSPENDED` | 일시 중단 (결제 실패 등) |
| `CANCELLED` | 취소됨 |
| `EXPIRED` | 만료됨 |

---

## 🔗 웹훅 API

### Base Path: `/v1/webhooks`

### 1. PortOne 웹훅 수신

PortOne에서 발생하는 이벤트를 수신합니다.

**Endpoint**
```http
POST /v1/webhooks/portone
```

**Headers**
```http
Authorization: PortOne <HMAC-SHA256-Signature>
Content-Type: application/json
```

**Request Body**
```json
{
  "type": "Payment.Paid",
  "data": {
    "paymentId": "payment_1694154123456_123",
    "transactionId": "tx_1694154123456",
    "amount": 9900,
    "status": "PAID",
    "paidAt": "2025-09-08T12:00:00Z",
    "method": {
      "type": "CARD",
      "card": {
        "maskedNumber": "1234-****-****-5678",
        "issuerName": "신한카드"
      }
    }
  }
}
```

**지원하는 웹훅 타입**
| Type | Description |
|------|-------------|
| `Payment.Paid` / `Transaction.Paid` | 결제 성공 |
| `Payment.Failed` / `Transaction.Failed` | 결제 실패 |
| `Payment.Cancelled` / `Transaction.Cancelled` | 결제 취소 |
| `BillingKey.Issued` | 빌링키 발급 완료 |
| `BillingKey.Deleted` | 빌링키 삭제 |

**Response**
```http
HTTP/1.1 200 OK

SUCCESS
```

**Error Response**
```http
HTTP/1.1 401 Unauthorized

SIGNATURE_INVALID
```

---

### 2. 웹훅 테스트 (개발환경 전용)

웹훅 동작을 테스트하기 위한 엔드포인트입니다.

**Endpoint**
```http
POST /v1/webhooks/portone/test
```

**Request Body**
```json
{
  "type": "Payment.Paid",
  "data": {
    "paymentId": "test_payment_123",
    "amount": 1000,
    "status": "PAID"
  }
}
```

**Response**
```http
HTTP/1.1 200 OK

TEST_SUCCESS
```

---

## 🔒 보안

### 웹훅 서명 검증

PortOne 웹훅의 무결성을 보장하기 위해 HMAC-SHA256 서명을 검증합니다.

**검증 과정**
1. `Authorization` 헤더에서 서명 추출
2. 웹훅 시크릿으로 페이로드 서명 생성
3. 서명 비교하여 검증

**서명 형식**
```http
Authorization: PortOne <base64-encoded-hmac-sha256>
```

**서명 생성 (예시)**
```javascript
const crypto = require('crypto');

const payload = JSON.stringify(webhookData);
const secret = 'your-webhook-secret';
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload, 'utf8')
  .digest('base64');
```

---

## 🚨 에러 처리

### 공통 에러 응답 형식

모든 API는 다음과 같은 형식으로 에러를 응답합니다.

```json
{
  "code": 400,
  "message": "결제 사전등록에 실패했습니다: 유효하지 않은 상품 ID입니다",
  "data": null
}
```

### HTTP 상태 코드

| Status Code | Description |
|-------------|-------------|
| `200` | 성공 |
| `400` | 잘못된 요청 (유효성 검증 실패) |
| `401` | 인증 필요 (로그인 안됨) |
| `403` | 권한 없음 |
| `404` | 리소스 없음 |
| `500` | 서버 내부 오류 |

### 에러 코드

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | 로그인이 필요합니다 |
| `INVALID_PRODUCT_ID` | 400 | 유효하지 않은 상품 ID |
| `PAYMENT_AMOUNT_INVALID` | 400 | 결제 금액이 유효하지 않음 |
| `BILLING_KEY_NOT_FOUND` | 404 | 빌링키를 찾을 수 없음 |
| `SUBSCRIPTION_NOT_FOUND` | 404 | 구독을 찾을 수 없음 |
| `WEBHOOK_SIGNATURE_INVALID` | 401 | 웹훅 서명이 유효하지 않음 |

---

## 📊 자동화 기능

### 정기결제 스케줄링

시스템이 자동으로 정기결제를 처리합니다.

**스케줄 설정**
- **정기결제 실행**: 매일 오전 9시 (`0 0 9 * * *`)
- **재시도 처리**: 매일 오후 2시 (`0 0 14 * * *`)
- **데이터 정리**: 매일 자정 (`0 0 0 * * *`)

**정기결제 처리 흐름**
1. `ACTIVE` 상태인 모든 구독 조회
2. 다음 결제일이 도래한 구독 필터링
3. 빌링키를 사용하여 결제 실행
4. 결제 결과에 따라 구독 상태 업데이트
5. 다음 결제일 설정

### 실패 처리 정책

**재시도 정책**
- **최대 재시도**: 3회
- **재시도 간격**: 24시간
- **지수 백오프**: 1일 → 2일 → 3일
- **구독 중단**: 3회 연속 실패 시 `SUSPENDED` 상태로 변경

**실패 시나리오별 처리**
| 실패 유형 | 재시도 | 조치 |
|-----------|--------|------|
| 일시적 오류 (네트워크, 서버) | ✅ | 24시간 후 재시도 |
| 잔액 부족 | ✅ | 24시간 후 재시도 |
| 카드 만료 | ❌ | 즉시 구독 중단, 사용자 알림 |
| 카드 분실/도난 | ❌ | 즉시 구독 중단, 빌링키 삭제 |

---

## 🔧 환경 설정

### 애플리케이션 설정

```yaml
# application-dev.yml
portone:
  v2:
    store-id: ${PORTONE_STORE_ID:store-dev-example}
    api-secret: ${PORTONE_API_SECRET:dev-api-secret-example}
    channel-key: ${PORTONE_CHANNEL_KEY:channel-dev-example}
    api-url: https://api.portone.io/v2
    webhook-secret: ${PORTONE_WEBHOOK_SECRET:dev-webhook-secret}
  billing:
    encryption-key: ${BILLING_ENCRYPTION_KEY:dev-encryption-key-32-chars!!}
    max-retry-count: 3
    retry-interval-hours: 24
```

### 환경 변수

| Variable | Required | Description |
|----------|----------|-------------|
| `PORTONE_STORE_ID` | ✅ | PortOne 상점 ID |
| `PORTONE_API_SECRET` | ✅ | PortOne API Secret |
| `PORTONE_CHANNEL_KEY` | ✅ | PortOne 채널 키 |
| `PORTONE_WEBHOOK_SECRET` | ✅ | 웹훅 서명 검증용 시크릿 |
| `BILLING_ENCRYPTION_KEY` | ✅ | 빌링키 암호화 키 (32자) |

---

## 📝 사용 예시

### 정기결제 등록 플로우

```javascript
// 1. 결제 사전등록
const preRegisterResponse = await fetch('/v1/payments/pre-register', {
  method: 'POST',
  credentials: 'include',  // ✅ 쿠키(세션) 자동 포함
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: 'PREMIUM_MONTHLY',
    totalAmount: 9900,
    orderName: '프리미엄 월간 구독'
  })
});

const { paymentId, merchantUid } = preRegisterResponse.data;

// 2. PortOne 빌링키 발급 (프론트엔드)
const issueResponse = await PortOne.issueBillingKey({
  storeId: 'store-id',
  channelKey: 'channel-key',
  issueId: `issue_${Date.now()}`,
  issueName: '정기결제 등록',
  customer: {
    customerId: 'customer-123',
    fullName: '김철수',
    phoneNumber: '010-1234-5678',
    email: 'customer@example.com'
  }
});

// 3. 발급 완료 처리
if (issueResponse.code === 'ISSUE_SUCCESS') {
  await fetch('/v1/payments/billing-key/complete', {
    method: 'POST',
    credentials: 'include',  // ✅ 쿠키(세션) 자동 포함
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      issueId: issueResponse.issueId,
      paymentId: paymentId,
      productId: 'PREMIUM_MONTHLY'
    })
  });
} else {
  // 4. 발급 실패 처리
  await fetch('/v1/payments/billing-key/fail', {
    method: 'POST',
    credentials: 'include',  // ✅ 쿠키(세션) 자동 포함
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      paymentId: paymentId,
      issueId: issueResponse.issueId,
      errorCode: issueResponse.code,
      errorMessage: issueResponse.message,
      failedAt: new Date().toISOString()
    })
  });
}
```

### 구독 상태 확인

```javascript
const statusResponse = await fetch('/v1/payments/subscriptions/status', {
  credentials: 'include'  // ✅ 쿠키(세션) 자동 포함
});
const subscriptions = statusResponse.data.subscriptions;

subscriptions.forEach(sub => {
  console.log(`구독 ID: ${sub.subscriptionId}`);
  console.log(`상태: ${sub.status}`);
  console.log(`다음 결제일: ${sub.nextPaymentDate}`);
});
```

---

## 📞 고객 지원

### 개발 관련 문의
- **Email**: dev@nomadlab.co.kr
- **Slack**: #payment-dev

### 운영 이슈
- **Email**: ops@nomadlab.co.kr
- **Phone**: 02-1234-5678

---

## 📈 버전 히스토리

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-09-08 | 초기 버전 릴리즈 |

---

*본 문서는 PortOne V2 빌링키 정기결제 시스템의 공식 API 명세서입니다.*  
*최신 정보는 개발팀에 문의하시기 바랍니다.*