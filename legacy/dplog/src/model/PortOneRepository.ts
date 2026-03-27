// 포트원 V2 Repository - 정기결제 전용
import * as PortOne from "@portone/browser-sdk/v2";
import { ApiResponse } from "@/types/api";
import { logError, logInfo } from '@/src/utils/logger';
import { processApiResponse } from "@/src/utils/api/responseHandler";
import {
  PortOneV2Config,
  PaymentPreRegisterRequest,
  IssueBillingKeyRequest,
  IssueBillingKeyAndPayRequest,
  BillingKeyPaymentRequest,
  SchedulePaymentRequest,
  PortOneSDKResponse,
  PortOneError,
  PaymentInfo,
  BillingKeyInfo,
  CustomerInfo
} from "@/src/types/portone";

class PortOneRepository {
  private static readonly config: PortOneV2Config = {
    storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID || '',
    channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY || '',
    apiSecret: process.env.PORTONE_API_SECRET || '',
  };

  private static readonly baseUrl = "https://api.portone.io";

  // 유니크 ID 생성 헬퍼
  static generateRandomId(): string {
    return [...crypto.getRandomValues(new Uint32Array(2))]
      .map((word) => word.toString(16).padStart(8, "0"))
      .join("");
  }

  // ISO8601 날짜 생성 헬퍼
  static generateISODate(hoursFromNow: number = 0): string {
    const date = new Date();
    date.setHours(date.getHours() + hoursFromNow);
    return date.toISOString();
  }

  // ===========================================
  // 결제 사전등록 API
  // ===========================================

