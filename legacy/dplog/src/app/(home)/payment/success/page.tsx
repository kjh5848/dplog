"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Download, Home, CreditCard } from "lucide-react";
import { useTossPaymentsViewModel } from "@/src/viewModel/price/useTossPaymentsViewModel";
import { logError } from "@/src/utils/logger";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import { customLoading } from "@/src/utils/loading";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const paymentKey = searchParams.get('paymentKey');
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');

  const { confirmPayment } = useTossPaymentsViewModel();
  const [isConfirming, setIsConfirming] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const confirmingOverlay = useMemo(
    () => customLoading("결제 승인을 확인하고 있습니다.", "lg"),
    []
  );

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      if (!paymentKey || !orderId || !amount) {
        setError('결제 정보가 올바르지 않습니다.');
        setIsConfirming(false);
        return;
      }

      try {
        // 토스페이먼츠에서 전달받은 데이터로 결제 승인 요청
        await confirmPayment({
          paymentKey,
          orderId,
          amount: parseInt(amount)
        });

        setPaymentInfo({
          paymentKey,
          orderId,
          amount: parseInt(amount),
          approvedAt: new Date().toISOString()
        });

      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('Payment confirmation error:', errorObj);
        setError('결제 승인 중 오류가 발생했습니다.');
      } finally {
        setIsConfirming(false);
      }
    };

    handlePaymentSuccess();
  }, [paymentKey, orderId, amount, confirmPayment]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  if (isConfirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-primary-50 pt-24">
        <GlobalLoadingOverlay
          visible
          config={{
            ...confirmingOverlay,
            subMessage: "결제 정보를 확인하는 중입니다.",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-red-50 to-red-100 pt-24">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="text-red-600" size={32} />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">결제 승인 실패</h1>
              <p className="text-gray-600 mb-8">{error}</p>
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/payment')}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  결제 페이지로 돌아가기
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-emerald-100 pt-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* 성공 메시지 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center mb-8">
            <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">🎉 결제가 완료되었습니다!</h1>
            <p className="text-gray-600 mb-8">
              구독이 활성화되었습니다. 지금부터 모든 기능을 이용하실 수 있습니다.
            </p>

            {/* 결제 정보 */}
            {paymentInfo && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">결제 정보</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">주문번호</span>
                    <span className="font-medium">{paymentInfo.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제금액</span>
                    <span className="font-medium text-blue-600">₩{formatPrice(paymentInfo.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제일시</span>
                    <span className="font-medium">{formatDate(paymentInfo.approvedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">결제키</span>
                    <span className="font-medium text-xs">{paymentInfo.paymentKey}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 다음 단계 안내 */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-4">다음 단계</h3>
              <ul className="text-sm text-blue-800 space-y-2 text-left">
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  순위 추적하기 페이지에서 가게를 등록해보세요
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  키워드를 설정하고 순위 추적을 시작하세요
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  매일 오전 9시에 순위 리포트를 받아보세요
                </li>
              </ul>
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-4">
              <button
                onClick={() => router.push('/realtime')}
                className="w-full bg-gradient-to-r from-[#25e4ff] to-[#0284c7] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all transform hover:scale-105 flex items-center justify-center"
              >
                <CreditCard className="mr-2" size={20} />
                순위 추적 시작하기
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
                  onClick={() => window.print()}
                  className="border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                  <Download className="mr-2" size={18} />
                  영수증 출력
                </button>
              </div>
            </div>
          </div>

          {/* 고객 지원 정보 */}
          <div className="bg-white rounded-lg p-6 shadow-sm text-center">
            <h3 className="font-semibold text-gray-900 mb-2">문의사항이 있으신가요?</h3>
            <p className="text-gray-600 text-sm mb-4">
              24시간 고객 지원팀이 도와드리겠습니다.
            </p>
            <div className="flex justify-center space-x-4">
              <a 
                href="mailto:eo25.kr@gmail.com" 
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                이메일 문의
              </a>
              <a 
                href="tel:070-7701-7735" 
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                전화 문의
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-primary-50 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">페이지를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} 
