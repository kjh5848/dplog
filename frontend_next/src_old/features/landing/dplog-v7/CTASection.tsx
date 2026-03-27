import React from "react";

export default function CTASection() {
  return (
    <section className="py-32 bg-black text-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
                데이터로 증명하는 <br/>
                <span className="text-gray-400">매장 성장의 시작</span>
            </h2>
            <p className="text-gray-400 mb-12 text-lg">
                지금 바로 우리 가게의 노출 순위를 무료로 진단해보세요.
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center max-w-4xl mx-auto">
                <div className="flex-1 bg-white text-black p-10 rounded-[32px] text-left">
                     <h3 className="text-2xl font-bold mb-2">Basic</h3>
                     <p className="text-gray-500 mb-8">가볍게 시작하는 무료 진단</p>
                     <ul className="space-y-3 mb-10 text-sm font-medium">
                        <li>• 실시간 순위 조회</li>
                        <li>• 기본 순위 리포트</li>
                        <li>• 키워드 유효성 검사</li>
                     </ul>
                     <button className="w-full py-4 bg-black text-white rounded-full font-bold hover:bg-gray-800 transition-colors">무료 진단하기</button>
                </div>
                 <div className="flex-1 bg-[#1A1A1A] text-white p-10 rounded-[32px] text-left border border-white/10 relative overflow-hidden">
                     <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                     <h3 className="text-2xl font-bold mb-2">Pro</h3>
                     <p className="text-gray-400 mb-8">매출 상승을 위한 정밀 분석</p>
                     <ul className="space-y-3 mb-10 text-sm font-medium text-gray-300">
                        <li>• 경쟁사 비교 분석</li>
                        <li>• 실행형 액션 플랜 제공</li>
                        <li>• 주간 순위 변동 알림</li>
                     </ul>
                     <button className="w-full py-4 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors">프로 플랜 시작하기 ↗</button>
                </div>
            </div>
        </div>
    </section>
  );
}
