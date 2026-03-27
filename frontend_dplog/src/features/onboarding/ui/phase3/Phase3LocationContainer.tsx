'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import { AIAnalyzingLoader } from './AIAnalyzingLoader';
import { AIReportView } from './AIReportView';
import { OnboardingProgressHeader } from '../components/OnboardingProgressHeader';

export const Phase3LocationContainer = () => {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  const handleNext = () => {
    alert('상권 분석 완료! 다음 단계인 계약 방어는 대시보드에서 진행해주세요.');
    router.push('/dashboard');
  };

  const handleBack = () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-full min-h-screen flex flex-col font-sans">
      <div className="w-full relative z-50 pt-6">
        <OnboardingProgressHeader currentPhase={3} />
      </div>

      <div className="w-full max-w-4xl mx-auto flex flex-col pt-4 md:pt-8 relative animate-in fade-in duration-500">
      
        {isAnalyzing ? (
        <AIAnalyzingLoader onComplete={() => setIsAnalyzing(false)} />
      ) : (
        <>
          {/* Title Area */}
          <div className="text-center py-4 md:py-6 mb-8 border-b border-slate-200 dark:border-slate-800 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4 shadow-inner">
              <MapPin className="w-6 h-6" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500 mb-2">
              입체적 상권 분석 완료
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
              책상물림은 끝났습니다. 현장 데이터 교차 검증결과를 확인하세요.
            </p>
          </div>
          
          {/* Content Area */}
          <div className="flex-1 w-full">
            <AIReportView />
          </div>

          {/* Navigation Footer */}
          <div className="mt-8 pt-6 pb-12 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center w-full max-w-xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500 fill-mode-both">
            <button
              onClick={handleBack}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              대시보드로
            </button>
            <button
              onClick={handleNext}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-blue-600/20"
            >
              미션 완료 
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
    </div>
  );
};
