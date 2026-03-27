'use client';

import React from 'react';
import { Timeline } from '@/shared/ui/timeline';
import { motion } from 'framer-motion';
import Image from 'next/image';

export const TimelineSection = () => {
  const data = [
    {
      title: "Step 01. 진단 시작",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            복잡한 마케팅 지식 없이도 시작할 수 있습니다. 
            <strong>플레이스 URL</strong> 또는 <strong>가게 상호명</strong>만 입력하면 D-PLOG의 AI 분석 엔진이 즉시 가동됩니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Image 
              src="https://images.unsplash.com/photo-1551288049-bbbda540d3b9?auto=format&fit=crop&w=1200&q=80"
              alt="Diagnosis start"
              width={1200}
              height={700}
              className="rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm w-full object-cover h-64 md:h-80"
            />
            <div className="p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 flex flex-col justify-center">
              <ul className="space-y-4 text-xs md:text-sm text-slate-500 dark:text-slate-400">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                  <span>네이버 플레이스 URL 기반 자동 메타 데이터 수집 및 정규화</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 shrink-0" />
                  <span>대표 키워드 및 희망 키워드 실시간 유효성 검사 (최대 10개)</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="h-20" /> {/* Extra spacing for scroll effect */}
        </div>
      ),
    },
    {
      title: "Step 02. 데이터 분석",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            AI 에이전트가 실시간 키워드 순위를 조회하고, 
            경쟁 환경 및 매장 콘텐츠 전략을 다각도로 분석하여 데이터 컨텍스트를 구성합니다.
          </p>
          <div className="space-y-4">
            <Image 
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80"
              alt="Data analysis"
              width={1400}
              height={700}
              className="rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm w-full object-cover h-72 md:h-96"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Keyword Rank</p>
                <div className="text-2xl font-black text-primary">TOP 3</div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Competitors</p>
                <div className="text-2xl font-black text-slate-600 dark:text-slate-300">50+</div>
              </div>
            </div>
          </div>
          <div className="h-20" />
        </div>
      ),
    },
    {
      title: "Step 03. 리포트 생성",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            단순히 수치만 나열하지 않습니다. 
            현 상황에 대한 <strong>정밀 진단 근거</strong>와 지금 바로 실행해야 할 <strong>우선순위 지침</strong>이 담긴 맞춤형 리포트를 제공합니다.
          </p>
          <Image 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=80"
              alt="Report generation"
              width={1400}
              height={700}
              className="rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm w-full object-cover h-72 md:h-96"
            />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 bg-blue-50/50 dark:bg-primary/5 rounded-2xl border border-blue-100 dark:border-primary/10 flex flex-col justify-center">
              <div className="flex flex-col gap-3">
                <div className="h-2.5 w-full bg-blue-200 dark:bg-primary/20 rounded-full animate-pulse" />
                <div className="h-2.5 w-full bg-blue-200 dark:bg-primary/20 rounded-full animate-pulse delay-75" />
                <div className="h-2.5 w-3/4 bg-blue-200 dark:bg-primary/20 rounded-full animate-pulse delay-150" />
              </div>
              <p className="mt-6 text-sm font-bold text-blue-600 dark:text-primary-light">✓ AI Diagnostic Logic Activated</p>
              <p className="mt-1 text-xs text-blue-400 dark:text-primary/40">생성형 AI가 6,000자 분량의 개선 전략 수립 중</p>
            </div>
            <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col justify-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">Report Output</p>
              <div className="text-2xl font-black text-primary">6,000자+</div>
              <p className="mt-2 text-xs text-slate-400">맞춤형 진단 리포트</p>
            </div>
          </div>
          <div className="h-20" />
        </div>
      ),
    },
    {
      title: "Step 04. 성과 추적",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 dark:text-slate-300 text-sm md:text-base leading-relaxed">
            한 번의 진단으로 끝나지 않습니다. 
            주기적인 노출 순위 트래킹을 통해 실행 플랜의 효과를 검증하고, 지속 가능한 성장 사이클을 구축합니다.
          </p>
          <div className="relative">
            <Image 
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80"
              alt="Growth tracking"
              width={1400}
              height={600}
              className="rounded-2xl border border-slate-100 dark:border-white/10 shadow-sm w-full object-cover h-64 md:h-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl flex items-center px-8">
              <div className="flex items-center gap-6 w-full max-w-md">
                <div className="flex-1 h-1 bg-white/20 relative rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: "75%" }}
                     transition={{ duration: 2, ease: "easeOut" }}
                     className="absolute top-0 left-0 h-full bg-primary shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                   />
                </div>
                <span className="text-sm font-black text-white shrink-0 tracking-widest">+42.5%</span>
              </div>
            </div>
          </div>
          <div className="h-40" />
        </div>
      ),
    },
  ];

  return (
    <section className="bg-white dark:bg-[#050505] transition-colors duration-300 border-b border-slate-50 dark:border-white/5">
      <div className="max-w-7xl mx-auto pt-32 pb-16 px-4 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 text-xs font-semibold tracking-widest uppercase mb-5">
            Workflow Process
          </span>
          <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight text-slate-900 dark:text-white">
            How it Works
          </h2>
          <p className="text-slate-500 dark:text-white/40 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
            D-PLOG가 제안하는 4단계 진단 프로세스로 플레이스 노출의 해답을 찾으세요.
          </p>
        </motion.div>
      </div>
      <Timeline data={data} />
    </section>
  );
};
