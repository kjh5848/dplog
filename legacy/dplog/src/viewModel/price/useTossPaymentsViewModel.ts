"use client";

import { useState, useCallback } from "react";
import TossPaymentsRepository, {
  BillingAuthRequest,
  BillingKeyRequest,
  BillingPaymentRequest,
  GeneralPaymentRequest,
  ConfirmPaymentRequest,
  BillingKeyResponse,
  BillingPaymentResponse,
  GeneralPaymentResponse
} from "@/src/model/TossPaymentsRepository";
import toast from "react-hot-toast";

export interface TossPaymentsViewModel {
  // State
  loading: boolean;
  error: string | null;
  billingKey: string | null;
  lastPayment: BillingPaymentResponse | GeneralPaymentResponse | null;

  // 자동결제(빌링) Actions
  requestBillingAuth: (request: BillingAuthRequest) => Promise<void>;
  issueBillingKey: (request: BillingKeyRequest) => Promise<BillingKeyResponse>;
  confirmBillingPayment: (request: BillingPaymentRequest) => Promise<BillingPaymentResponse>;

  // 일반결제 Actions
  requestGeneralPayment: (request: GeneralPaymentRequest) => Promise<void>;
  confirmPayment: (request: ConfirmPaymentRequest) => Promise<GeneralPaymentResponse>;

  // 공통 Actions
  getPayment: (paymentKey: string) => Promise<GeneralPaymentResponse>;
  cancelPayment: (paymentKey: string, reason: string) => Promise<any>;
  clearError: () => void;
  clearState: () => void;
}

export const useTossPaymentsViewModel = (): TossPaymentsViewModel => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingKey, setBillingKey] = useState<string | null>(null);
  const [lastPayment, setLastPayment] = useState<BillingPaymentResponse | GeneralPaymentResponse | null>(null);

  // ===========================================
  // 자동결제(빌링) 관련 메서드
  // ===========================================

  // 빌링 인증 요청 (카드 등록)
  const requestBillingAuth = useCallback(async (request: BillingAuthRequest) => {
    try {
      setLoading(true);
      setError(null);

      await TossPaymentsRepository.requestBillingAuth(request);
      toast.success('카드 등록 창이 열렸습니다.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '카드 등록 요청에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 빌링키 발급
  const issueBillingKey = useCallback(async (request: BillingKeyRequest): Promise<BillingKeyResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await TossPaymentsRepository.issueBillingKey(request);

      if (response.code === '0') {
        setBillingKey(response.data.billingKey);
        toast.success('빌링키가 성공적으로 발급되었습니다!');
        return response.data;
      } else {
        throw new Error(response.message || '빌링키 발급에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '빌링키 발급에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 빌링키로 자동결제 승인
  const confirmBillingPayment = useCallback(async (request: BillingPaymentRequest): Promise<BillingPaymentResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await TossPaymentsRepository.confirmBillingPayment(request);

      if (response.code === '0') {
        setLastPayment(response.data);
        toast.success('자동결제가 성공적으로 완료되었습니다!');
        return response.data;
      } else {
        throw new Error(response.message || '자동결제 승인에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '자동결제 승인에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===========================================
  // 일반 결제 관련 메서드
  // ===========================================

  // 일반 결제 요청
  const requestGeneralPayment = useCallback(async (request: GeneralPaymentRequest) => {
    try {
      setLoading(true);
      setError(null);

      await TossPaymentsRepository.requestGeneralPayment(request);
      toast.success('결제창이 열렸습니다.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '결제 요청에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 결제 승인 확인
  const confirmPayment = useCallback(async (request: ConfirmPaymentRequest): Promise<GeneralPaymentResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await TossPaymentsRepository.confirmPayment(request);

      if (response.code === '0') {
        setLastPayment(response.data);
        toast.success('결제가 성공적으로 완료되었습니다!');
        return response.data;
      } else {
        throw new Error(response.message || '결제 승인에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '결제 승인에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ===========================================
  // 공통 메서드
  // ===========================================

  // 결제 조회
  const getPayment = useCallback(async (paymentKey: string): Promise<GeneralPaymentResponse> => {
    try {
      setLoading(true);
      setError(null);

      const response = await TossPaymentsRepository.getPayment(paymentKey);

      if (response.code === '0') {
        return response.data;
      } else {
        throw new Error(response.message || '결제 조회에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '결제 조회에 실패했습니다.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 결제 취소
  const cancelPayment = useCallback(async (paymentKey: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await TossPaymentsRepository.cancelPayment(paymentKey, reason);

      if (response.code === '0') {
        toast.success('결제가 성공적으로 취소되었습니다.');
        return response.data;
      } else {
        throw new Error(response.message || '결제 취소에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '결제 취소에 실패했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 오류 메시지 클리어
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // 상태 초기화
  const clearState = useCallback(() => {
    setError(null);
    setBillingKey(null);
    setLastPayment(null);
  }, []);

  return {
    // State
    loading,
    error,
    billingKey,
    lastPayment,

    // 자동결제(빌링) Actions
    requestBillingAuth,
    issueBillingKey,
    confirmBillingPayment,

    // 일반결제 Actions
    requestGeneralPayment,
    confirmPayment,

    // 공통 Actions
    getPayment,
    cancelPayment,
    clearError,
    clearState,
  };
}; 