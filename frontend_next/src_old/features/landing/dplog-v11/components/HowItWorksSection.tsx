'use client';

import React from 'react';
import { Timeline } from '@/shared/ui/timeline';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const HowItWorksSection = () => {
  const data = [
    {
      title: 'Step 01. 정보 입력',
      content: (
        <div className="space-y-6 pb-16">
          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            플레이스 URL 또는 가게 상호명을 입력하면
            AI가 자동으로 매장 정보를 수집합니다.
            대표 키워드 5개 + 희망 키워드 5개를 설정하면 준비 완료.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Input</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">플레이스 URL</p>
            </div>
            <div className="p-5 bg-white dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Keywords</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">최대 10개</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Step 02. AI 분석',
      content: (
        <div className="space-y-6 pb-16">
          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            AI 에이전트가 실시간 키워드 순위를 조회하고,
            경쟁 매장 분석 및 콘텐츠 전략을 다각도로 분석합니다.
          </p>
          <Image
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
            alt="Data analysis dashboard"
            width={1200}
            height={600}
            className="rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm w-full object-cover h-48 md:h-64"
          />
        </div>
      ),
    },
    {
      title: 'Step 03. 리포트 생성',
      content: (
        <div className="space-y-6 pb-16">
          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            RAG 기술로 근거를 결합한 맞춤형 리포트가 생성됩니다.
            요약 → 근거 → 개선 포인트 → 즉시 실행 항목 → 우선순위 순으로 정리됩니다.
          </p>
          <div className="p-6 bg-blue-50/50 dark:bg-blue-500/5 rounded-2xl border border-blue-100 dark:border-blue-500/10">
            <div className="space-y-3">
              <div className="h-2.5 w-full bg-blue-200 dark:bg-blue-500/20 rounded-full" />
              <div className="h-2.5 w-4/5 bg-blue-200 dark:bg-blue-500/20 rounded-full" />
              <div className="h-2.5 w-3/5 bg-blue-200 dark:bg-blue-500/20 rounded-full" />
            </div>
            <p className="mt-4 text-sm font-bold text-blue-600 dark:text-blue-400">
              ✓ 6,000자 분량의 근거 기반 리포트 생성 완료
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Step 04. 실행 & 추적',
      content: (
        <div className="space-y-6 pb-16">
          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            제안된 액션 아이템을 실행하고,
            주기적 재진단으로 순위 변화를 추적합니다.
            히스토리 비교를 통해 지속 가능한 성장 사이클을 구축하세요.
          </p>
          <div className="relative h-16 flex items-center">
            <div className="flex-1 h-1 bg-slate-100 dark:bg-white/10 rounded-full relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '75%' }}
                transition={{ duration: 2, ease: 'easeOut' }}
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
              />
            </div>
            <span className="ml-4 text-sm font-black text-emerald-500 tracking-wider">+42.5%</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="bg-[#FAFAF9] dark:bg-[#0F172A] transition-colors duration-300">
      <div className="max-w-5xl mx-auto pt-28 pb-8 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-blue-600 dark:text-blue-400 text-sm font-bold tracking-widest uppercase">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-3 tracking-tight text-slate-900 dark:text-white">
            4단계로 완성되는 진단
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base">
            URL 입력부터 성과 추적까지, D-PLOG의 진단 프로세스
          </p>
        </motion.div>
      </div>
      <Timeline data={data} />
    </section>
  );
};
