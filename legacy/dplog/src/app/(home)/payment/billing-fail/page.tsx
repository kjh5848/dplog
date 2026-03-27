"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { XCircle, CreditCard, ArrowLeft, RotateCcw, HelpCircle } from 'lucide-react';
import { useAuthStore } from '@/src/store/provider/StoreProvider';
import Link from 'next/link';
import { logError } from '@/src/utils/logger';

function BillingFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser } = useAuthStore();
  
  const [errorInfo, setErrorInfo] = useState<{
    code?: string;
    message?: string;
    type: 'payment_failed' | 'card_error' | 'network_error' | 'validation_error' | 'unknown_error';
  }>({ type: 'unknown_error' });

  // URL 파라미터에서 에러 정보 추출
  const errorCode = searchParams.get('errorCode');
  const errorMessage = searchParams.get('errorMessage');
  const paymentId = searchParams.get('paymentId');
  const planId = searchParams.get('planId');
  const period = searchParams.get('period');

  useEffect(() => {
    if (errorCode || errorMessage) {
      logError('빌링키 발급 실패', new Error(errorMessage || 'Unknown error'), { 
        errorCode, 
        paymentId, 
        planId, 
        period 
      });

      // 에러 코드에 따른 분류
      let errorType: 'payment_failed' | 'card_error' | 'network_error' | 'validation_error' | 'unknown_error' = 'unknown_error';
      
      if (errorCode) {
        if (errorCode.includes('CARD') || errorCode.includes('PAYMENT')) {
          errorType = 'card_error';
        } else if (errorCode.includes('NETWORK') || errorCode.includes('TIMEOUT')) {
          errorType = 'network_error';
        } else if (errorCode.includes('VALIDATION') || errorCode.includes('INVALID')) {
          errorType = 'validation_error';
        } else {
          errorType = 'payment_failed';
        }
      }

      setErrorInfo({
        code: errorCode || undefined,
        message: errorMessage || undefined,
        type: errorType,
      });
    }
  }, [errorCode, errorMessage, paymentId, planId, period]);

  const getErrorContent = () => {
    switch (errorInfo.type) {
      case 'card_error':
        return {
          title: '카드 정보 오류',
          description: '등록하신 카드에 문제가 있습니다.',
          suggestions: [
            '카드 번호, 유효기간, CVC를 다시 확인해주세요',
            '카드 한도가 충분한지 확인해주세요',
            '다른 카드로 시도해보세요',
            '카드사에 문의하여 온라인 결제가 가능한지 확인해주세요'
          ],
          icon: <CreditCard className="w-8 h-8 text-red-500" />
        };
      
      case 'network_error':
        return {
          title: '네트워크 연결 오류',
          description: '인터넷 연결에 문제가 발생했습니다.',
          suggestions: [
            '인터넷 연결 상태를 확인해주세요',
            '잠시 후 다시 시도해주세요',
            '브라우저를 새로고침하고 다시 시도해주세요'
          ],
          icon: <RotateCcw className="w-8 h-8 text-red-500" />
        };
      
      case 'validation_error':
        return {
          title: '정보 입력 오류',
          description: '입력하신 정보에 문제가 있습니다.',
          suggestions: [
            '모든 정보가 정확히 입력되었는지 확인해주세요',
            '특수문자나 공백이 포함되지 않았는지 확인해주세요',
            '이름과 카드 소유자명이 일치하는지 확인해주세요'
          ],
          icon: <HelpCircle className="w-8 h-8 text-red-500" />
        };
      
      case 'payment_failed':
      default:
        return {
          title: '자동결제 설정 실패',
          description: '정기결제 설정 중 문제가 발생했습니다.',
          suggestions: [
            '카드 정보를 다시 확인해주세요',
            '잠시 후 다시 시도해주세요',
            '문제가 지속되면 고객센터에 문의해주세요'
          ],
          icon: <XCircle className="w-8 h-8 text-red-500" />
        };
    }
  };

  const errorContent = getErrorContent();

  const handleRetry = () => {
    // 원래 결제 페이지로 돌아가면서 선택했던 플랜 정보 유지
    const params = new URLSearchParams();
    if (planId) params.set('planId', planId);
    if (period) params.set('period', period);
    
    const paymentUrl = params.toString() ? `/payment?${params.toString()}` : '/payment';
    router.push(paymentUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* 에러 아이콘 */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {errorContent.icon}
        </div>

        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{errorContent.title}</h1>
        <p className="text-gray-600 mb-6">{errorContent.description}</p>

        {/* 에러 코드 표시 (있는 경우) */}
        {errorInfo.code && (
          <div className="bg-red-50 rounded-lg p-3 mb-6">
            <p className="text-sm text-red-700">
              <span className="font-semibold">오류 코드:</span> {errorInfo.code}
            </p>
            {errorInfo.message && (
              <p className="text-sm text-red-600 mt-1">{errorInfo.message}</p>
            )}
          </div>
        )}

        {/* 해결 방법 안내 */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-blue-900 mb-2">해결 방법</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            {errorContent.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>다시 시도하기</span>
          </button>
          
          <Link
            href="/payment"
            className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>요금제 선택으로 돌아가기</span>
          </Link>
          
          <Link
            href="/"
            className="block w-full text-center text-gray-500 py-2 hover:text-gray-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>

        {/* 고객센터 안내 */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            문제가 계속 발생하면 고객센터(support@dplog.kr)로 문의해주세요.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BillingFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <BillingFailContent />
    </Suspense>
  );
} 