// 타입 정의
import { ApiResponse } from "@/types/api";
import { processApiResponse } from "@/src/utils/api/responseHandler";
import {
  SubscriptionPendingCancel,
  SubscriptionPendingDowngrade,
} from "@/src/types/payment";

export type PricePlan = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  period: 'MONTHLY' | 'YEARLY';
  discountRate?: number;
  features: PriceFeature[];
  isPopular?: boolean;
  isActive: boolean;
  createdDate: string;
  updatedDate: string;
};

export type PriceFeature = {
  id: string;
  name: string;
  description: string;
  limit?: number;
  unlimited: boolean;
  order: number;
};

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  plan?: PricePlan;
  status: 'ACTIVE' | 'PENDING' | 'CANCELLED' | 'EXPIRED'| 'PENDING_CANCEL';
  period?: 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string;
  amount?: number;
  nextBillingDate?: string;
  autoRenewal: boolean;
  paymentMethod: string;
  billingKey?: string;
  createdDate: string;
  updatedDate: string;
  pendingDowngrade?: SubscriptionPendingDowngrade | null;
  pendingCancel?: SubscriptionPendingCancel | null;
};

export type PaymentRequest = {
  planId: string;
  period: 'MONTHLY' | 'YEARLY';
  successUrl: string;
  failUrl: string;
  customerKey?: string;
};

export type PaymentHistoryRequest = {
  userId: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
};

export type PaymentHistory = {
  id: string;
  orderId: string;
  amount: number;
  planName: string;
  paymentMethod: string;
  status: string;
  paidAt: string;
  receiptUrl?: string;
};

class PriceRepository {
  static url = "/v1/pricing";
  static apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api.dplog.kr";

  // 요금제 목록 조회
  static async getPricePlans(): Promise<ApiResponse<{ plans: PricePlan[] }>> {
    // 프론트엔드 목업 데이터 반환
    return {
      code: "0",
      data: {
        plans: [
          {
            id: "plan-a",
            name: "A 요금제",
            price: 10000,
            period: "MONTHLY" as const,
            features: [
              {
                id: "f1",
                name: "키워드",
                description: "키워드 10개",
                limit: 10,
                unlimited: false,
                order: 1,
              },
              {
                id: "f2",
                name: "실시간 조회",
                description: "실시간 1일 50회",
                limit: 50,
                unlimited: false,
                order: 2,
              },
              {
                id: "f3",
                name: "N사 순위 조회",
                description: "N사 순위 조회 50회",
                limit: 50,
                unlimited: false,
                order: 3,
              },
            ],
            isPopular: false,
            isActive: true,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
          },
          {
            id: "plan-b",
            name: "B 요금제",
            price: 20000,
            period: "MONTHLY" as const,
            features: [
              {
                id: "f1",
                name: "키워드",
                description: "키워드 50개",
                limit: 50,
                unlimited: false,
                order: 1,
              },
              {
                id: "f2",
                name: "실시간 조회",
                description: "실시간 1일 100회",
                limit: 100,
                unlimited: false,
                order: 2,
              },
              {
                id: "f3",
                name: "N사 순위 조회",
                description: "N사 순위 조회 무제한",
                limit: 0,
                unlimited: true,
                order: 3,
              },
            ],
            isPopular: true,
            isActive: true,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
          },
          {
            id: "plan-c",
            name: "C 요금제",
            price: 36000,
            originalPrice: 40000,
            discountRate: 10,
            period: "MONTHLY" as const,
            features: [
              {
                id: "f1",
                name: "키워드",
                description: "키워드 100개",
                limit: 100,
                unlimited: false,
                order: 1,
              },
              {
                id: "f2",
                name: "실시간 조회",
                description: "실시간 1일 200회",
                limit: 200,
                unlimited: false,
                order: 2,
              },
              {
                id: "f3",
                name: "N사 순위 조회",
                description: "N사 순위 조회 무제한",
                limit: 0,
                unlimited: true,
                order: 3,
              },
            ],
            isPopular: false,
            isActive: true,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
          },
          {
            id: "plan-d",
            name: "D 요금제",
            price: 56000,
            originalPrice: 70000,
            discountRate: 20,
            period: "MONTHLY" as const,
            features: [
              {
                id: "f1",
                name: "키워드",
                description: "키워드 200개",
                limit: 200,
                unlimited: false,
                order: 1,
              },
              {
                id: "f2",
                name: "실시간 조회",
                description: "실시간 1일 500회",
                limit: 500,
                unlimited: false,
                order: 2,
              },
              {
                id: "f3",
                name: "N사 순위 조회",
                description: "N사 순위 조회 무제한",
                limit: 0,
                unlimited: true,
                order: 3,
              },
            ],
            isPopular: false,
            isActive: true,
            createdDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
          },
        ],
      },
      message: "플랜 목록 조회 성공",
    };
  }

  // 특정 요금제 상세 조회
  static async getPricePlan(
    planId: string,
  ): Promise<ApiResponse<{ plan: PricePlan }>> {
    // 목업 데이터에서 해당 요금제 찾기
    const plansResponse = await this.getPricePlans();
    const plan = plansResponse.data.plans.find((p) => p.id === planId);

    if (!plan) {
      return {
        code: "-1",
        data: null as unknown as { plan: PricePlan },
        message: "해당 요금제를 찾을 수 없습니다.",
      };
    }

    return {
      code: "0",
      data: { plan },
      message: "요금제 조회 성공",
    };
  }

