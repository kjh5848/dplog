'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Utensils, Coffee, Beer, ShoppingBag, Store, MoreHorizontal } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const IndustrySelectionStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedIndustry) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('industry', selectedIndustry);
    router.push(`/readiness-check?${params.toString()}`);
  };

  const handleBack = () => {
    router.back();
  };

  const industries = [
    { id: 'restaurant', label: '일반 음식점', icon: Utensils },
    { id: 'cafe', label: '카페 / 디저트', icon: Coffee },
    { id: 'pub', label: '주점 / 호프', icon: Beer },
    { id: 'retail', label: '소매 / 유통', icon: ShoppingBag },
    { id: 'service', label: '서비스업', icon: Store },
    { id: 'other', label: '기타', icon: MoreHorizontal },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          어떤 업종을 계획 중이신가요?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          가장 관심 있거나 준비 중인 업종을 하나만 선택해주세요.<br className="hidden md:block"/>
          업종별 맞춤형 체크리스트를 제공해 드립니다.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-3xl mb-10">
        {industries.map((item) => (
          <motion.div
            key={item.id}
            onClick={() => setSelectedIndustry(item.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "group relative flex flex-col items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 aspect-[1.2/1]",
              "bg-white dark:bg-slate-800",
              selectedIndustry === item.id
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400"
                : "border-transparent border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-lg"
            )}
          >
            {selectedIndustry === item.id && (
              <div className="absolute top-3 right-3 text-blue-500 dark:text-blue-400">
                <CheckCircle className="w-5 h-5" />
              </div>
            )}
            
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-sm mb-4 transition-colors",
              selectedIndustry === item.id
                ? "bg-white dark:bg-slate-800 text-blue-500"
                : "bg-slate-100 dark:bg-slate-700 text-slate-400 group-hover:text-blue-500"
            )}>
              <item.icon className="w-7 h-7" />
            </div>

            <p className={cn(
              "text-lg font-bold transition-colors",
              selectedIndustry === item.id ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"
            )}>
              {item.label}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between w-full max-w-3xl border-t border-slate-200 dark:border-slate-800 pt-6">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedIndustry}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all",
            selectedIndustry
              ? "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30"
              : "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
          )}
        >
          다음 단계
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
