'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, FileText, RefreshCw, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils'; // Assuming this utility exists

export const BusinessStatusStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [bizHistory, setBizHistory] = useState<string | null>(null); // 'first' | 're'
  const [bizRegStatus, setBizRegStatus] = useState<string | null>(null); // 'none' | 'exist'

  const handleNext = () => {
    if (!bizHistory || !bizRegStatus) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('biz_history', bizHistory);
    params.set('biz_reg_status', bizRegStatus);

    router.push(`/02-knowledge-check?${params.toString()}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          창업 경험과 현재 상태를<br className="md:hidden" /> 알려주세요
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          정확한 진단을 위해 사장님의 상황을 확인하고 있습니다.
        </p>
      </div>

      <div className="w-full space-y-8 mb-10">
        {/* Question 1: Experience */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">1</span>
            창업 경험이 있으신가요?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <SelectionCard
              selected={bizHistory === 'first'}
              onClick={() => setBizHistory('first')}
              icon={User}
              label="없습니다"
              subLabel="생애 첫 창업"
            />
            <SelectionCard
              selected={bizHistory === 're'}
              onClick={() => setBizHistory('re')}
              icon={RefreshCw}
              label="있습니다"
              subLabel="재창업 / 업종변경"
            />
          </div>
        </div>

        {/* Question 2: Registration */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">2</span>
            현재 보유 중인 사업자등록증이 있나요?
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <SelectionCard
              selected={bizRegStatus === 'none'}
              onClick={() => setBizRegStatus('none')}
              icon={FileText}
              label="없습니다"
              subLabel="예비 창업자"
              highlight={bizRegStatus === 'none'} // Highlight 'none' as it's often the target for support
            />
            <SelectionCard
              selected={bizRegStatus === 'exist'}
              onClick={() => setBizRegStatus('exist')}
              icon={CheckCircle}
              label="있습니다"
              subLabel="기창업자 / 폐업예정"
            />
          </div>
        </div>
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
          disabled={!bizHistory || !bizRegStatus}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all",
            (bizHistory && bizRegStatus)
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

// Helper Component for consistency within this step
interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  subLabel: string;
  highlight?: boolean;
}

const SelectionCard = ({ selected, onClick, icon: Icon, label, subLabel, highlight }: SelectionCardProps) => (
  <motion.div
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      "relative flex flex-col items-center justify-center p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 bg-white dark:bg-slate-800",
      selected
        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400"
        : "border-slate-200 dark:border-slate-700 hover:border-blue-300",
      highlight && !selected && "border-slate-300 hover:border-blue-300" // subtle hint if needed, but keeping simple for now
    )}
  >
    {selected && (
      <div className="absolute top-2 right-2 text-blue-500 dark:text-blue-400">
        <CheckCircle className="w-4 h-4" />
      </div>
    )}
    <Icon className={cn(
      "w-8 h-8 mb-2 transition-colors",
      selected ? "text-blue-500" : "text-slate-400"
    )} />
    <span className={cn(
      "font-bold text-lg mb-0.5",
      selected ? "text-blue-700 dark:text-blue-300" : "text-slate-700 dark:text-slate-300"
    )}>{label}</span>
    <span className="text-xs text-slate-500 dark:text-slate-400">{subLabel}</span>
  </motion.div>
);
