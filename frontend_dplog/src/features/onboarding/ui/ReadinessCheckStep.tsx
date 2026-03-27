'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckSquare, Square } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const ReadinessCheckStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const handleNext = () => {
    // Navigate to complete
    const params = new URLSearchParams(searchParams.toString());
    params.set('readiness_score', checkedItems.length.toString());
    router.push(`/complete?${params.toString()}`);
  };

  const handleBack = () => {
    router.back();
  };

  const toggleItem = (id: string) => {
    setCheckedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const checklist = [
    { id: 'item1', label: '창업할 아이템과 메뉴가 확정되었나요?' },
    { id: 'item2', label: '목표 상권과 입지 분석을 해보셨나요?' },
    { id: 'item3', label: '초기 창업 자금 계획을 세우셨나요?' },
    { id: 'item4', label: '동업자나 직원 채용 계획이 있으신가요?' },
    { id: 'item5', label: '관련 법규나 인허가 절차를 확인하셨나요?' },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-3xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          창업 준비 상태를 체크해보세요
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          현재 준비된 항목을 모두 선택해주세요.<br className="hidden md:block"/>
          체크리스트를 바탕으로 부족한 부분을 채워드릴 가이드를 드립니다.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full max-w-2xl mb-10">
        {checklist.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => toggleItem(item.id)}
            className={cn(
              "flex items-center gap-4 p-5 rounded-xl border transition-all cursor-pointer",
              checkedItems.includes(item.id)
                ? "bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500 shadow-md"
                : "bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 hover:border-blue-300"
            )}
          >
            <div className={cn(
              "flex-shrink-0 transition-colors",
              checkedItems.includes(item.id) ? "text-blue-600 dark:text-blue-400" : "text-slate-300 dark:text-slate-600"
            )}>
              {checkedItems.includes(item.id) ? (
                <CheckSquare className="w-6 h-6" />
              ) : (
                <Square className="w-6 h-6" />
              )}
            </div>
            <span className={cn(
              "text-lg font-medium transition-colors",
              checkedItems.includes(item.id) ? "text-blue-900 dark:text-blue-100" : "text-slate-700 dark:text-slate-300"
            )}>
              {item.label}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-between w-full max-w-2xl border-t border-slate-200 dark:border-slate-800 pt-6">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
        >
          진단 완료하기
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
