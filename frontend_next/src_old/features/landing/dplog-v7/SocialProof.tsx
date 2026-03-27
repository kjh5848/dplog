import React from "react";
import { Coffee, Utensils, Beer, Store } from "lucide-react";

export default function SocialProof() {
  return (
    <section className="py-20 bg-[#F7F8F9] text-center border-b border-gray-200">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16 px-6">
            <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">20,000+</div>
                <div className="text-sm text-gray-500 font-medium">분석된 매장 수</div>
            </div>
            <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">12.5위</div>
                <div className="text-sm text-gray-500 font-medium">평균 순위 상승</div>
            </div>
             <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">98%</div>
                <div className="text-sm text-gray-500 font-medium">사용자 만족도</div>
            </div>
             <div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Free</div>
                <div className="text-sm text-gray-500 font-medium">초기 진단 비용</div>
            </div>
        </div>

        <p className="text-sm font-bold text-gray-400 mb-10 uppercase tracking-wider">
            Trusted by 500+ Local Businesses
        </p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex items-center gap-2 text-gray-500 font-semibold text-lg">
                <Coffee size={24} /> Cafe Onion
            </div>
             <div className="flex items-center gap-2 text-gray-500 font-semibold text-lg">
                <Utensils size={24} /> Geum-Dwaeji
            </div>
             <div className="flex items-center gap-2 text-gray-500 font-semibold text-lg">
                <Beer size={24} /> Magpie Brewing
            </div>
             <div className="flex items-center gap-2 text-gray-500 font-semibold text-lg">
                <Store size={24} /> London Bagel
            </div>
        </div>
    </section>
  );
}
