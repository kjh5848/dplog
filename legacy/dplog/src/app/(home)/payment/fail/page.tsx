"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { XCircle, RefreshCw, Home, HelpCircle } from "lucide-react";

function PaymentFailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const getErrorMessage = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '사용자가 결제를 취소했습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제 진행 중 오류가 발생했습니다.';
      case 'REJECT_CARD_COMPANY':
        return '카드사에서 결제를 거절했습니다.';
      case 'INSUFFICIENT_BALANCE':
        return '잔액이 부족합니다.';
      case 'EXCEED_MAX_DAILY_PAYMENT_COUNT':
        return '일일 결제 한도를 초과했습니다.';
      case 'INVALID_CARD_EXPIRATION':
        return '카드 유효기간이 만료되었습니다.';
      case 'INVALID_STOPPED_CARD':
        return '정지된 카드입니다.';
      case 'EXCEED_MAX_ONE_DAY_WITHDRAWAL_AMOUNT':
        return '일일 출금 한도를 초과했습니다.';
      case 'INVALID_CARD_INSTALLMENT_PLAN':
        return '할부 개월 수가 잘못되었습니다.';
      case 'NOT_MATCHED_CERTIFICATION':
        return '카드 정보가 일치하지 않습니다.';
      case 'REJECT_TOSSPAY_INVALID_ACCOUNT':
        return '유효하지 않은 계좌입니다.';
      default:
        return message || '알 수 없는 오류가 발생했습니다.';
    }
  };

  const getSolution = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '다시 결제를 진행해주세요.';
      case 'REJECT_CARD_COMPANY':
      case 'INSUFFICIENT_BALANCE':
        return '다른 카드를 사용하거나 계좌에 충분한 잔액을 확인해주세요.';
      case 'EXCEED_MAX_DAILY_PAYMENT_COUNT':
      case 'EXCEED_MAX_ONE_DAY_WITHDRAWAL_AMOUNT':
        return '내일 다시 시도하거나 다른 결제 수단을 이용해주세요.';
      case 'INVALID_CARD_EXPIRATION':
      case 'INVALID_STOPPED_CARD':
        return '유효한 카드로 다시 시도해주세요.';
      case 'NOT_MATCHED_CERTIFICATION':
        return '카드 정보를 정확히 입력해주세요.';
      default:
        return '잠시 후 다시 시도하거나 고객센터에 문의해주세요.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* 실패 메시지 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center mb-8">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <XCircle className="text-red-600" size={40} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">결제에 실패했습니다</h1>
            <p className="text-gray-600 mb-8">
              결제 처리 중 문제가 발생했습니다. 아래 정보를 확인해주세요.
            </p>

            {/* 오류 정보 */}
            <div className="bg-red-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-red-900 mb-4">오류 정보</h3>
              <div className="space-y-3 text-sm text-left">
                {orderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문번호</span>
                    <span className="font-medium">{orderId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">오류 코드</span>
                  <span className="font-medium text-red-600">{code || 'UNKNOWN'}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="text-red-800 font-medium mb-2">
                    {getErrorMessage(code)}
                  </div>
                  <div className="text-red-600 text-xs">
                    {getSolution(code)}
                  </div>
                </div>
              </div>
            </div>

            {/* 다시 시도 안내 */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-4">💡 해결 방법</h3>
              <ul className="text-sm text-blue-800 space-y-2 text-left">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  카드 정보가 정확한지 확인해주세요
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  계좌 잔액이 충분한지 확인해주세요
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  다른 결제 수단을 시도해보세요
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  문제가 계속되면 고객센터에 문의해주세요
                </li>
              </ul>
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-4">
              <button
                onClick={() => router.push('/payment')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center"
              >
                <RefreshCw className="mr-2" size={20} />
                다시 결제하기
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => router.push('/')}
                  className="border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  <Home className="mr-2" size={18} />
                  홈으로
                </button>
                <button
                  onClick={() => router.push('/support')}
                  className="border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  <HelpCircle className="mr-2" size={18} />
                  고객센터
                </button>
              </div>
            </div>
          </div>

          {/* 고객 지원 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <h3 className="font-semibold text-gray-900 mb-2">도움이 필요하신가요?</h3>
            <p className="text-gray-600 text-sm mb-4">
              결제 관련 문제가 계속되면 고객 지원팀에 문의해주세요.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a 
                href="mailto:eo25.kr@gmail.com" 
                className="bg-blue-50 text-blue-700 py-3 px-4 rounded-lg text-sm font-medium hover:bg-blue-100 transition-all"
              >
                📧 이메일 문의
              </a>
              <a 
                href="tel:070-7701-7735" 
                className="bg-green-50 text-green-700 py-3 px-4 rounded-lg text-sm font-medium hover:bg-green-100 transition-all"
              >
                📞 전화 문의
              </a>
              <a 
                href="/faq" 
                className="bg-purple-50 text-purple-700 py-3 px-4 rounded-lg text-sm font-medium hover:bg-purple-100 transition-all"
              >
                ❓ FAQ 보기
              </a>
            </div>
          </div>

          {/* 결제 보안 안내 */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mt-8 text-center">
            <h4 className="font-semibold text-gray-900 mb-2">🔒 안전한 결제</h4>
            <p className="text-gray-600 text-sm">
              모든 결제는 토스페이먼츠의 보안 시스템을 통해 안전하게 처리됩니다.
              카드 정보는 저장되지 않으며, 개인정보는 암호화되어 보호됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">페이지를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentFailContent />
    </Suspense>
  );
} 