  static async preRegisterPayment(
    paymentId: string, 
    request: PaymentPreRegisterRequest
  ): Promise<ApiResponse<any>> {
    try {
      logInfo('결제 사전등록 요청', { paymentId, request });

      const response = await fetch(`${this.baseUrl}/payments/${encodeURIComponent(paymentId)}/pre-register`, {
        method: 'POST',
        headers: {
          'Authorization': `PortOne ${this.config.apiSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결제 사전등록에 실패했습니다.');
      }

      const data = await response.json();
      logInfo('결제 사전등록 성공', { paymentId, data });

      return {
        code: '0',
        message: '결제 사전등록 성공',
        data,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('결제 사전등록 실패', errorObj, { paymentId, request });
      throw error;
    }
  }

  // ===========================================
  // 빌링키 발급 관련 메서드
  // ===========================================

  // 빌링키 발급 (SDK 사용)
  static async requestIssueBillingKey(request: IssueBillingKeyRequest): Promise<PortOneSDKResponse> {
    try {
      logInfo('빌링키 발급 요청', { request });

      const response = await PortOne.requestIssueBillingKey({
        storeId: request.storeId || this.config.storeId,
        channelKey: request.channelKey || this.config.channelKey,
        billingKeyMethod: request.billingKeyMethod as PortOne.BillingKeyMethod,
        issueId: request.issueId,
        issueName: request.issueName,
        customer: request.customer,
        redirectUrl: request.redirectUrl,
        noticeUrls: request.noticeUrls,
        windowType: request.windowType,
        ...(request.offerPeriod
          ? { offerPeriod: request.offerPeriod as PortOne.OfferPeriod }
          : {}),
      });

      if (!response || response.code) {
        const message = response?.message || '빌링키 발급에 실패했습니다.';
        logError('빌링키 발급 실패', new Error(message), { response });
        throw new Error(message);
      }

      logInfo('빌링키 발급 성공', { response });
      return response;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('빌링키 발급 실패', errorObj, { request });
      throw error;
    }
  }

  // 빌링키 발급 + 결제 (SDK 사용)
  static async requestIssueBillingKeyAndPay(request: IssueBillingKeyAndPayRequest): Promise<PortOneSDKResponse> {
    logError('빌링키 발급 + 결제 요청은 웹 클라이언트에서 지원되지 않습니다.', undefined, {
      request,
    });
    throw new Error('PortOne 빌링키 발급 + 결제는 현재 지원되지 않습니다.');
  }

  // ===========================================
  // 빌링키 결제 API
  // ===========================================

  static async billingKeyPayment(
    paymentId: string, 
    request: BillingKeyPaymentRequest
  ): Promise<ApiResponse<PaymentInfo>> {
    try {
      logInfo('빌링키 결제 요청', { paymentId, request });

      const response = await fetch(`${this.baseUrl}/payments/${encodeURIComponent(paymentId)}/billing-key`, {
        method: 'POST',
        headers: {
          'Authorization': `PortOne ${this.config.apiSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '빌링키 결제에 실패했습니다.');
      }

      const data = await response.json();
      logInfo('빌링키 결제 성공', { paymentId, data });

      return {
        code: '0',
        message: '빌링키 결제 성공',
        data,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('빌링키 결제 실패', errorObj, { paymentId, request });
      throw error;
    }
  }

  // ===========================================
  // 정기결제 스케줄링 API
  // ===========================================

  static async schedulePayment(
    paymentId: string, 
    request: SchedulePaymentRequest
  ): Promise<ApiResponse<any>> {
    try {
      logInfo('정기결제 스케줄링 요청', { paymentId, request });

      const response = await fetch(`${this.baseUrl}/payments/${encodeURIComponent(paymentId)}/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `PortOne ${this.config.apiSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '정기결제 스케줄링에 실패했습니다.');
      }

      const data = await response.json();
      logInfo('정기결제 스케줄링 성공', { paymentId, data });

      return {
        code: '0',
        message: '정기결제 스케줄링 성공',
        data,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('정기결제 스케줄링 실패', errorObj, { paymentId, request });
      throw error;
    }
  }

  // ===========================================
  // 결제 조회 및 관리 API
  // ===========================================

  // 결제 정보 조회
  static async getPayment(paymentId: string): Promise<ApiResponse<PaymentInfo>> {
    try {
      logInfo('결제 정보 조회', { paymentId });

      const response = await fetch(`${this.baseUrl}/payments/${encodeURIComponent(paymentId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `PortOne ${this.config.apiSecret}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결제 정보 조회에 실패했습니다.');
      }

      const data = await response.json();
      logInfo('결제 정보 조회 성공', { paymentId, data });

      return {
        code: '0',
        message: '결제 정보 조회 성공',
        data,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('결제 정보 조회 실패', errorObj, { paymentId });
      throw error;
    }
  }

  // 결제 취소
  static async cancelPayment(
    paymentId: string, 
    reason: string, 
    amount?: number
  ): Promise<ApiResponse<any>> {
    try {
      logInfo('결제 취소 요청', { paymentId, reason, amount });

      const requestBody: any = {
        reason,
      };

      if (amount !== undefined) {
        requestBody.amount = { total: amount };
      }

      const response = await fetch(`${this.baseUrl}/payments/${encodeURIComponent(paymentId)}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `PortOne ${this.config.apiSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결제 취소에 실패했습니다.');
      }

      const data = await response.json();
      logInfo('결제 취소 성공', { paymentId, data });

      return {
        code: '0',
        message: '결제 취소 성공',
        data,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('결제 취소 실패', errorObj, { paymentId, reason, amount });
      throw error;
    }
  }

  // ===========================================
  // 빌링키 관리 API  
  // ===========================================

  // 빌링키 조회
  static async getBillingKey(billingKey: string): Promise<ApiResponse<BillingKeyInfo>> {
    try {
      logInfo('빌링키 조회', { billingKey });

      const response = await fetch(`${this.baseUrl}/billing-keys/${encodeURIComponent(billingKey)}`, {
        method: 'GET',
        headers: {
          'Authorization': `PortOne ${this.config.apiSecret}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '빌링키 조회에 실패했습니다.');
      }

      const data = await response.json();
      logInfo('빌링키 조회 성공', { billingKey, data });

      return {
        code: '0',
        message: '빌링키 조회 성공',
        data,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('빌링키 조회 실패', errorObj, { billingKey });
      throw error;
    }
  }

  // 빌링키 삭제
  static async deleteBillingKey(billingKey: string): Promise<ApiResponse<any>> {
    try {
      logInfo('빌링키 삭제 요청', { billingKey });

      const response = await fetch(`${this.baseUrl}/billing-keys/${encodeURIComponent(billingKey)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `PortOne ${this.config.apiSecret}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '빌링키 삭제에 실패했습니다.');
      }

      const data = await response.json();
      logInfo('빌링키 삭제 성공', { billingKey, data });

      return {
        code: '0',
        message: '빌링키 삭제 성공',
        data,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('빌링키 삭제 실패', errorObj, { billingKey });
      throw error;
    }
  }

  // ===========================================
  // 편의 메서드
  // ===========================================

  // 정기결제용 고객 정보 생성
  static createCustomerInfo(
    fullName: string,
    phoneNumber: string,
    email: string,
    customerId?: string
  ): CustomerInfo {
    return {
      id: customerId,
      fullName,
      phoneNumber,
      email,
    };
  }

  // 다음 월 결제일 계산
  static getNextMonthlyPaymentDate(): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(1); // 매월 1일
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  // 다음 연 결제일 계산  
  static getNextYearlyPaymentDate(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    date.setMonth(0, 1); // 매년 1월 1일
    date.setHours(0, 0, 0, 0);
    return date.toISOString();
  }

  // 설정 유효성 검사
  static validateConfig(): boolean {
    const { storeId, channelKey } = this.config;
    
    if (!storeId || !channelKey) {
      logError('포트원 설정이 올바르지 않습니다', new Error('Missing config'), { config: this.config });
      return false;
    }
    
    return true;
  }
}

export default PortOneRepository;
