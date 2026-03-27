// 백엔드 결제 API 타입 정의

// =====================================================
// 공통 타입
// =====================================================

// 백엔드 API 응답 기본 구조
export interface BackendApiResponse<T = any> {
  code: number;
  message: string;
  data: T | null;
}

// 통화 타입
export type Currency = 'KRW' | 'USD' | 'JPY' | 'EUR';

// 구독 상태
export type SubscriptionStatus = 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'EXPIRED' | 'PENDING_CANCEL';

// 에러 코드
export type PaymentErrorCode = 
  | 'AUTHENTICATION_REQUIRED'
  | 'INVALID_PRODUCT_ID'
  | 'PAYMENT_AMOUNT_INVALID'
  | 'BILLING_KEY_NOT_FOUND'
  | 'SUBSCRIPTION_NOT_FOUND'
  | 'WEBHOOK_SIGNATURE_INVALID'
  | 'INSUFFICIENT_FUNDS'
  | 'CARD_EXPIRED'
  | 'INVALID_CARD'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// =====================================================
// 결제 준비(사전결제) API
// =====================================================

export type PaymentMethod = 'CARD' | 'EASY_PAY' | 'VIRTUAL_ACCOUNT';

export type BillingCycleType = 'MONTHLY' | 'YEARLY';

export interface PaymentPreRegisterRequest {
  membershipLevel: number;
  paymentMethod: PaymentMethod;
  billingCycle: BillingCycleType;
  couponId?: string | null;
  expectedAmount: number;
  timezone?: string;
  billingTime?: string; // HH:mm
  scheduleAt?: string; // ISO-8601 with offset
}

export interface PaymentPreRegisterResponse {
  paymentId: string;
  totalAmount: number;
  currency: Currency | string;
  status: string;
  billingCycle: BillingCycleType;
  preparedAt?: string;
}

// =====================================================
// 포트원 빌링키 수기 발급 & 결제 API
// =====================================================

export interface ManualBillingKeyIssueRequest {
  issueId?: string;
  issueName?: string;
  customerId: string;
  customerName: string;
  customerNickname?: string;
  customerEmail: string;
  customerPhone: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  birthOrBusinessRegistrationNumber: string;
  passwordTwoDigits: string;
}

export interface ManualBillingKeyIssueResponse {
  billingKey: string;
  issueId?: string;
  customerId?: string;
  card?: {
    bin?: string;
    lastFour?: string;
    issuerName?: string;
  };
  raw?: Record<string, any>;
}

// 정기 결제 예약
export interface BillingReservationRequest {
  issueId: string;
  orderId: string;
  amount: number;
  customerId: string;
  scheduleAt: string; // ISO-8601 (+09:00 권장)
  interval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  intervalCount: number;
  orderName?: string;
  productId?: string;
  timezone?: string;
  billingTime?: string; // HH:mm
}

export interface BillingReservationResponse {
  reservationId: string;
  status?: string;
  scheduleAt?: string;
  interval?: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
  intervalCount?: number;
  message?: string;
}

// =====================================================
// 구독 업그레이드 API
// =====================================================

export interface SubscriptionUpgradeRequest {
  targetMembershipLevel: number;
  billingCycle: BillingCycleType;
  paymentMethod?: PaymentMethod;
  operationId?: string;
}

export interface SubscriptionUpgradeResponse {
  differenceAmount: number;
  currency: Currency | string;
  paymentId?: string | null;
  nextBillingDate?: string | null;
  remainingDays?: number;
  currentPlanPrice?: number;
  targetPlanPrice?: number;
  paymentRequested: boolean;
  message?: string;
}

// =====================================================
// 빌링키 완료 처리 API
// =====================================================

export interface BillingKeyCompleteRequest {
  userId: number;
  issueId: string;
  paymentId: string;
  productId: string;
  billingKey?: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  customerNickname?: string;
  customerPhone?: string;
  issueResponse?: Record<string, any>;
}

export interface BillingKeyCompleteResponse {
  subscriptionId: string;
  status: SubscriptionStatus;
  nextPaymentDate: string;  // ISO 8601
  amount: number;
  productName: string;
}

// =====================================================
// 빌링키 실패 처리 API
// =====================================================

export interface BillingKeyFailRequest {
  userId: number;
  paymentId: string;
  issueId: string;
  errorCode: string;
  errorMessage: string;
  failedAt: string;  // ISO 8601
}

export interface BillingKeyFailResponse {
  retryAvailable: boolean;
  remainingRetries: number;
  message: string;
}

// =====================================================
// 구독 상태 조회 API
// =====================================================

export interface SubscriptionStatusRequest {
  userId: number;
}

export interface Subscription {
  subscriptionId: string;
  productName: string;
  status: SubscriptionStatus;
  amount: number;
  nextPaymentDate: string;  // ISO 8601
  failureCount: number;
  createdAt: string;  // ISO 8601
  lastPaymentDate: string;  // ISO 8601
  pendingDowngrade?: SubscriptionPendingDowngrade | null;
  pendingCancel?: SubscriptionPendingCancel | null;
}