  // 현재 사용자 구독 정보 조회 (백엔드 직접 호출)
  static async getCurrentSubscription(): Promise<
    ApiResponse<{ subscription: Subscription | null }>
  > {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/v1/membership/current`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // 인증 실패 (API 문서 기준)
          return {
            code: -1,
            data: { subscription: null },
            message: "인증에 실패했습니다.",
          };
        }
        if (response.status === 403) {
          // 권한 없음 (API 문서 기준)
          return {
            code: -1, 
            data: { subscription: null },
            message: "권한이 없습니다.",
          };
        }
        if (response.status === 404) {
          // 사용자 없음 또는 구독 없음 (API 문서 기준)
          return {
            code: 0,
            data: { subscription: null },
            message: "현재 활성화된 구독이 없습니다.",
          };
        }
        // 기타 오류
        return {
          code: -1,
          data: { subscription: null },
          message: "구독 정보를 불러오는데 실패했습니다.",
        };
      }

      const result = await response.json();
      
      // API 응답 구조 확인 및 처리
      if (result.code === 0 && result.data) {
        const membershipData = result.data;
        
        const billingCycleRaw =
          (membershipData.billingCycle ||
            membershipData.billingCycleType ||
            membershipData.period ||
            'MONTHLY') as string;
        const period =
          billingCycleRaw?.toUpperCase() === 'YEARLY' ? 'YEARLY' : 'MONTHLY';

        const monthlyPrice =
          membershipData.priceMonthly ??
          membershipData.currentMembershipPriceMonthly ??
          membershipData.price ??
          membershipData.currentMembershipPrice ??
          0;
        const yearlyPrice =
          membershipData.priceYearly ??
          membershipData.currentMembershipPriceYearly ??
          membershipData.priceYearly ??
          monthlyPrice * 12;
        const priceForCycle = period === 'YEARLY' ? yearlyPrice : monthlyPrice;

        const subscription: Subscription = {
          id: `membership_${membershipData.membershipId}`,
          userId: "current_user", // 세션 기반
          planId: membershipData.membershipId.toString(),
          plan: {
            id: membershipData.membershipId.toString(),
            name: membershipData.membershipName,
            price: priceForCycle,
            period: period as 'MONTHLY' | 'YEARLY',
            features: [],
            isActive: membershipData.membershipState === 'ACTIVATE',
            createdDate: membershipData.startDate,
            updatedDate: membershipData.startDate,
            originalPrice: priceForCycle,
            discountRate: 0,
            isPopular: false
          },
          status: membershipData.membershipState === 'ACTIVATE' ? 'ACTIVE' as const : 'EXPIRED' as const,
          startDate: membershipData.startDate,
          endDate: membershipData.endDate,
          autoRenewal: true,
          paymentMethod: "MEMBERSHIP",
          createdDate: membershipData.startDate,
          updatedDate: membershipData.startDate,
          nextBillingDate:
            (membershipData as any)?.nextPaymentDate ??
            (membershipData as any)?.nextBillingDate ??
            membershipData.endDate,
          pendingDowngrade: null,
          pendingCancel: null,
        };

        return {
          code: 0,
          data: { subscription },
          message: "success",
        };
      } else {
        // 구독 정보가 없는 경우
        return {
          code: 0,
          data: { subscription: null },
          message: result.message || "현재 활성화된 구독이 없습니다.",
        };
      }

    } catch (error) {
      // 네트워크 오류 또는 기타 오류
      console.error('구독 정보 조회 실패:', error);
      return {
        code: -1, // 시스템 오류
        data: { subscription: null },
        message: "구독 정보 조회 중 시스템 오류가 발생했습니다.",
      };
    }
  }

  // 결제 히스토리 조회
  static async getPaymentHistory(
    request: PaymentHistoryRequest,
  ): Promise<ApiResponse<{ payments: PaymentHistory[]; pagination: any }>> {
    try {
      const queryParams = new URLSearchParams({
        page: (request.page || 1).toString(),
        limit: (request.limit || 20).toString(),
        ...(request.startDate && { startDate: request.startDate }),
        ...(request.endDate && { endDate: request.endDate }),
      });

      const response = await fetch(
        `${this.apiBaseUrl}/v1/payment/history?${queryParams}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("결제 히스토리 조회에 실패했습니다.");
      }

      return processApiResponse(response, true); // skipRedirect = true로 설정
    } catch (error) {
      // 목업 데이터 반환
      return {
        code: "0",
        data: {
          payments: [
            {
              id: "payment_123",
              orderId: "order_123456789",
              amount: 20000,
              planName: "B 요금제",
              paymentMethod: "카드",
              status: "DONE",
              paidAt: "2024-01-01T12:00:00Z",
              receiptUrl: "https://receipt.url",
            },
          ],
          pagination: {
            page: request.page || 1,
            limit: request.limit || 20,
            total: 1,
            totalPages: 1,
          },
        },
        message: "Mock payment history",
      };
    }
  }
}

export default PriceRepository; 
