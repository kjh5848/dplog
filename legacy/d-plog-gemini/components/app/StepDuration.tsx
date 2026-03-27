import React from 'react';
import { motion } from 'framer-motion';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const StepDuration: React.FC<StepProps> = ({ onNext, onBack }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="font-black tracking-tighter text-xl">D-PLOG</span>
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-white transition-colors">Exit</button>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-3xl">
          {/* Progress */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-500 text-sm uppercase tracking-widest">Step 1 of 4</span>
              <span className="text-white text-sm font-bold">25%</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/4"></div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">창업하신 지 얼마나 되셨나요?</h1>
            <p className="text-gray-400">맞춤형 정부 지원사업과 로드맵을 추천해 드립니다.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {[
                { icon: "emoji_objects", title: "예비 창업자", desc: "사업자 등록 전", val: "prospective" },
                { icon: "rocket_launch", title: "초기 창업자", desc: "1년 미만", val: "early" },
                { icon: "trending_up", title: "도약기 창업자", desc: "3년 미만", val: "growth" }
             ].map((item, idx) => (
                <label key={idx} className="group relative cursor-pointer">
                    <input type="radio" name="duration" className="peer sr-only" />
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl flex flex-col items-center text-center transition-all duration-300 hover:bg-neutral-800 peer-checked:border-white peer-checked:bg-neutral-800 h-full">
                        <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-6 text-gray-400 group-hover:text-white peer-checked:text-white peer-checked:bg-neutral-700 transition-colors">
                            <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                        <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                </label>
             ))}
          </div>

          <div className="mt-12 flex justify-between">
            <button onClick={onBack} className="px-6 py-3 text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span> 이전
            </button>
            <button onClick={onNext} className="bg-white text-black px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                다음으로 <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StepDuration;