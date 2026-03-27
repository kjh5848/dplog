// 멤버십 기반 구독 시스템 타입 정의

// =====================================================
// 멤버십 상태
// =====================================================
export type MembershipState =
  | 'READY'
  | 'ACTIVATE'
  | 'EXPIRED'
  | 'PENDING_CANCEL'
  | 'STOP';

// =====================================================
// 멤버십 엔티티
// =====================================================
export interface Membership {
  id: number;
  name: string;
  point: number;
}

// =====================================================
// 사용자 멤버십 정보
// =====================================================
export interface UserMembership {
  id: number;
  userId: number;
  membershipId: number;
  membership: Membership;
  startDate: string; // ISO 8601
  endDate: string;   // ISO 8601
  state: MembershipState;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// =====================================================
// 현재 구독 조회 API
// =====================================================
export interface CurrentMembershipRequest {
  userId: number;
}

export interface CurrentMembershipResponse {
  membershipId: number;
  membershipName: string;
  startDate: string;   // ISO 8601
  endDate: string;     // ISO 8601
  membershipState: MembershipState;
  remainingDays: number;
  point: number;
}

// =====================================================
// 멤버십 목록 조회 API
// =====================================================
export interface MembershipListResponse {
  memberships: Membership[];
}

// 공개 멤버십 목록(카탈로그) 응답용 타입
export interface PublicMembershipItem {
  id: number;
  name: string;                // e.g., FREE, PRO, PREMIUM
  point: number;               // 포함 포인트
  price: number;               // 월간 가격 (KRW)
  priceFormatted: string;      // 월간 가격(서식 문자열)
  isPopular: boolean;          // 인기 플랜 배지
  colorScheme: string | null;  // UI 색상 힌트
  sortOrder: number;           // 정렬 우선순위 (낮을수록 상단)
  level: number;               // 등급(상향 비교용)
  recommendedRevenueHint: string | null; // 추천 매출 구간 텍스트
  trialAvailable: boolean;     // 체험 가능 여부
  trialDays: number | null;    // 체험 일수
  priceYearly: number;         // 연간 결제 금액(총액)
  discountPercent: number;     // 연간 할인율(%)
  // 백엔드에 없을 수 있는 필드는 선택(Optional)로 유지
  description?: string | null;
}

export interface MembershipCatalogItem {
  id: number;
  name: string;
  point: number;
  price: number;
  priceFormatted: string;
  isPopular: boolean;
  colorScheme: string | null;
  sortOrder: number;
  level: number;
  recommendedRevenueHint: string | null;
  trialAvailable: boolean;
  trialDays: number | null;
  priceYearly: number;
  discountPercent: number;
}

export interface MembershipCatalogResponse {
  code: number;
  message: string;
  data: {
    membershipList: MembershipCatalogItem[];
  };
}

export interface MembershipDetail {
  id: number;
  billingCycle:string;
  name: string;
  point: number;
  price: number;
  priceMonthly?: number | null;
  priceYearly?: number | null;
  recommendedRevenueHint: string | null;
  isPopular: boolean;
  colorScheme: string | null;
  sortOrder: number;
  currentMembershipId: number | null;
  currentMembershipName: string | null;
  currentMembershipPrice: number | null;
  currentMembershipPriceMonthly?: number | null;
  currentMembershipPriceYearly?: number | null;
  currentMembershipBillingCycle?: string | null;
  canPurchase: boolean;
  compareResult: string;
  message: string | null;
}

export interface MembershipDetailResponse {
  code: number;
  message: string;
  data: MembershipDetail;
}

// =====================================================
// 멤버십 프로필 요약 API (profile-summary)
// =====================================================

export type KnownServiceSortKey =
  | 'trackKeywords'
  | 'realtimeQueries';

export type KnownExtrasServiceSortKey =
  | 'relationKeywords'
  | 'keywordLookups'
  | 'shopRegistrations'
  | 'blogQualityChecks'
  | 'reviewReplies';

export type ServiceSortKey = KnownServiceSortKey | (string & {});
export type UsagePeriodType = 'DAILY' | 'MONTHLY';

export interface MembershipUsageMetric {
  used: number;
  limit: number | null;
  periodType?: UsagePeriodType | null;
  periodKey?: string | null;
  resetAt?: string | null;
}

export type MembershipUsageSnapshot = Partial<Record<ServiceSortKey, MembershipUsageMetric | undefined>> & {
  extras?: Partial<Record<KnownExtrasServiceSortKey | (string & {}), MembershipUsageMetric | undefined>>;
};

export interface MembershipHistoryItem {
  membershipId: number;
  membershipName: string;
  billingCycle: string | null;
  startDate: string;
  endDate: string;
  membershipState: MembershipState;
}

export interface MembershipHistoryPageInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface MembershipCatalogSummaryItem {
  membershipId: number;
  level: number;
  priceMonthly: number;
  priceYearly: number;
  isPopular: boolean;
  colorScheme?: string | null;
}

export interface MembershipProfileCurrent {
  membershipId: number | null;
  membershipName: string | null;
  billingCycle: string | null;
  startDate: string | null;
  endDate: string | null;
  remainingDays: number | null;
  compareLevel?: number | null;
  comparePriceMonthly?: number | null;
  comparePriceYearly?: number | null;
}

export interface MembershipPaymentHistoryItem {
  id: string;
  amount: number;
  planName: string | null;
  paymentMethod: string | null;
  status: string | null;
  paidAt: string | null;
  receiptUrl?: string | null;
}

export interface MembershipProfileSummaryData {
  current: MembershipProfileCurrent | null;
  history: MembershipHistoryItem[];
  historyPageInfo: MembershipHistoryPageInfo | null;
  catalogSummary: MembershipCatalogSummaryItem[];
  usage: MembershipUsageSnapshot | null;
  payments: MembershipPaymentHistoryItem[];
}

export interface MembershipProfileSummaryResponse {
  code: number;
  message: string;
  data: MembershipProfileSummaryData | null;
}
