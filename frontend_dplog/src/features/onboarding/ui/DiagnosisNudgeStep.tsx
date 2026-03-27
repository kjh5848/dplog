'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, ArrowRight, SkipForward, BarChart3 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export const DiagnosisNudgeStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type'); // 'prospective' | 'existing'
  
  // Define content based on user type
  const isProspective = type === 'prospective';
  
  const content = {
    title: isProspective 
      ? '잠시만요! 창업 준비는 잘 되고 계신가요?' 
      : '잠시만요! 매장 매출은 만족스러우신가요?',
    description: isProspective
      ? '단순한 전자책보다, 사장님의 현재 상황을 분석한 맞춤형 리포트가 성공 확률을 3배 더 높여줍니다.'
      : '단순한 전자책보다, 내 매장의 데이터를 분석한 시크릿 리포트가 매출 상승의 지름길입니다.',
    mainAction: isProspective
      ? '1분 진단하고 맞춤형 리포트 받기'
      : '내 매장 진단하고 시크릿 리포트 받기',
    subAction: '괜찮아요, 일반 전자책만 받을게요',
    icon: isProspective ? FileText : BarChart3
  };

  const handleStartDiagnosis = () => {
    // Navigate to the diagnosis track
    const params = new URLSearchParams(searchParams.toString());
    params.set('funnel', 'diagnosis'); 
    
    if (isProspective) {
      // Prospective Track: Nudge -> Status -> Knowledge -> Region
      router.push(`/01-status?${params.toString()}`);
    } else {
      // Existing Track: Nudge -> Biz Knowledge -> Region
      router.push(`/01-biz-knowledge-check?${params.toString()}`);
    }
  };

  const handleSkip = () => {
    // Navigate to completion
    const params = new URLSearchParams(searchParams.toString());
    params.set('skipped_diagnosis', 'true');
    router.push(`/complete?${params.toString()}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-3xl mx-auto px-6 py-10">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Icon */}
        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
          <content.icon className="w-10 h-10" />
        </div>

        {/* Title & Desc */}
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
          {content.title}
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          {content.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto">
          {/* Main Action - Diagnosis */}
          <button
            onClick={handleStartDiagnosis}
            className="w-full relative group flex items-center justify-between px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <div className="flex flex-col items-start">
              <span className="text-lg font-bold">{content.mainAction}</span>
              <span className="text-xs text-blue-100 opacity-90">추천: 참여자 92%가 만족했어요</span>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </div>
            
            {/* Shimmer effect */}
            <span className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </span>
          </button>

          {/* Sub Action - Skip */}
          <button
            onClick={handleSkip}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2 text-sm font-medium"
          >
            {content.subAction}
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
