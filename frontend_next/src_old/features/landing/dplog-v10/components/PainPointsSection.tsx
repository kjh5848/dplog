'use client';

import React from 'react';
import { motion } from 'framer-motion';

const PAIN_POINTS = [
  {
    icon: '🤷',
    title: '무엇부터 바꿔야 하는지 모르겠다',
    description:
      '메뉴? 사진? 리뷰? 소개문? 어떤 걸 고쳐야 노출이 오르는지, 시작점조차 막막합니다.',
    prdRef: 'PRD §2-1',
  },
  {
    icon: '💸',
    title: '광고에만 돈을 쓰고 있다',
    description:
      '대행사에 월 수십만 원을 맡기지만, 뭘 해주고 있는지 체감이 없습니다. 의존에서 벗어나고 싶습니다.',
    prdRef: 'PRD §2-2',
  },
  {
    icon: '📊',
    title: '성과를 숫자로 증명할 수 없다',
    description:
      '키워드 순위가 올랐는지, 변화가 실제로 효과가 있었는지 정량적으로 확인할 방법이 없습니다.',
    prdRef: 'PRD §2-3',
  },
];

export const PainPointsSection = () => {
  return (
    <section className="py-28 px-6 bg-slate-900 dark:bg-[#0a0f1a] text-white relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="relative max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-400 text-sm font-bold tracking-widest uppercase">
            The Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-3 tracking-tight">
            사장님이 겪는 진짜 문제
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PAIN_POINTS.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group p-8 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:border-blue-500/30 hover:bg-white/[0.06] transition-all duration-300"
            >
              <div className="text-4xl mb-5">{point.icon}</div>
              <h3 className="text-lg font-bold mb-3 text-white/90 leading-snug">
                {point.title}
              </h3>
              <p className="text-sm text-white/40 leading-relaxed">
                {point.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
