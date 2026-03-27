'use client';

import React from 'react';
import { motion } from 'framer-motion';

const GOALS = [
  {
    id: 'G1',
    number: '01',
    title: '10분 내 진단 완료',
    description: '입력부터 결과 요약까지, 빠르게 제공합니다. 바쁜 사장님도 점심시간에 끝낼 수 있습니다.',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'G2',
    number: '02',
    title: '근거 기반 리포트',
    description: '"왜" 해야 하는지 데이터로 증명합니다. 경쟁 구도·노출 요인·콘텐츠 전략을 함께 제공합니다.',
    accent: 'from-violet-500 to-purple-400',
  },
  {
    id: 'G3',
    number: '03',
    title: '즉시 실행 가능',
    description: '오늘 바로 매장에 적용할 수 있는 체크리스트와 우선순위 액션을 제안합니다.',
    accent: 'from-emerald-500 to-teal-400',
  },
  {
    id: 'G4',
    number: '04',
    title: '반복 개선 사이클',
    description: '리포트 히스토리를 비교하여 개선 효과를 추적하고, 성장 사이클을 돌립니다.',
    accent: 'from-amber-500 to-orange-400',
  },
];

export const SolutionSection = () => {
  return (
    <section className="py-28 px-6 bg-[#FAFAF9] dark:bg-[#0F172A]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 dark:text-blue-400 text-sm font-bold tracking-widest uppercase">
            Our Solution
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-3 tracking-tight text-slate-900 dark:text-white">
            D-PLOG가 해결합니다
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base">
            PRD에서 정의한 4가지 핵심 목표를 기술로 달성합니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {GOALS.map((goal, i) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative p-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] hover:shadow-xl dark:hover:border-white/10 transition-all duration-300"
            >
              {/* Goal number badge */}
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${goal.accent} text-white text-sm font-black mb-5 shadow-lg`}>
                {goal.number}
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {goal.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {goal.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
