'use client';

import React from 'react';
import { motion } from 'framer-motion';

const PAIN_POINTS = [
  {
    number: '01',
    title: '무엇부터 바꿔야 하는지 모르겠다',
    description:
      '메뉴? 사진? 리뷰? 소개문? 어떤 걸 고쳐야 노출이 오르는지, 시작점조차 막막합니다.',
    stat: '78%',
    statLabel: '의 사장님이 동의',
  },
  {
    number: '02',
    title: '광고에만 돈을 태우고 있다',
    description:
      '대행사에 월 수십만 원을 맡기지만, 뭘 해주고 있는지 체감이 없습니다. 의존에서 벗어나고 싶습니다.',
    stat: '월 50만원+',
    statLabel: '평균 대행비 지출',
  },
  {
    number: '03',
    title: '성과를 숫자로 증명할 수 없다',
    description:
      '키워드 순위가 올랐는지, 변화가 실제로 효과가 있었는지 정량적으로 확인할 방법이 없습니다.',
    stat: '0건',
    statLabel: '데이터 기반 의사결정',
  },
];

export const PainPointsSectionV2 = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />

      {/* Aurora-like ambient blobs */}
      <motion.div
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 20, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-blue-500/[0.08] rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 30, -20, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-10%] right-[10%] w-[400px] h-[400px] bg-violet-500/[0.06] rounded-full blur-[100px]"
      />
      <motion.div
        animate={{
          x: [0, 20, -10, 0],
          y: [0, -20, 30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-cyan-500/[0.04] rounded-full blur-[80px]"
      />

      <div className="relative max-w-5xl mx-auto z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-blue-400/60" />
            <span className="text-blue-400 text-xs font-bold tracking-[0.25em] uppercase">
              Problem
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.15] text-white">
            사장님이 겪는
            <br />
            <span className="text-white/30">진짜 문제</span>
          </h2>
        </motion.div>

        {/* Glass cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PAIN_POINTS.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="group relative rounded-2xl p-8 backdrop-blur-xl bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.10] hover:border-white/[0.15] shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-500"
            >
              {/* Ghost number */}
              <span className="absolute top-5 right-6 text-[64px] font-black leading-none text-white/[0.04] group-hover:text-white/[0.08] transition-colors duration-500 select-none">
                {point.number}
              </span>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-white/90 leading-snug mb-3 break-keep">
                  {point.title}
                </h3>
                <p className="text-sm text-white/35 leading-relaxed mb-6 break-keep">
                  {point.description}
                </p>

                {/* Stat */}
                <div className="pt-5 border-t border-white/[0.06]">
                  <span className="text-2xl font-black text-blue-400/90">
                    {point.stat}
                  </span>
                  <span className="block text-[10px] text-white/25 font-medium mt-1 tracking-wide">
                    {point.statLabel}
                  </span>
                </div>
              </div>

              {/* Card inner glow on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-blue-500/[0.05] via-transparent to-violet-500/[0.03]" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
