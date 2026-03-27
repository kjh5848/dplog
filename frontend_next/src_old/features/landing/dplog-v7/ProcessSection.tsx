import React from "react";

export default function ProcessSection() {
  return (
    <section className="py-32 bg-white">
         <div className="container mx-auto px-6">
            <div className="text-center mb-20">
                 <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wide">User Journey</span>
                 </div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-6">
                    복잡한 마케팅, <br/>
                    <span className="text-gray-400">3단계로 단순하게 정리했습니다.</span>
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <div className="aspect-[4/5] bg-[#F7F8F9] rounded-[40px] relative overflow-hidden group cursor-pointer border border-gray-100">
                    <div className="absolute top-10 left-10 right-10 bottom-0 overflow-hidden rounded-t-2xl shadow-2xl border border-gray-200 bg-white translate-y-8 group-hover:translate-y-4 transition-transform duration-500">
                        {/* Mock UI */}
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-400/20" />
                             <div className="w-3 h-3 rounded-full bg-yellow-400/20" />
                             <div className="w-3 h-3 rounded-full bg-green-400/20" />
                        </div>
                        <div className="p-6">
                            <div className="h-4 w-1/2 bg-gray-100 rounded mb-4" />
                            <div className="h-24 w-full bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-sm">
                                플레이스 URL 입력
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 p-8 text-white">
                         <div className="bg-white/20 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white font-bold border border-white/20">1</div>
                        <h3 className="text-2xl font-bold mb-2">가게 정보 입력</h3>
                        <p className="text-white/70 text-sm leading-relaxed">플레이스 URL과 희망 키워드만 입력하면 진단 준비 끝.</p>
                    </div>
                </div>

                 {/* Step 2 */}
                 <div className="aspect-[4/5] bg-[#F7F8F9] rounded-[40px] relative overflow-hidden group cursor-pointer border border-gray-100">
                    <div className="absolute top-10 left-10 right-10 bottom-0 overflow-hidden rounded-t-2xl shadow-2xl border border-gray-200 bg-white translate-y-8 group-hover:translate-y-4 transition-transform duration-500">
                        {/* Mock UI */}
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-400/20" />
                             <div className="w-3 h-3 rounded-full bg-yellow-400/20" />
                             <div className="w-3 h-3 rounded-full bg-green-400/20" />
                        </div>
                        <div className="p-6 space-y-3">
                             <div className="flex justify-between items-center bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <span className="text-sm font-bold text-blue-700">강남역 카페</span>
                                <span className="text-sm font-bold text-blue-600">3위 ▲</span>
                             </div>
                             <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <span className="text-sm text-gray-500">직장인 점심</span>
                                <span className="text-sm text-gray-400">12위 -</span>
                             </div>
                        </div>
                    </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 p-8 text-white">
                        <div className="bg-white/20 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white font-bold border border-white/20">2</div>
                        <h3 className="text-2xl font-bold mb-2">AI 심층 진단</h3>
                        <p className="text-white/70 text-sm leading-relaxed">경쟁사 비교 분석을 통해 순위 하락의 원인을 찾아냅니다.</p>
                    </div>
                </div>

                 {/* Step 3 */}
                 <div className="aspect-[4/5] bg-[#F7F8F9] rounded-[40px] relative overflow-hidden group cursor-pointer border border-gray-100">
                    <div className="absolute top-10 left-10 right-10 bottom-0 overflow-hidden rounded-t-2xl shadow-2xl border border-gray-200 bg-white translate-y-8 group-hover:translate-y-4 transition-transform duration-500">
                        {/* Mock UI */}
                        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                             <div className="w-3 h-3 rounded-full bg-red-400/20" />
                             <div className="w-3 h-3 rounded-full bg-yellow-400/20" />
                             <div className="w-3 h-3 rounded-full bg-green-400/20" />
                        </div>
                         <div className="p-6">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div>
                                <div className="text-sm text-gray-600">대표 사진 3장 교체하기</div>
                            </div>
                             <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-xs">✓</div>
                                <div className="text-sm text-gray-600">영수증 리뷰 키워드 추가</div>
                            </div>
                        </div>
                    </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 p-8 text-white">
                        <div className="bg-white/20 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white font-bold border border-white/20">3</div>
                        <h3 className="text-2xl font-bold mb-2">실행 및 개선</h3>
                        <p className="text-white/70 text-sm leading-relaxed">오늘 바로 실행할 수 있는 체크리스트로 매출을 올리세요.</p>
                    </div>
                </div>
            </div>
         </div>
    </section>
  );
}
