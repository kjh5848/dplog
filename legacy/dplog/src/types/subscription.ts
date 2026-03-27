// 구독 관련 타입 정의

export type SubscriptionStatus = 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED';

export type PaymentPeriod = 'MONTHLY' | 'YEARLY';

export type PaymentMethod = 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT';

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';

// 구독 정보
export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  period: PaymentPeriod;
  startDate: string;
  endDate: string;
  nextBillingDate?: string;
  autoRenewal: boolean;
  billingKey?: string;
  lastPayment?: {
    id: string;
    amount: number;
    paidAt: string;
    status: PaymentStatus;
  };
  createdAt: string;
  updatedAt: string;
}

// 결제 히스토리
export interface PaymentHistory {
  id: string;
  orderId: string;
  amount: number;
  planName: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt: string;
  receipt?: {
    url: string;
  };
}

// 영수증 정보
export interface Receipt {
  paymentId: string;
  orderId: string;
  orderName: string;
  amount: number;
  taxAmount: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  cardInfo?: {
    cardType: string;
    cardNumber: string;
    ownerType: string;
  };
  paidAt: string;
  receiptUrl: string;
  issuer: {
    name: string;
    businessNumber: string;
    address: string;
    tel: string;
  };
}

// 페이지네이션 정보
export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// 자동결제 카드 정보
export interface BillingCard {
  cardType: string;
  cardNumber: string;
  ownerType: string;
}

// 자동결제 키 정보
export interface BillingKey {
  billingKey: string;
  customerKey: string;
  card: BillingCard;
} 