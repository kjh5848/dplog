// 토스페이먼츠 자동결제(빌링) 전용 Repository
import { ApiResponse } from "@/types/api";
import { logError } from '@/src/utils/logger';
import { processApiResponse } from "@/src/utils/api/responseHandler";

// 토스페이먼츠 빌링 타입 정의
export type BillingAuthRequest = {
  customerKey: string;
  successUrl: string;
  failUrl: string;
};

export type BillingAuthResponse = {
  authKey: string;
  customerKey: string;
};

export type BillingKeyRequest = {
  authKey: string;
  customerKey: string;
};

export type BillingKeyResponse = {
  billingKey: string;
  customerKey: string;
  card: {
    number: string;
    cardType: string;
    ownerType: string;
  };
};

export type BillingPaymentRequest = {
  billingKey: string;
  customerKey: string;
  amount: number;
  orderId: string;
  orderName: string;
};

export type BillingPaymentResponse = {
  paymentKey: string;
  orderId: string;
  amount: number;
  status: string;
  approvedAt: string;
  method: string;
  card: {
    number: string;
    cardType: string;
    ownerType: string;
  };
};

// 일반 결제 타입 정의 (기존 PriceRepository에서 이동)
export type GeneralPaymentRequest = {
  amount: number;
  orderId: string;
  orderName: string;
  customerKey?: string;
  successUrl: string;
  failUrl: string;
  paymentMethod: 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT';
};

export type GeneralPaymentResponse = {
  paymentKey: string;
  orderId: string;
  amount: number;
  status: string;
  approvedAt?: string;
  method?: string;
  receipt?: {
    url: string;
  };
};

export type ConfirmPaymentRequest = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

class TossPaymentsRepository {
  private static readonly baseUrl = "https://api.tosspayments.com/v1";
  private static readonly clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || 'test_ck_Kma60RZblrqwdRBJaQE3wzYWBn14';
  private static readonly secretKey = process.env.TOSS_SECRET_KEY || 'test_sk_YyZqmkKeP8gKkmKy1Qd8bQRxB9lG';

  // SDK 초기화 확인
  static checkSDKLoaded(): boolean {
    return typeof window !== 'undefined' && !!(window as any).TossPayments;
  }

