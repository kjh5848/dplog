'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';

export const OnboardingComplete = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const funnel = searchParams.get('funnel');
  
  // Construct a signup URL that preserves the onboarding data
  const signupUrl = `/signup?${searchParams.toString()}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-4 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-8"
      >
        <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
          <CheckCircle className="w-12 h-12" />
        </div>
      </motion.div>

      <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
        {funnel === 'ebook' ? '전자책 준비가 완료되었습니다!' : '진단 리포트 준비가 완료되었습니다!'}
      </h1>
      
      <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-lg mx-auto">
        {funnel === 'ebook' 
          ? '회원가입 후 대시보드에서 전자책을 바로 다운로드하실 수 있습니다.'
          : '회원가입 후 나만의 창업 준비 리포트를 바로 확인하실 수 있습니다.'}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
        <Link href={signupUrl} className="w-full sm:w-auto">
          <button className="w-full flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
            이메일로 3초만에 시작하기
            <ArrowRight className="w-5 h-5" />
          </button>
        </Link>
      </div>
      
      <div className="mt-6">
        <p className="text-sm text-slate-400">
          이미 계정이 있으신가요? <Link href="/login" className="text-blue-500 hover:underline font-semibold">로그인</Link>
        </p>
      </div>
    </div>
  );
};
