'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, CheckCircle, FileText, RefreshCw, User, 
  CheckSquare, Coins, Store, Users, ArrowLeft
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const DetailedCheckStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const duration = searchParams.get('duration');
  const age = searchParams.get('age');

  // Prospective Sub-questions
  const [bizHistory, setBizHistory] = useState<string | null>(null); // 'first' | 're'
  const [bizRegStatus, setBizRegStatus] = useState<string | null>(null); // 'none' | 'exist'

  // Existing Sub-questions
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  // Validation
  const isValid = duration === 'prospective' 
    ? (bizHistory && bizRegStatus) 
    : true; // Checkbox selection is optional for existing users

  const handleNext = () => {
    if (!isValid) return;

    const params = new URLSearchParams(searchParams.toString());

    if (duration === 'prospective') {
      params.set('biz_history', bizHistory!);
      params.set('biz_reg_status', bizRegStatus!);
      // Prospective: Step 2 -> Step 3 (Knowledge Check) or directly to plan intro depending on flow
      // Based on original flow: 01-status -> 02-knowledge-check
      router.push(`/02-knowledge-check?${params.toString()}`);
    } else {
      // Existing: Step 2 -> Step 3 (Region)
      // Based on original flow: 01-biz-check -> 02-region
      params.set('biz_knowledge_score', checkedItems.length.toString());
      router.push(`/02-region?${params.toString()}`);
    }
  };

  const activeUserTitle = duration === 'prospective' 
    ? "예비 사장님을 위한 맞춤 진단" 
    : "사장님을 위한 맞춤 진단";

  const existingChecklist = [
    { id: 'biz_fund_1', label: '일반경영안정자금 (운전 자금)', description: '소상공인 정책자금', icon: Coins },
    { id: 'biz_fund_2', label: '소상공인 대환대출', description: '저금리 정책자금 전환', icon: Coins },
    { id: 'biz_growth_1', label: '스마트상점 기술보급', description: '키오스크 등 도입 지원', icon: Store },
    { id: 'labor_support', label: '두루누리 사회보험료', description: '4대 보험료 부담 완화', icon: Users },
  ];

  const handleToggleCheck = (id: string) => {
    setCheckedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
          {activeUserTitle}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          더 정확한 분석을 위해 몇 가지 질문에 답해주세요.
        </p>
      </div>

      <div className="w-full max-w-3xl">
        {duration === 'prospective' ? (
          <div className="space-y-12">
            {/* Question 1 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-base font-bold">1</span>
                이전에 창업 해보신 적이 있으신가요?
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <OptionCard 
                  selected={bizHistory === 'first'} 
                  onClick={() => setBizHistory('first')} 
                  icon={User} 
                  label="없습니다" 
                  subLabel="생애 첫 창업"
                />
                <OptionCard 
                  selected={bizHistory === 're'} 
                  onClick={() => setBizHistory('re')} 
                  icon={RefreshCw} 
                  label="있습니다" 
                  subLabel="재창업 / 업종변경"
                />
              </div>
            </div>

            {/* Question 2 */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-base font-bold">2</span>
                현재 보유 중인 사업자등록증이 있나요?
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <OptionCard 
                  selected={bizRegStatus === 'none'} 
                  onClick={() => setBizRegStatus('none')} 
                  icon={FileText} 
                  label="없습니다" 
                  subLabel="예비 창업자"
                />
                <OptionCard 
                  selected={bizRegStatus === 'exist'} 
                  onClick={() => setBizRegStatus('exist')} 
                  icon={CheckCircle} 
                  label="있습니다" 
                  subLabel="기창업자 / 폐업예정"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 mb-4">
              <CheckSquare className="w-8 h-8 text-blue-500" />
              알고 계시거나 활용 중인 지원사업이 있나요?
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {existingChecklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleToggleCheck(item.id)}
                  className={cn(
                    "flex items-center p-6 rounded-2xl border-2 cursor-pointer transition-all select-none bg-white dark:bg-slate-800",
                    checkedItems.includes(item.id)
                      ? "border-blue-500 bg-blue-50/30 dark:border-blue-400"
                      : "border-slate-200 dark:border-slate-700 hover:border-blue-200"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded border-2 mr-5 flex items-center justify-center transition-colors",
                    checkedItems.includes(item.id) ? "bg-blue-500 border-blue-500 text-white" : "border-slate-300"
                  )}>
                    {checkedItems.includes(item.id) && <CheckSquare className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-slate-900 dark:text-white mb-1">{item.label}</p>
                    <p className="text-slate-500 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between w-full max-w-3xl mt-12">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-bold py-3 px-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>이전</span>
        </button>

        <button
          onClick={handleNext}
          disabled={!isValid}
          className={cn(
            "flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg transition-all",
            isValid
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

const OptionCard = ({ selected, onClick, icon: Icon, label, subLabel }: any) => (
  <div
    onClick={onClick}
    className={cn(
      "flex flex-col items-center justify-center p-8 rounded-2xl border-2 cursor-pointer transition-all duration-200 bg-white dark:bg-slate-800",
      selected
        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400 shadow-md transform scale-[1.02]"
        : "border-slate-100 dark:border-slate-700 hover:border-blue-300 hover:shadow-lg"
    )}
  >
    <Icon className={cn("w-10 h-10 mb-4", selected ? "text-blue-500" : "text-slate-400")} />
    <span className={cn("font-bold text-lg mb-1", selected ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white")}>{label}</span>
    <span className="text-sm text-slate-500">{subLabel}</span>
  </div>
);
