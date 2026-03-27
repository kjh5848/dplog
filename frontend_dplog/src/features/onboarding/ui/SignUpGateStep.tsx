'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, Check } from 'lucide-react';
import { Button } from '@/shared/ui/button';

export const SignUpGateStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSignUp = () => {
    const params = new URLSearchParams(searchParams.toString());
    // In a real app, this would route to auth flow
    // For now, we simulate success and move to the next step (Analysis Fork)
    params.set('authenticated', 'true');
    router.push(`/05-analysis-fork?${params.toString()}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-md mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-800 text-center"
      >
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
          AI 창업 파트너 시작하기
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          맞춤형 상권 분석과 사업계획서 작성을 위해<br/>
          간단한 회원가입이 필요합니다.
        </p>

        <div className="space-y-4 mb-8 text-left bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300">내 아이디어 맞춤 <strong>사업계획서 생성</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300">공공데이터 기반 <strong>상권/입지 정밀 분석</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3" />
            </div>
            <span className="text-sm text-slate-700 dark:text-slate-300">정부 지원사업 <strong>자동 매칭 알림</strong></span>
          </div>
        </div>

        <Button
          onClick={handleSignUp}
          className="w-full h-12 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20"
        >
          1초 만에 무료로 시작하기
        </Button>
        <button
          onClick={handleBack}
          className="mt-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-4"
        >
          이전 단계로
        </button>
      </motion.div>
    </div>
  );
};