  // 토스페이먼츠 SDK 로드 대기
  static async waitForSDK(timeout = 10000): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.checkSDKLoaded()) {
        resolve(true);
        return;
      }

      let attempts = 0;
      const maxAttempts = timeout / 100;
      
      const checkInterval = setInterval(() => {
        attempts++;
        
        if (this.checkSDKLoaded()) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  }

  // 토스페이먼츠 SDK 인스턴스 생성
  static async createSDKInstance() {
    const isLoaded = await this.waitForSDK();
    
    if (!isLoaded) {
      throw new Error('토스페이먼츠 SDK가 로드되지 않았습니다.');
    }
    
    return (window as any).TossPayments(this.clientKey);
  }

  // ===========================================
  // 자동결제(빌링) 관련 메서드
  // ===========================================

  // 1. 빌링 인증 요청 (카드 등록)
  static async requestBillingAuth(request: BillingAuthRequest): Promise<void> {
    const tossPayments = await this.createSDKInstance();
    const payment = tossPayments.payment();

    // 고유한 주문번호 생성
    const orderId = `billing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      await payment.requestBillingAuth('카드', {
        customerKey: request.customerKey,
        successUrl: request.successUrl,
        failUrl: request.failUrl,
        orderId: orderId,
        orderName: '자동결제 카드 등록',
        amount: 0, // 카드 등록만 하므로 0원
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('빌링 인증 요청 실패', errorObj, { operation: 'requestBillingAuth' });
      throw error;
    } 
  }

  // 2. 빌링키 발급
  static async issueBillingKey(request: BillingKeyRequest): Promise<ApiResponse<BillingKeyResponse>> {
    try {
      const encodedKey = btoa(`${this.secretKey}:`);
      
      const response = await fetch(`${this.baseUrl}/billing/authorizations/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encodedKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authKey: request.authKey,
          customerKey: request.customerKey,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '빌링키 발급에 실패했습니다.');
      }

      const billingData = await response.json();

      return {
        code: '0',
        message: '빌링키 발급 성공',
        data: {
          billingKey: billingData.billingKey,
          customerKey: billingData.customerKey,
          card: billingData.card,
        },
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('빌링키 발급 실패', errorObj, { operation: 'issueBillingKey' });
      throw error;
    }
  } 

  // 3. 빌링키로 자동결제 승인
  static async confirmBillingPayment(request: BillingPaymentRequest): Promise<ApiResponse<BillingPaymentResponse>> {
    try {
      const encodedKey = btoa(`${this.secretKey}:`);
      
      const response = await fetch(`${this.baseUrl}/billing/${request.billingKey}`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encodedKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerKey: request.customerKey,
          amount: request.amount,
          orderId: request.orderId,
          orderName: request.orderName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '자동결제 승인에 실패했습니다.');
      }

      const paymentData = await response.json();

      return {
        code: '0',
        message: '자동결제 승인 성공',
        data: {
          paymentKey: paymentData.paymentKey,
          orderId: paymentData.orderId,
          amount: paymentData.totalAmount,
          status: paymentData.status,
          approvedAt: paymentData.approvedAt,
          method: paymentData.method,
          card: paymentData.card,
        },
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('자동결제 승인 실패', errorObj, { operation: 'approveBillingPayment' });
      throw error;
    }
  }

  // ===========================================
  // 일반 결제 관련 메서드
  // ===========================================

  // 일반 결제 요청
  static async requestGeneralPayment(request: GeneralPaymentRequest): Promise<void> {
    const tossPayments = await this.createSDKInstance();
    const payment = tossPayments.payment();

    try {
      await payment.requestPayment(request.paymentMethod, {
        amount: request.amount,
        orderId: request.orderId,
        orderName: request.orderName,
        customerKey: request.customerKey,
        successUrl: request.successUrl,
        failUrl: request.failUrl,
      });
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('일반 결제 요청 실패', errorObj, { operation: 'requestPayment' });
      throw error;
    }
  }

  // 결제 승인 확인
  static async confirmPayment(request: ConfirmPaymentRequest): Promise<ApiResponse<GeneralPaymentResponse>> {
    try {
      const encodedKey = btoa(`${this.secretKey}:`);
      
      const response = await fetch(`${this.baseUrl}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encodedKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentKey: request.paymentKey,
          orderId: request.orderId,
          amount: request.amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결제 승인에 실패했습니다.');
      }

      const paymentData = await response.json();

      return {
        code: '0',
        message: '결제 승인 성공',
        data: {
          paymentKey: paymentData.paymentKey,
          orderId: paymentData.orderId,
          amount: paymentData.totalAmount,
          status: paymentData.status,
          approvedAt: paymentData.approvedAt,
          method: paymentData.method,
          receipt: paymentData.receipt,
        },
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('결제 승인 실패', errorObj, { operation: 'approvePayment' });
      throw error;
    }
  }

  // 결제 조회
  static async getPayment(paymentKey: string): Promise<ApiResponse<GeneralPaymentResponse>> {
    try {
      const encodedKey = btoa(`${this.secretKey}:`);
      
      const response = await fetch(`${this.baseUrl}/payments/${paymentKey}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${encodedKey}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결제 조회에 실패했습니다.');
      }

      const paymentData = await response.json();

      return {
        code: '0',
        message: '결제 조회 성공',
        data: {
          paymentKey: paymentData.paymentKey,
          orderId: paymentData.orderId,
          amount: paymentData.totalAmount,
          status: paymentData.status,
          approvedAt: paymentData.approvedAt,
          method: paymentData.method,
          receipt: paymentData.receipt,
        },
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('결제 조회 실패', errorObj, { operation: 'getPayment' });
      throw error;
    }
  }

  // 결제 취소
  static async cancelPayment(paymentKey: string, cancelReason: string): Promise<ApiResponse<any>> {
    try {
      const encodedKey = btoa(`${this.secretKey}:`);
      
      const response = await fetch(`${this.baseUrl}/payments/${paymentKey}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${encodedKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelReason: cancelReason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '결제 취소에 실패했습니다.');
      }

      const cancelData = await response.json();

      return {
        code: '0',
        message: '결제 취소 성공',
        data: cancelData,
      };
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('결제 취소 실패', errorObj, { operation: 'cancelPayment' });
      throw error;
    }
  }
}

export default TossPaymentsRepository; 
