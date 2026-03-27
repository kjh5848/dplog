// 포트원 V2 API 타입 정의
export interface PortOneV2Config {
  storeId: string;
  channelKey: string;
  apiSecret?: string;
}

// 고객 정보
export interface CustomerInfo {
  id?: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  phoneNumber: string;
  email: string;
}

// 결제 사전등록 요청
export interface PaymentPreRegisterRequest {
  totalAmount?: number;
  taxFreeAmount?: number;
  currency?: 'KRW' | 'USD' | 'JPY' | 'EUR';
}

// 빌링키 발급 요청
export interface IssueBillingKeyRequest {
  storeId: string;
  channelKey: string;
  billingKeyMethod: 'CARD' | 'PHONE' | 'EASY_PAY';
  issueId: string;
  issueName: string;
  customer: CustomerInfo;
  redirectUrl?: string;
  noticeUrls?: string[];
  windowType?: WindowTypeConfig;
  offerPeriod?: OfferPeriod;
}

// 빌링키 발급 및 결제 요청
export interface IssueBillingKeyAndPayRequest extends IssueBillingKeyRequest {
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: 'KRW' | 'USD' | 'JPY' | 'EUR';
}

// 빌링키 결제 요청
export interface BillingKeyPaymentRequest {
  billingKey: string;
  orderName: string;
  customer: CustomerInfo;
  amount: {
    total: number;
    taxFree?: number;
  };
  currency: 'KRW' | 'USD' | 'JPY' | 'EUR';
  installmentMonth?: number;
  promotionId?: string;
}

// 정기결제 스케줄링 요청
export interface SchedulePaymentRequest {
  payment: BillingKeyPaymentRequest;
  timeToPay: string; // ISO8601 format
}

// 포트원 API 응답 기본 구조
export interface PortOneApiResponse<T = any> {
  code?: string;
  message?: string;
  data?: T;
}

// 빌링키 정보
export interface BillingKeyInfo {
  billingKey: string;
  customerId?: string;
  issuedAt: string;
  cardInfo?: {
    number: string;
    type: string;
    company: string;
  };
}

// 결제 상태
export type PaymentStatus = 
  | 'READY'
  | 'PENDING' 
  | 'VIRTUAL_ACCOUNT_ISSUED'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'PARTIAL_CANCELLED';

// 결제 정보
export interface PaymentInfo {
  paymentId: string;
  orderId?: string;
  orderName: string;
  amount: {
    total: number;
    paid: number;
    cancelled: number;
    taxFree?: number;
  };
  currency: string;
  status: PaymentStatus;
  paidAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  customer?: CustomerInfo;
  method?: {
    type: string;
    card?: {
      number: string;
      company: string;
      type: string;
    };
  };
}

// 결제창 유형 설정
export interface WindowTypeConfig {
  pc?: 'IFRAME' | 'POPUP' | 'REDIRECTION' | 'UI';
  mobile?: 'IFRAME' | 'POPUP' | 'REDIRECTION' | 'UI';
}

export interface OfferPeriodRange {
  from?: string;
  to?: string;
}

export interface OfferPeriod {
  range?: OfferPeriodRange;
  interval?: string;
}

// 포트원 V2 에러 코드
export type PortOneErrorCode = 
  | 'INVALID_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'PAYMENT_NOT_FOUND'
  | 'BILLING_KEY_NOT_FOUND'
  | 'PAYMENT_ALREADY_PROCESSED'
  | 'INSUFFICIENT_FUNDS'
  | 'CARD_EXPIRED'
  | 'CARD_DECLINED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// 포트원 V2 에러 응답
export interface PortOneError {
  code: PortOneErrorCode;
  message: string;
  details?: any;
}

// SDK 응답
export interface PortOneSDKResponse {
  code?: string;
  message?: string;
  paymentId?: string;
  billingKey?: string;
  issueId?: string;
}

// 환경 변수 타입
export interface PortOneEnv {
  NEXT_PUBLIC_PORTONE_STORE_ID: string;
  NEXT_PUBLIC_PORTONE_CHANNEL_KEY: string;
  PORTONE_API_SECRET?: string;
}
