'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckSquare, Coins, Store, Users, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const BizKnowledgeCheckStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('biz_knowledge_score', checkedItems.length.toString());
    // Proceed to Region Selection as per original flow
    router.push(`/02-region?${params.toString()}`);
  };

  const handleBack = () => {
    router.back();
  };

  const checklistItems = [
    {
      id: 'biz_fund_1',
      label: '일반경영안정자금 (운전 자금)',
      description: '경영 애로 해소를 위한 소상공인 정책자금',
      icon: Coins
    },
    {
      id: 'biz_fund_2',
      label: '소상공인 대환대출',
      description: '고금리 대출을 저금리 정책자금으로 전환',
      icon: Coins
    },
    {
      id: 'biz_growth_1',
      label: '스마트상점 기술보급사업',
      description: '키오스크, 서빙로봇 등 스마트 기술 도입 비용 지원',
      icon: Store
    },
    {
      id: 'biz_growth_2',
      label: '백년가게 / 강한 소상공인',
      description: '우수 소상공인을 위한 브랜딩 및 마케팅 지원',
      icon: Store
    },
    {
      id: 'labor_support',
      label: '두루누리 사회보험료 지원',
      description: '근로자 4대 보험료 부담을 줄여주는 제도',
      icon: Users
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          우리 매장에 맞는<br className="md:hidden" /> 지원사업을 알고 계신가요?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          이미 알고 있거나 활용 중인 제도가 있다면 체크해주세요.<br/>
          놓치고 있는 혜택이 있다면 리포트에서 알려드릴게요.
        </p>
      </div>

      {/* Checklist */}
      <div className="w-full space-y-4 mb-10">
        {checklistItems.map((item) => (
          <motion.div
            key={item.id}
            onClick={() => handleToggle(item.id)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "flex items-start p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none",
              "bg-white dark:bg-slate-800",
              checkedItems.includes(item.id)
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400"
                : "border-slate-200 dark:border-slate-700 hover:border-blue-300"
            )}
          >
            <div className={cn(
              "flex-shrink-0 mr-4 mt-0.5 w-6 h-6 rounded border flex items-center justify-center transition-colors",
              checkedItems.includes(item.id)
                ? "bg-blue-500 border-blue-500 text-white"
                : "border-slate-300 bg-white dark:bg-slate-700 dark:border-slate-600"
            )}>
              {checkedItems.includes(item.id) && <CheckSquare className="w-4 h-4" />}
            </div>
            
            <div className="flex-1">
              <h3 className={cn(
                "font-bold text-lg mb-1 transition-colors flex items-center gap-2",
                checkedItems.includes(item.id) ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"
              )}>
                {item.label}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3 inline" /> {item.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex justify-between w-full border-t border-slate-200 dark:border-slate-800 pt-6">
        <button
          onClick={handleBack}
          className="px-6 py-3 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
        >
          다음 단계
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
