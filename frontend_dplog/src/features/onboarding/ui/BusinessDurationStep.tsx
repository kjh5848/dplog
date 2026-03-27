'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lightbulb, Rocket, TrendingUp, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/button'; // Standard shadcn button (check if available, otherwise use standard HTML button or create one)
// If standard Button isn't available in verified paths, I'll use standard Tailwind classes.
// Assuming shared/ui/button exists or I can use basic styling. I will use basic styling to be safe or check imports.
// I'll use the GradientButton/ShinyButton styles or standard Tailwind for consistency.

export const BusinessDurationStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const funnel = searchParams.get('funnel'); // 'diagnosis' | 'ebook'

  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedDuration) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('duration', selectedDuration);

    // Ebook Funnel -> Nudge Strategy
    if (funnel === 'ebook') {
      const type = selectedDuration === 'prospective' ? 'prospective' : 'existing';
      router.push(`/nudge?${params.toString()}&type=${type}`);
      return;
    }

    // Diagnosis Funnel (or Default)
    if (selectedDuration === 'prospective') {
       // Prospective Track: Duration -> Business Status -> Knowledge Check -> Region
       router.push(`/01-status?${params.toString()}`);
    } else {
      // Existing Track: Duration -> Biz Knowledge Check -> Region
      router.push(`/01-biz-knowledge-check?${params.toString()}`);
    }
  };

  const options = [
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          창업하신 지 얼마나 되셨나요?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          {funnel === 'ebook' 
            ? '맞춤형 가이드북을 추천해 드립니다.' 
            : '사업 단계에 맞는 진단 리포트를 제공해 드립니다.'}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-10">
        {options.map((option) => (
          <div
            key={option.id}
            onClick={() => setSelectedDuration(option.value)}
            className={cn(
              "group relative flex flex-col items-center justify-center p-8 gap-4 rounded-2xl border-2 cursor-pointer transition-all duration-200",
              "bg-white dark:bg-slate-800",
              selectedDuration === option.value
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400"
                : "border-transparent shadow-sm hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"
            )}
          >
             {/* Selected Indicator (Optional Checkmark or visual cue) */}
             <div className={cn(
               "size-16 rounded-full flex items-center justify-center transition-colors mb-2",
               selectedDuration === option.value
                ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-slate-600 group-hover:text-blue-500"
             )}>
                <option.icon className="w-8 h-8" />
             </div>
             
             <div className="text-center">
               <p className={cn(
                 "text-lg font-bold mb-1 transition-colors",
                 selectedDuration === option.value ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"
               )}>
                 {option.label}
               </p>
               <p className="text-slate-500 dark:text-slate-400 text-sm">
                 {option.subLabel}
               </p>
             </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end w-full">
        <button
          onClick={handleNext}
          disabled={!selectedDuration}
          className={cn(
            "flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-all",
            selectedDuration
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105"
              : "bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed"
          )}
        >
          다음으로
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
