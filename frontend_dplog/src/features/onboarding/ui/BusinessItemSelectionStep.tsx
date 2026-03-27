'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Utensils, Coffee, Beer, ShoppingBag, Store, MoreHorizontal, ChefHat, Truck, ShoppingBag as TakeoutIcon, FileText } from 'lucide-react'; // Icons
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

export const BusinessItemSelectionStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Selections
  const [category, setCategory] = useState<string | null>(null);
  const [operationType, setOperationType] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [needs, setNeeds] = useState<string[]>([]);

  const handleNext = () => {
    if (!category || !operationType || !experience || !budget) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('category', category);
    params.set('operation_type', operationType);
    params.set('experience', experience);
    params.set('budget', budget);
    params.set('needs', needs.join(','));

    // Route to Completion or Plan Generation
    router.push(`/complete?${params.toString()}`);
  };

  const categories = [
    { id: 'korean', label: '한식', icon: Utensils },
    { id: 'western', label: '양식', icon: Utensils },
    { id: 'chinese', label: '중식', icon: Utensils },
    { id: 'japanese', label: '일식', icon: Utensils },
    { id: 'cafe', label: '카페/디저트', icon: Coffee },
    { id: 'pub', label: '주점', icon: Beer },
    { id: 'bunsik', label: '분식', icon: Utensils },
    { id: 'asian', label: '아시안', icon: Utensils },
  ];

  const operationTypes = [
    { id: 'hall', label: '매장 식사 위주', icon: Utensils },
    { id: 'delivery', label: '배달 위주', icon: Truck },
    { id: 'takeout', label: '포장 위주', icon: TakeoutIcon },
  ];

  const experienceLevels = [
    '없음',
    '1년 미만',
    '1~3년',
    '3년 이상',
  ];
  
  const budgetRanges = [
    '3천만원 이하',
    '3천~5천만원',
    '5천~1억원',
    '1억원~2억원',
    '2억원 이상',
  ];

  const needOptions = [
    { id: 'menu', label: '메뉴 구성/레시피', icon: ChefHat },
    { id: 'interior', label: '인테리어/리모델링', icon: Store },
    { id: 'equipment', label: '주방설비/POS', icon: Utensils },
    { id: 'marketing', label: '홍보/마케팅', icon: MoreHorizontal },
    { id: 'admin', label: '인허가/행정절차', icon: FileText },
  ];

  const isFormComplete = category && operationType && experience && budget && needs.length > 0;

  const toggleNeed = (id: string) => {
    setNeeds(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          어떤 외식업 창업을 계획 중이신가요?
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          사장님의 계획에 맞춰 최적의 상권과 아이템을 분석해드립니다.
        </p>
      </div>

      <div className="w-full space-y-10">
        {/* Section 1: Category */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
            희망 업종 선택 <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((item) => (
              <button
                key={item.id}
                onClick={() => setCategory(item.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all gap-2",
                  category === item.id
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-slate-100 hover:border-blue-100 bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Section 2: Operation Type */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">2</span>
            주요 운영 방식 <span className="text-red-500">*</span>
          </h2>
          <div className="flex gap-3">
            {operationTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setOperationType(type.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 font-bold transition-all",
                  operationType === type.id
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-slate-100 hover:border-blue-100 bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                )}
              >
                <type.icon className="w-5 h-5" />
                {type.label}
              </button>
            ))}
          </div>
        </section>

        {/* Section 3: Experience & Budget (Two Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Experience */}
           <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">3</span>
              관련 경험 <span className="text-red-500">*</span>
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {experienceLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => setExperience(level)}
                  className={cn(
                    "py-3 rounded-lg border-2 font-medium text-sm transition-all",
                    experience === level
                      ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-slate-100 hover:border-blue-100 bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </section>

          {/* Budget */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">4</span>
              창업 예상 자금 <span className="text-red-500">*</span>
            </h2>
             <div className="flex flex-wrap gap-2">
              {budgetRanges.map((range) => (
                <button
                  key={range}
                  onClick={() => setBudget(range)}
                  className={cn(
                    "px-4 py-2 rounded-full border-2 text-sm font-medium transition-all",
                    budget === range
                      ? "border-blue-500 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      : "border-slate-100 hover:border-blue-100 bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                  )}
                >
                  {range}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Section 4: Critical Needs */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">5</span>
            가장 고민되는 분야 (복수 선택 가능) <span className="text-red-500">*</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {needOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleNeed(option.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-4 px-2 rounded-xl border-2 transition-all gap-2 h-24",
                  needs.includes(option.id)
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "border-slate-100 hover:border-blue-100 bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                )}
              >
                <option.icon className="w-5 h-5" />
                <span className="text-sm font-bold break-keep word-break-keep">{option.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="w-full max-w-3xl mt-12">
        <Button
          onClick={handleNext}
          disabled={!isFormComplete}
          size="lg"
          className="w-full h-14 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
        >
          {isFormComplete ? '진단 결과 보기' : '모든 항목을 선택해주세요'}
          <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
