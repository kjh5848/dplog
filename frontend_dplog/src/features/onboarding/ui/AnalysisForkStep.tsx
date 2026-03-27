'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, FileText, ArrowRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';

export const AnalysisForkStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPath, setSelectedPath] = useState<'analysis' | 'plan' | null>(null);

  const handleNext = () => {
    if (!selectedPath) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('fork_path', selectedPath);

    if (selectedPath === 'analysis') {
      // Route to Location Analysis Input (using Region Step for now, or new one)
      // For now, let's reuse region but with a specific mode? Or new step?
      // Plan: "Input: Specific Location". Let's route to region step but emphasize granular input.
      router.push(`/05-region?${params.toString()}&mode=granular`);
    } else {
      // Route to Business Plan Writing -> Item Selection
      router.push(`/05-item-selection?${params.toString()}`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-5xl mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          어떤 도움이 필요하신가요?
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          사장님의 현재 고민에 맞춰 최적의 솔루션을 제공해드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-12">
        {/* Path 1: Commercial Analysis */}
        <SelectionCard
          selected={selectedPath === 'analysis'}
          onClick={() => setSelectedPath('analysis')}
          icon={MapPin}
          title="상권/입지 정밀 분석"
          description="공공데이터를 기반으로 희망 창업 지역의 유동인구, 매출, 경쟁점을 분석합니다."
          tags={['유동인구 분석', '매출 추정', '경쟁점 현황']}
        />

        {/* Path 2: Business Plan */}
        <SelectionCard
          selected={selectedPath === 'plan'}
          onClick={() => setSelectedPath('plan')}
          icon={FileText}
          title="실전 창업 준비 리포트"
          description="메뉴 구성, 인테리어, 포스/CCTV 등 장사 준비에 필요한 실무 정보와 관련 정부지원사업을 매칭해드립니다."
          tags={['메뉴/인테리어', '설비/기자재 지원', '실전 창업 가이드']}
        />
      </div>

      <Button
        onClick={handleNext}
        disabled={!selectedPath}
        size="lg"
        className={cn(
          "px-10 py-6 h-auto text-lg rounded-full transition-all duration-300",
          selectedPath
            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-1"
            : "bg-slate-200 text-slate-400 cursor-not-allowed"
        )}
      >
        선택한 솔루션 시작하기
        <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </div>
  );
};

interface SelectionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: any;
  title: string;
  description: string;
  tags: string[];
}

const SelectionCard = ({ selected, onClick, icon: Icon, title, description, tags }: SelectionCardProps) => (
  <motion.div
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={cn(
      "relative flex flex-col p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 bg-white dark:bg-slate-900",
      selected
        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400 shadow-xl ring-4 ring-blue-500/10"
        : "border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg"
    )}
  >
    <div className={cn(
      "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors",
      selected ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
    )}>
      <Icon className="w-7 h-7" />
    </div>

    <h3 className={cn(
      "text-2xl font-bold mb-3 transition-colors",
      selected ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"
    )}>
      {title}
    </h3>
    
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6 flex-grow">
      {description}
    </p>

    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "text-xs font-medium px-3 py-1.5 rounded-full",
            selected
              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          )}
        >
          {tag}
        </span>
      ))}
    </div>
  </motion.div>
);
