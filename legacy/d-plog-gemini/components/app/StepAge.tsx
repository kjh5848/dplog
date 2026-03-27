import React from 'react';
import { motion } from 'framer-motion';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const StepAge: React.FC<StepProps> = ({ onNext, onBack }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="font-black tracking-tighter text-xl">D-PLOG</span>
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-white transition-colors">Exit</button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="mb-12">
            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-500 text-sm uppercase tracking-widest">Step 3 of 4</span>
              <span className="text-white text-sm font-bold">75%</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-white w-3/4"></div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-4">대표님의 연령대는?</h1>
            <p className="text-gray-400">정부 지원사업 매칭을 위해 필요한 정보입니다.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <label className="relative cursor-pointer group">
                <input type="radio" name="age" className="peer sr-only" />
                <div className="h-full flex flex-col items-start p-8 rounded-xl border border-gray-800 bg-neutral-900 transition-all duration-300 hover:bg-neutral-800 peer-checked:border-white peer-checked:bg-neutral-800">
                    <div className="mb-6 p-3 rounded-lg bg-neutral-800 text-white w-fit">
                        <span className="material-symbols-outlined text-3xl">face_6</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">만 39세 이하</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">청년 창업 우대 혜택을<br/>받을 수 있습니다.</p>
                </div>
            </label>

            <label className="relative cursor-pointer group">
                <input type="radio" name="age" className="peer sr-only" />
                <div className="h-full flex flex-col items-start p-8 rounded-xl border border-gray-800 bg-neutral-900 transition-all duration-300 hover:bg-neutral-800 peer-checked:border-white peer-checked:bg-neutral-800">
                    <div className="mb-6 p-3 rounded-lg bg-neutral-800 text-white w-fit">
                        <span className="material-symbols-outlined text-3xl">psychology</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">만 39세 초과</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">일반 창업 및 중장년 기술창업<br/>지원을 매칭해드립니다.</p>
                </div>
            </label>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900 border border-gray-800">
            <span className="material-symbols-outlined text-gray-500 text-xl">info</span>
            <p className="text-sm text-gray-400 leading-relaxed">
                <strong className="text-white">Tip:</strong> 만 39세는 '청년창업사관학교' 등 주요 정부 지원사업의 청년 우대 기준이 되는 중요한 나이입니다.
            </p>
          </div>

          <div className="mt-12 flex justify-between">
            <button onClick={onBack} className="px-6 py-3 text-gray-500 hover:text-white transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">arrow_back</span> 이전
            </button>
            <button onClick={onNext} className="bg-white text-black px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                분석 결과 보기 <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StepAge;