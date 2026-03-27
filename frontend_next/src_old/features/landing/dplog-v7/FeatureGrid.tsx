import React from "react";
import { Search, FileText, CheckCircle } from "lucide-react";

export default function FeatureGrid() {
  return (
    <section className="py-32 bg-[#F7F8F9]">
        <div className="container mx-auto px-6">
            <div className="text-center mb-20">
                <h2 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
                    사장님의 궁금증, 데이터로 풀어드립니다.
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    감으로 하는 마케팅은 이제 그만. D-PLOG는 정확한 데이터와 AI 분석을 통해<br className="hidden md:block" />
                    매장 성장의 확실한 로드맵을 제시합니다.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl mb-8 flex items-center justify-center text-blue-600">
                        <Search size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">실시간 순위 진단</h3>
                    <p className="text-gray-500 leading-relaxed text-lg">
                        대표 키워드 검색 시 우리 가게가 몇 위에 노출되는지, 10분 내에 정확하게 확인해 드립니다.
                    </p>
                 </div>
                  <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl mb-8 flex items-center justify-center text-purple-600">
                        <FileText size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">원인 분석 리포트</h3>
                    <p className="text-gray-500 leading-relaxed text-lg">
                        단순 순위 확인을 넘어, 왜 순위가 낮은지 경쟁사와의 비교 분석을 통해 근거를 제시합니다.
                    </p>
                 </div>
                  <div className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="w-14 h-14 bg-green-50 rounded-2xl mb-8 flex items-center justify-center text-green-600">
                        <CheckCircle size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">실행형 액션 플랜</h3>
                    <p className="text-gray-500 leading-relaxed text-lg">
                        &quot;그래서 뭘 해야 하죠?&quot; 오늘 당장 실행할 수 있는 개선 항목을 우선순위별로 알려드립니다.
                    </p>
                 </div>
            </div>
        </div>
    </section>
  );
}
