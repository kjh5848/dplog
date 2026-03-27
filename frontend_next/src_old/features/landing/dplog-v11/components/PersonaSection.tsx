'use client';

import React from 'react';
import { motion } from 'framer-motion';

const PERSONAS = [
  {
    icon: '🏪',
    title: '1인 사장님',
    subtitle: '카페 · 식당 · 주점',
    needs: '시간이 부족하고 마케팅 지식이 없어요',
    solution: '가장 시급한 개선점만 콕 집어 알려드립니다. 30분이면 이번 주 미션을 끝낼 수 있어요.',
    accent: 'from-blue-500 to-cyan-400',
  },
  {
    icon: '👔',
    title: '매장 운영자',
    subtitle: '직원 · 점장 · 매니저',
    needs: '사장님께 보고할 성과 지표가 필요해요',
    solution: '데이터 기반 보고서를 자동 생성합니다. 순위 변동, 개선 효과를 정량적으로 보여드려요.',
    accent: 'from-violet-500 to-purple-400',
  },
  {
    icon: '📋',
    title: '소규모 대행사',
    subtitle: '컨설턴트 · 프리랜서',
    needs: '여러 매장을 동시에 관리해야 해요',
    solution: '다수 매장의 순위를 한 화면에서 비교하고, 히스토리 기반 리포트를 일괄로 생성하세요.',
    accent: 'from-emerald-500 to-teal-400',
  },
];

export const PersonaSection = () => {
  return (
    <section className="py-28 px-6 bg-slate-50 dark:bg-[#0c1220]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 dark:text-blue-400 text-sm font-bold tracking-widest uppercase">
            For You
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-3 tracking-tight text-slate-900 dark:text-white">
            누구에게 필요한가요?
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-base">
            D-PLOG는 외식업 현장의 실제 니즈에 맞춰 설계되었습니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONAS.map((persona, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="group p-8 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06] hover:shadow-xl dark:hover:border-white/10 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{persona.icon}</div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{persona.title}</h3>
              <p className="text-xs text-slate-400 font-medium mb-4">{persona.subtitle}</p>

              {/* Pain */}
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                <p className="text-xs font-bold text-red-500 dark:text-red-400 mb-1">고민</p>
                <p className="text-sm text-red-600/80 dark:text-red-300/70">{persona.needs}</p>
              </div>

              {/* Solution */}
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10">
                <p className="text-xs font-bold text-blue-500 dark:text-blue-400 mb-1">D-PLOG 솔루션</p>
                <p className="text-sm text-blue-600/80 dark:text-blue-300/70">{persona.solution}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