export interface SubscriptionStatusResponse {
  hasActiveSubscription: boolean;
  subscriptions: Subscription[];
}

// =====================================================
// 구독 해지 API
// =====================================================

export type SubscriptionCancelReasonCode =
  | 'PRICE'
  | 'USAGE_LOW'
  | 'FEATURE_LACK'
  | 'BUGS'
  | 'SUPPORT'
  | 'SWITCH'
  | 'ETC';

export interface SubscriptionCancelRequest {
  reasonCode: SubscriptionCancelReasonCode;
  reasonDetail?: string | null;
  operationId?: string;
}

export interface SubscriptionCancelResponse {
  subscriptionId?: string;
  status: SubscriptionStatus;
  canceledAt?: string | null;
  nextBillingDate?: string | null;
  billingKeyStatus?: 'ACTIVE' | 'DELETED' | 'PENDING';
  hasFutureSchedules?: boolean;
  message?: string;
  effectiveDate?: string | null;
  scheduleRemoved?: boolean;
  scheduleRevokedAt?: string | null;
}

// =====================================================
// 구독 다운그레이드 API
// =====================================================

export type SubscriptionDowngradeStatus = 'SCHEDULED' | 'CANCELLED' | 'APPLIED';

export interface SubscriptionDowngradeRequest {
  targetMembershipLevel: number;
  targetBillingCycle: BillingCycleType;
  reason?: string | null;
  operationId?: string;
}

export interface SubscriptionDowngradeResponse {
  subscriptionId: string;
  status: SubscriptionDowngradeStatus;
  effectiveDate: string;
  targetMembershipLevel: number;
  targetBillingCycle: BillingCycleType;
  message?: string;
}

export interface SubscriptionDowngradeCancelResponse {
  subscriptionId: string;
  status: SubscriptionDowngradeStatus;
  message?: string;
}

export interface SubscriptionPendingDowngrade {
  effectiveDate: string;
  targetMembershipLevel: number;
  targetBillingCycle: BillingCycleType;
  requestedAt?: string | null;
  reason?: string | null;
  
}

export interface SubscriptionPendingCancel {
  effectiveDate: string;
  status?: string | null;
  requestedAt?: string | null;
  reason?: string | null;
}

export interface SubscriptionCancelUndoResponse {
  subscriptionId: string;
  status: SubscriptionStatus;
  message?: string;
}

// =====================================================
// 웹훅 관련 타입
// =====================================================

export type WebhookEventType = 
  | 'Payment.Paid'
  | 'Transaction.Paid'
  | 'Payment.Failed'
  | 'Transaction.Failed'
  | 'Payment.Cancelled'
  | 'Transaction.Cancelled'
  | 'BillingKey.Issued'
  | 'BillingKey.Deleted';

export interface WebhookPaymentMethod {
  type: 'CARD' | 'PHONE' | 'EASY_PAY';
  card?: {
    maskedNumber: string;
    issuerName: string;
  };
}

export interface WebhookEventData {
  userId?: number;
  paymentId: string;
  transactionId?: string;
  amount: number;
  status: string;
  paidAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  method?: WebhookPaymentMethod;
}

export interface WebhookRequest {
  type: WebhookEventType;
  data: WebhookEventData;
}

// =====================================================
// 클라이언트용 응답 타입 (Route Handler에서 반환)
// =====================================================

export interface ClientApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

// =====================================================
// 에러 메시지 매핑
// =====================================================

export const ErrorMessages: Record<PaymentErrorCode, string> = {
  AUTHENTICATION_REQUIRED: '로그인이 필요합니다',
  INVALID_PRODUCT_ID: '유효하지 않은 요금제입니다',
  PAYMENT_AMOUNT_INVALID: '결제 금액이 올바르지 않습니다',
  BILLING_KEY_NOT_FOUND: '결제 수단을 찾을 수 없습니다',
  SUBSCRIPTION_NOT_FOUND: '구독 정보를 찾을 수 없습니다',
  WEBHOOK_SIGNATURE_INVALID: '웹훅 서명이 유효하지 않습니다',
  INSUFFICIENT_FUNDS: '잔액이 부족합니다',
  CARD_EXPIRED: '카드가 만료되었습니다',
  INVALID_CARD: '유효하지 않은 카드입니다',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다'
};

// =====================================================
// 유틸리티 함수
// =====================================================

// 사용자 친화적 에러 메시지 변환
export function getUserFriendlyErrorMessage(errorCode: string): string {
  return ErrorMessages[errorCode as PaymentErrorCode] || ErrorMessages.UNKNOWN_ERROR;
}

// 재시도 가능한 에러인지 확인
export function isRetryableError(errorCode: string): boolean {
  const retryableErrors: PaymentErrorCode[] = [
    'INSUFFICIENT_FUNDS',
    'NETWORK_ERROR'
  ];
  return retryableErrors.includes(errorCode as PaymentErrorCode);
}
