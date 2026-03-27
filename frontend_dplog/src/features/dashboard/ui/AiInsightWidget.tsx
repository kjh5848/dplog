import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ChevronRight } from 'lucide-react';

export const AiInsightWidget = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="p-8 rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-10 opacity-10">
        <Sparkles className="size-32" />
      </div>
      <div className="relative z-10 h-full flex flex-col">
        <div className="mb-6 flex items-center gap-2">
          <div className="size-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
            <Sparkles className="size-4" />
          </div>
          <span className="font-bold text-sm uppercase tracking-widest">AI Insight</span>
        </div>
        <h3 className="text-2xl font-black mb-6 leading-tight">
          이번 주 매장 노출도가<br/>급증할 것으로 예상됩니다.
        </h3>
        <p className="text-blue-100/80 text-sm leading-relaxed mb-8">
          주변 500m 내 경쟁 매장 3곳의 활동이 일시적으로 감소했습니다. 지금 '인기 메뉴' 사진을 업데이트하면 상위 노출 기회를 잡을 수 있습니다.
        </p>
        <div className="mt-auto">
          <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10">
            추천 액션 실행하기
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
