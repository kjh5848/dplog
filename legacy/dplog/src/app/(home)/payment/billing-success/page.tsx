"use client";

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, CreditCard, Calendar, Crown, ArrowRight } from 'lucide-react';
import { usePriceViewModel } from '@/src/viewModel/price/usePriceViewModel';
import { useAuthStore } from '@/src/store/provider/StoreProvider';
import Link from 'next/link';
import { logError } from '@/src/utils/logger';
import GlobalLoadingOverlay from '@/src/components/common/loading/GlobalLoadingOverlay';
import { customLoading } from '@/src/utils/loading';

function BillingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser } = useAuthStore();
  const { plans, loadPlans, loadCurrentSubscription } = usePriceViewModel();
  
  const [isProcessing, setIsProcessing] = useState(true);
  const [processingStep, setProcessingStep] = useState('카드 등록 확인 중...');
  const [subscriptionCompleted, setSubscriptionCompleted] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const processingOverlay = useMemo(
    () => customLoading("자동결제 설정 중입니다.", "lg"),
    []
  );

  // URL 파라미터에서 정보 추출
  const paymentId = searchParams.get('paymentId');
  const billingKey = searchParams.get('billingKey');
  const planId = searchParams.get('planId');
  const period = searchParams.get('period') as 'MONTHLY' | 'YEARLY';

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  useEffect(() => {
    if (plans.length > 0 && planId) {
      const plan = plans.find(p => p.id === planId);
      setSelectedPlan(plan);
    }
  }, [plans, planId]);

  useEffect(() => {
    const loadPaymentInfo = async () => {
      if (!paymentId || !billingKey || !planId || !period) {
        setError('필수 정보가 누락되었습니다.');
        setIsProcessing(false);
        return;
      }

      try {
        setProcessingStep('결제 정보 확인 중...');
        
        // 구독 상태 갱신
        await loadCurrentSubscription();
        
        setProcessingStep('구독 설정 완료!');
        setSubscriptionCompleted(true);

      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('결제 정보 조회 오류:', errorObj);
        setError(error instanceof Error ? error.message : '결제 정보를 가져오지 못했습니다.');
      } finally {
        setIsProcessing(false);
      }
    };

    if (paymentId && billingKey && plans.length > 0) {
      loadPaymentInfo();
    }
  }, [paymentId, billingKey, planId, period, plans, loadCurrentSubscription]);

  const getFinalPrice = () => {
    if (!selectedPlan) return 0;
    return period === 'YEARLY' ? Math.floor(selectedPlan.price * 12 * 0.8) : selectedPlan.price;
  };

  const getNextBillingDate = () => {
    const now = new Date();
    if (period === 'YEARLY') {
      return new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
    } else {
      return new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xl font-bold">!</span>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">자동결제 설정 실패</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/payment')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              다시 시도하기
            </button>
            <Link href="/" className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors">
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <GlobalLoadingOverlay
          visible
          config={{ ...processingOverlay, subMessage: processingStep }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* 성공 아이콘 */}
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">정기결제 등록 완료! 🎉</h1>
        <p className="text-gray-600 mb-6">구독이 성공적으로 시작되었습니다.</p>

        {/* 구독 정보 */}
        {selectedPlan && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">{selectedPlan.name}</span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">결제 금액</span>
                <span className="font-semibold">{getFinalPrice().toLocaleString()}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">결제 주기</span>
                <span className="font-semibold">{period === 'YEARLY' ? '연간' : '월간'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">다음 결제일</span>
                <span className="font-semibold">{getNextBillingDate().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* 자동결제 안내 */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">자동결제 안내</span>
          </div>
          <div className="text-xs text-gray-500 text-left space-y-1">
            <p>• 매{period === 'MONTHLY' ? '월' : '년'} 동일한 날짜에 자동으로 결제됩니다</p>
            <p>• 결제 3일 전 알림 메일을 보냅니다</p>
            <p>• 언제든지 구독을 해지할 수 있습니다</p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>서비스 이용하기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <BillingSuccessContent />
    </Suspense>
  );
} 
