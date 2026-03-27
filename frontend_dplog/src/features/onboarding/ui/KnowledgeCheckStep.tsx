'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckSquare, Info } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const KnowledgeCheckStep = () => {
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
    params.set('knowledge_score', checkedItems.length.toString());
    // Proceed to Region Selection (Skip Intro)
    router.push(`/04-region?${params.toString()}`);
  };

  const handleBack = () => {
    router.back();
  };

  const checklistItems = [
    {
      id: 'lease_law',
      label: '상가임대차보호법 (10년 갱신요구권)',
      description: '임대료 인상 상한(5%)과 계약 갱신 요구권에 대한 이해'
    },
    {
      id: 'fire_safety',
      label: '다중이용업소 소방필증 (안전시설등 완비증명)',
      description: '일정 면적/층수 이상의 음식점 개업 시 필수 조건'
    },
    {
      id: 'tax_info',
      label: '일반과세자와 간이과세자의 차이',
      description: '부가세 환급(일반)과 낮은 세율(간이) 중 나에게 유리한 유형'
    },
    {
      id: 'fund_loan',
      label: '소상공인 정책자금 (저금리 대출)',
      description: '시중은행보다 낮은 금리로 이용 가능한 정부 지원 자금'
    },
    {
      id: 'guarantee',
      label: '지역신용보증재단 창업특례보증',
      description: '담보가 부족해도 보증서를 발급받아 대출받는 제도'
    },
    {
      id: 'health_cert',
      label: '보건증 (건강진단결과서) 발급',
      description: '식품 위생 분야 종사자라면 반드시 갖춰야 할 필수 서류'
    },
    {
      id: 'hygiene_edu',
      label: '신규 영업자 위생교육 (필수)',
      description: '한국외식업중앙회 등에서 실시하는 6시간 필수 교육 이수'
    },
    {
      id: 'labor_law',
      label: '근로계약서 작성 및 주휴수당',
      description: '아르바이트 채용 시 꼭 알아야 할 기초 노동법 상식'
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          이런 정보들을<br className="md:hidden" /> 알고 계신가요?
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          들어보거나 알고 있는 내용이 있다면 체크해주세요.<br/>
          몰라도 괜찮습니다. 진단 리포트에서 상세히 알려드릴게요.
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
                "font-bold text-lg mb-1 transition-colors",
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
