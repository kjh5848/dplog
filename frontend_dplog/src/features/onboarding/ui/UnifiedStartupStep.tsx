'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Lightbulb, Rocket, TrendingUp, ArrowRight, 
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { OnboardingProgressHeader } from './components/OnboardingProgressHeader';

export const UnifiedStartupStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Step 1-1: Age Selection
  const [selectedAge, setSelectedAge] = useState<string | null>(null);

  // Step 1-2: Duration Selection
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedAge || !selectedDuration) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('age', selectedAge);
    params.set('duration', selectedDuration);

    // Route to Step 2: Detailed Checks
    router.push(`/02-check?${params.toString()}`);
  };

  const ageOptions = [
    { value: '20s', label: '20대' },
    { value: '30s', label: '30대' },
    { value: '40s', label: '40대' },
    { value: '50s_plus', label: '50대 이상' },
  ];

  const durationOptions = [
    {
      id: 'prospective',
      label: '예비 창업자',
      subLabel: '사업자 등록 전',
      icon: Lightbulb,
      value: 'prospective',
    },
    {
      id: 'early',
      label: '초기 창업자',
      subLabel: '1년 미만',
      icon: Rocket,
      value: 'early',
    },
    {
      id: 'growth',
      label: '도약기 창업자',
      subLabel: '3년 이상',
      icon: TrendingUp,
      value: 'growth',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full max-w-4xl mx-auto px-6 py-6 font-sans">
      <div className="w-full relative z-50 mb-8">
        <OnboardingProgressHeader currentPhase={1} />
      </div>
      
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
          창업 여정의 시작, <br className="md:hidden" /> 기본 정보를 알려주세요.
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          맞춤형 진단을 위해 연령대와 현재 창업 단계를 선택해주세요.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-12">
        {/* Section 1: Age Selection */}
        <div className="space-y-6">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-base font-bold">1</span>
             대표님의 연령대는 어떻게 되시나요?
           </h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             {ageOptions.map((option) => (
               <button
                 key={option.value}
                 onClick={() => setSelectedAge(option.value)}
                 className={cn(
                   "py-5 rounded-xl border-2 font-bold transition-all text-lg",
                   selectedAge === option.value
                     ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400"
                     : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                 )}
               >
                 {option.label}
               </button>
             ))}
           </div>
        </div>

        {/* Section 2: Duration Selection */}
        <div className="space-y-6">
           <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
             <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-base font-bold">2</span>
             현재 창업 단계는 어디에 해당하시나요?
           </h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {durationOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedDuration(option.value)}
                className={cn(
                  "group relative flex flex-col items-center justify-center p-6 gap-3 rounded-2xl border-2 cursor-pointer transition-all duration-200",
                  "bg-white dark:bg-slate-800",
                  selectedDuration === option.value
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400 shadow-md"
                    : "border-slate-100 dark:border-slate-700 hover:border-blue-300 hover:shadow-sm"
                )}
              >
                 <div className={cn(
                   "size-12 rounded-full flex items-center justify-center transition-colors mb-1",
                   selectedDuration === option.value
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                    : "bg-slate-50 dark:bg-slate-700 text-slate-400 group-hover:text-blue-500"
                 )}>
                    <option.icon className="w-6 h-6" />
                 </div>
                 <div className="text-center">
                   <p className={cn(
                     "font-bold transition-colors",
                     selectedDuration === option.value ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"
                   )}>
                     {option.label}
                   </p>
                   <p className="text-slate-500 dark:text-slate-400 text-xs">
                     {option.subLabel}
                   </p>
                 </div>
              </div>
            ))}
           </div>
        </div>
      </div>

      {/* Button */}
      <div className="flex justify-end w-full max-w-3xl mt-12">
        <button
          onClick={handleNext}
          disabled={!selectedAge || !selectedDuration}
          className={cn(
            "flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg transition-all",
            (selectedAge && selectedDuration)
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
          )}
        >
          다음 단계로
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
