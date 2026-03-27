// 클라이언트 결제 Repository (Route Handler 호출)
import { logError, logInfo } from '@/src/utils/logger';
import {
  PaymentPreRegisterRequest,
  PaymentPreRegisterResponse,
  BillingKeyCompleteRequest,
  BillingKeyCompleteResponse,
  BillingKeyFailRequest,
  BillingKeyFailResponse,
  SubscriptionStatusResponse,
  ClientApiResponse,
  ManualBillingKeyIssueRequest,
  ManualBillingKeyIssueResponse,
  BillingReservationRequest,
  BillingReservationResponse,
  SubscriptionUpgradeRequest,
  SubscriptionUpgradeResponse,
  getUserFriendlyErrorMessage,
  isRetryableError
} from '@/src/types/payment';

class PaymentRepository {
  private static readonly BASE_PATH = '/api/payments';
  
  // 모든 fetch 요청에 credentials: 'include' 적용 (세션 쿠키 자동 포함)
  private static readonly FETCH_OPTIONS: RequestInit = {
    credentials: 'include' as RequestCredentials, // 브라우저가 쿠키를 자동으로 관리
  };

  // 공통 에러 처리
  private static handleApiError(response: ClientApiResponse<any>, defaultMessage: string): never {
    const errorMessage = response.error || defaultMessage;
    logError('PaymentRepository API 에러', new Error(errorMessage), { response });
    throw new Error(errorMessage);
  }

