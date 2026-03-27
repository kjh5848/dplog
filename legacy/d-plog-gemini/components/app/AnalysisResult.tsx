import React from 'react';
import { motion } from 'framer-motion';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const AnalysisResult: React.FC<StepProps> = ({ onNext }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-2">
            <span className="font-black tracking-tighter text-xl">D-PLOG</span>
        </div>
        <div className="flex gap-4 text-sm font-medium text-gray-400">
            <span className="text-white">Dashboard</span>
            <span>Business Plan</span>
            <span>Grants</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-800"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-5xl">
            
          {/* Hero Result & CTA */}
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/10 text-white mb-6 border border-white/20">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <p className="text-gray-500 font-bold tracking-widest uppercase text-xs mb-4">Analysis Complete</p>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
                현재 대표님이 받을 수 있는 정부 지원금은<br/>
                총 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">45건</span> (약 <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">2.5억 원</span>)입니다.
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
                데이터 분석 결과, 지원 가능성이 매우 높은 매칭 결과입니다. <br/>
                지금 바로 사업계획서를 작성하고 자금을 확보하세요.
            </p>

            {/* CTA Moved to Top */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button onClick={onNext} className="bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-200 transition-transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    <span className="material-symbols-outlined">edit_document</span>
                    사업계획서 작성 시작
                </button>
                <button className="px-8 py-4 rounded-full font-bold border border-gray-600 hover:border-white hover:bg-white/10 transition-colors text-gray-300 hover:text-white">
                    전체 리스트 보기
                </button>
            </div>
          </motion.section>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-neutral-900 border border-gray-800 p-8 rounded-2xl relative overflow-hidden group hover:border-gray-600 transition-colors">
                <div className="absolute top-4 right-4 text-gray-800 group-hover:text-gray-700 transition-colors">
                    <span className="material-symbols-outlined text-8xl">list_alt</span>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <span className="material-symbols-outlined">analytics</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Total Opportunities</span>
                    </div>
                    <div className="text-5xl font-black mb-6">45 <span className="text-2xl font-medium text-gray-600">Cases</span></div>
                    <div className="inline-flex items-center gap-1 text-sm text-green-400">
                        <span className="material-symbols-outlined text-lg">trending_up</span>
                        <span>업종 평균 대비 +12% 더 많은 혜택</span>
                    </div>
                </div>
            </div>

            <div className="bg-neutral-900 border border-gray-800 p-8 rounded-2xl relative overflow-hidden group hover:border-gray-600 transition-colors">
                <div className="absolute top-4 right-4 text-gray-800 group-hover:text-gray-700 transition-colors">
                    <span className="material-symbols-outlined text-8xl">paid</span>
                </div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                        <span className="material-symbols-outlined">savings</span>
                        <span className="text-xs font-bold uppercase tracking-widest">Estimated Value</span>
                    </div>
                    <div className="text-5xl font-black mb-6">2.5 <span className="text-2xl font-medium text-gray-600">억 원</span></div>
                    <div className="inline-flex items-center gap-1 text-sm text-blue-400">
                        <span className="material-symbols-outlined text-lg">verified</span>
                        <span>높은 선정 확률</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
            <div className="bg-neutral-900 border border-gray-800 p-6 rounded-xl hover:bg-neutral-800 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">science</span>
                    </div>
                    <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">High Priority</span>
                </div>
                <h4 className="font-bold text-lg">R&D 지원금</h4>
                <p className="text-gray-500 text-sm">기술 개발 관련 2건</p>
            </div>
            <div className="bg-neutral-900 border border-gray-800 p-6 rounded-xl hover:bg-neutral-800 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">rocket_launch</span>
                    </div>
                </div>
                <h4 className="font-bold text-lg">초기 창업 패키지</h4>
                <p className="text-gray-500 text-sm">성장 지원 프로그램 1건</p>
            </div>
            <div className="bg-neutral-900 border border-gray-800 p-6 rounded-xl hover:bg-neutral-800 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">account_balance</span>
                    </div>
                    <span className="px-2 py-1 bg-white/10 rounded text-xs text-white">Volume</span>
                </div>
                <h4 className="font-bold text-lg">정책 자금/융자</h4>
                <p className="text-gray-500 text-sm">42건의 금융 지원 옵션</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AnalysisResult;