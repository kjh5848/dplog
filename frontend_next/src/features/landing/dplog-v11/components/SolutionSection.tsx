'use client';

import React from 'react';
import { motion } from 'framer-motion';

const GOALS = [
  {
    id: 'G1',
    number: '01',
    title: '10분 내 진단 완료',
    description:
      '입력부터 결과 요약까지, 빠르게 제공합니다. 바쁜 사장님도 점심시간에 끝낼 수 있습니다.',
    keyword: '속도',
  },
  {
    id: 'G2',
    number: '02',
    title: '근거 기반 리포트',
    description:
      '"왜" 해야 하는지 데이터로 증명합니다. 경쟁 구도·노출 요인·콘텐츠 전략을 함께 제공합니다.',
    keyword: '신뢰',
  },
  {
    id: 'G3',
    number: '03',
    title: '즉시 실행 가능',
    description:
      '오늘 바로 매장에 적용할 수 있는 체크리스트와 우선순위 액션을 제안합니다.',
    keyword: '실행',
  },
  {
    id: 'G4',
    number: '04',
    title: '반복 개선 사이클',
    description:
      '리포트 히스토리를 비교하여 개선 효과를 추적하고, 지속적인 성장 사이클을 돌립니다.',
    keyword: '성장',
  },
];

export const SolutionSection = () => {
  return (
    <section className="py-32 px-6 bg-[#FAFAF9] dark:bg-[#0F172A] relative overflow-hidden">
      {/* Subtle ambient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px]" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header — left-aligned to match PainPoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-blue-500/60" />
            <span className="text-blue-600 dark:text-blue-400 text-xs font-bold tracking-[0.25em] uppercase">
              Solution
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
            D-PLOG가
            <br />
            <span className="text-slate-300 dark:text-white/30">해결합니다</span>
          </h2>
        </motion.div>

        {/* Goal cards — horizontal list like PainPoints */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-100 dark:bg-white/[0.04] rounded-2xl overflow-hidden border border-slate-100 dark:border-white/[0.06]">
          {GOALS.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative p-10 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all duration-500"
            >
              {/* Number watermark */}
              <span className="absolute top-6 right-8 text-[72px] font-black leading-none text-slate-100 dark:text-white/[0.03] group-hover:text-slate-200 dark:group-hover:text-white/[0.06] transition-colors duration-500 select-none">
                {goal.number}
              </span>

              {/* Keyword tag */}
              <div className="inline-block px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold tracking-widest uppercase mb-6">
                {goal.keyword}
              </div>

              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 relative z-10">
                {goal.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-white/30 leading-relaxed max-w-sm relative z-10">
                {goal.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