  // 결제 사전등록
  static async preRegisterPayment(
    request: PaymentPreRegisterRequest
  ): Promise<PaymentPreRegisterResponse> {
    try {
      logInfo('결제 사전등록 요청', { request });
      
      const response = await fetch(`${this.BASE_PATH}/pre-register`, {
        ...this.FETCH_OPTIONS,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData: ClientApiResponse = await response.json();
        this.handleApiError(errorData, '결제 사전등록에 실패했습니다');
      }

      const data: ClientApiResponse<PaymentPreRegisterResponse> = await response.json();
      
      if (!data.success || !data.data) {
        this.handleApiError(data, '결제 사전등록에 실패했습니다');
      }

      logInfo('결제 사전등록 성공', { paymentId: data.data.paymentId });
      return data.data;
    } catch (error) {
      logError('결제 사전등록 실패', error as Error, { request });
      throw error;
    }
  }

  // 포트원 수기 빌링키 발급
  static async issueBillingKeyManually(
    request: ManualBillingKeyIssueRequest
  ): Promise<ManualBillingKeyIssueResponse> {
    try {
      const sanitizedNumber = request.cardNumber.replace(/\s+/g, '');
      const maskedCard =
        sanitizedNumber.length >= 10
          ? `${sanitizedNumber.slice(0, 6)}******${sanitizedNumber.slice(-4)}`
          : 'masked';

      logInfo('포트원 빌링키 수기 발급 요청', {
        customerId: request.customerId,
        customerName: request.customerName,
        customerNickname: request.customerNickname,
        customerEmail: request.customerEmail,
        customerPhone: request.customerPhone,
        issueId: request.issueId,
        card: maskedCard,
      });

      const response = await fetch(`${this.BASE_PATH}/billing-key/issue`, {
        ...this.FETCH_OPTIONS,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data: ClientApiResponse<ManualBillingKeyIssueResponse> = await response.json();

      if (!response.ok || !data.success || !data.data) {
        this.handleApiError(data, data.error || '빌링키 발급에 실패했습니다');
      }

      if (!data.data.billingKey) {
        this.handleApiError(
          { success: false, error: '빌링키 응답이 올바르지 않습니다' },
          '빌링키 발급에 실패했습니다'
        );
      }

      logInfo('포트원 빌링키 수기 발급 성공', {
        customerId: request.customerId,
        issueId: request.issueId,
      });

      return data.data;
    } catch (error) {
      logError('포트원 빌링키 수기 발급 실패', error as Error, {
        customerId: request.customerId,
        issueId: request.issueId,
      });
      throw error;
    }
  }

  // 포트원 정기결제 예약
  static async reserveBillingSubscription(
    request: BillingReservationRequest
  ): Promise<BillingReservationResponse> {
    try {
      logInfo('정기결제 예약 요청', {
        issueId: request.issueId,
        orderId: request.orderId,
        customerId: request.customerId,
        amount: request.amount,
        scheduleAt: request.scheduleAt,
        interval: request.interval,
        intervalCount: request.intervalCount,
      });

      const response = await fetch(`${this.BASE_PATH}/subscribe`, {
        ...this.FETCH_OPTIONS,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const data: ClientApiResponse<BillingReservationResponse> = await response.json();

      if (!response.ok || !data.success || !data.data) {
        this.handleApiError(data, data.error || '정기결제 예약에 실패했습니다');
      }

      logInfo('정기결제 예약 성공', {
        issueId: request.issueId,
        orderId: request.orderId,
        customerId: request.customerId,
        reservationId: data.data.reservationId,
      });

      return data.data;
    } catch (error) {
      logError('정기결제 예약 실패', error as Error, {
        orderId: request.orderId,
        customerId: request.customerId,
      });
      throw error;
    }
  }

  // 구독 업그레이드
  static async upgradeSubscription(
    request: SubscriptionUpgradeRequest
  ): Promise<SubscriptionUpgradeResponse> {
    try {
      const { operationId, ...rest } = request;

      logInfo('구독 업그레이드 요청', { request });

      const response = await fetch(`${this.BASE_PATH}/upgrade`, {
        ...this.FETCH_OPTIONS,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(operationId ? { 'Idempotency-Key': operationId } : {}),
        },
        body: JSON.stringify({
          ...rest,
          ...(operationId ? { operationId } : {}),
        }),
      });

      const data: ClientApiResponse<SubscriptionUpgradeResponse> = await response.json();

      if (!response.ok || !data.success || !data.data) {
        this.handleApiError(data, data.error || '구독 업그레이드에 실패했습니다');
      }

      logInfo('구독 업그레이드 성공', {
        paymentId: data.data.paymentId,
        differenceAmount: data.data.differenceAmount,
      });

      return data.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '구독 업그레이드에 실패했습니다';
      logError('구독 업그레이드 실패', error as Error, { request });
      throw new Error(message);
    }
  }

  // 빌링키 발급 완료 처리
  static async completeBillingKey(
    request: BillingKeyCompleteRequest
  ): Promise<BillingKeyCompleteResponse> {
    try {
      logInfo('빌링키 완료 처리 요청', { request });
      
      const response = await fetch(`${this.BASE_PATH}/billing-key/complete`, {
        ...this.FETCH_OPTIONS,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData: ClientApiResponse = await response.json();
        this.handleApiError(errorData, '구독 활성화에 실패했습니다');
      }

      const data: ClientApiResponse<BillingKeyCompleteResponse> = await response.json();
      
      if (!data.success || !data.data) {
        this.handleApiError(data, '구독 활성화에 실패했습니다');
      }

      logInfo('빌링키 완료 처리 성공', { 
        subscriptionId: data.data.subscriptionId,
        status: data.data.status
      });
      
      return data.data;
    } catch (error) {
      logError('빌링키 완료 처리 실패', error as Error, { request });
      throw error;
    }
  }

  // 빌링키 발급 실패 기록
  static async recordBillingKeyFailure(
    request: BillingKeyFailRequest
  ): Promise<BillingKeyFailResponse> {
    try {
      logInfo('빌링키 실패 기록 요청', { request });
      
      const response = await fetch(`${this.BASE_PATH}/billing-key/fail`, {
        ...this.FETCH_OPTIONS,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData: ClientApiResponse = await response.json();
        // 실패 기록은 best effort이므로 에러를 던지지 않고 기본값 반환
        logError('빌링키 실패 기록 오류', new Error(errorData.error || 'Unknown error'), { request });
        return {
          retryAvailable: false,
          remainingRetries: 0,
          message: '실패가 기록되었습니다'
        };
      }

      const data: ClientApiResponse<BillingKeyFailResponse> = await response.json();
      
      if (!data.success || !data.data) {
        // 실패 기록 실패 시에도 기본값 반환
        return {
          retryAvailable: false,
          remainingRetries: 0,
          message: '실패가 기록되었습니다'
        };
      }

      logInfo('빌링키 실패 기록 성공', { 
        retryAvailable: data.data.retryAvailable,
        remainingRetries: data.data.remainingRetries
      });
      
      return data.data;
    } catch (error) {
      logError('빌링키 실패 기록 실패', error as Error, { request });
      // 실패 기록이 실패해도 기본값 반환 (사용자 경험에 영향 없음)
      return {
        retryAvailable: false,
        remainingRetries: 0,
        message: '실패가 기록되었습니다'
      };
    }
  }

  // 구독 상태 조회
  static async getSubscriptionStatus(): Promise<SubscriptionStatusResponse> {
    try {
      logInfo('구독 상태 조회 요청');

      const response = await fetch(`${this.BASE_PATH}/subscriptions/status`, {
        ...this.FETCH_OPTIONS,
        method: 'GET',
      });

      const data: ClientApiResponse<SubscriptionStatusResponse> = await response.json();

      if (!response.ok || !data.success || !data.data) {
        this.handleApiError(data, '구독 상태 조회에 실패했습니다');
      }

      logInfo('구독 상태 조회 성공', {
        hasActiveSubscription: data.data.hasActiveSubscription,
        subscriptionCount: data.data.subscriptions.length,
      });

      return data.data;
    } catch (error) {
      logError('구독 상태 조회 실패', error as Error);
      return {
        hasActiveSubscription: false,
        subscriptions: [],
      };
    }
  }

  // 사용자 친화적 에러 처리
  static getErrorMessage(error: any): string {
    if (error && typeof error === 'object' && 'code' in error) {
      return getUserFriendlyErrorMessage(error.code);
    }
    
    if (error && typeof error === 'object' && 'message' in error) {
      return error.message;
    }
    
    return '알 수 없는 오류가 발생했습니다';
  }

  // 재시도 가능 여부 확인
  static canRetry(error: any): boolean {
    if (error && typeof error === 'object' && 'code' in error) {
      return isRetryableError(error.code);
    }
    
    return false;
  }

  // 로그인 필요 여부 확인
  static requiresLogin(error: any): boolean {
    return error && (
      error.message?.includes('로그인') ||
      error.code === 401 ||
      (typeof error === 'object' && error.code === 'AUTHENTICATION_REQUIRED')
    );
  }
}

export default PaymentRepository;
