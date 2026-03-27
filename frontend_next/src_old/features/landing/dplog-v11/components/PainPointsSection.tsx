'use client';

import React from 'react';
import { motion } from 'framer-motion';

const PAIN_POINTS = [
  {
    number: '01',
    title: '무엇부터 바꿔야 하는지\n모르겠다',
    description:
      '메뉴? 사진? 리뷰? 소개문? 어떤 걸 고쳐야 노출이 오르는지, 시작점조차 막막합니다.',
    stat: '78%',
    statLabel: '의 사장님이 동의',
  },
  {
    number: '02',
    title: '광고에만\n돈을 태우고 있다',
    description:
      '대행사에 월 수십만 원을 맡기지만, 뭘 해주고 있는지 체감이 없습니다. 의존에서 벗어나고 싶습니다.',
    stat: '월 50만원+',
    statLabel: '평균 대행비 지출',
  },
  {
    number: '03',
    title: '성과를 숫자로\n증명할 수 없다',
    description:
      '키워드 순위가 올랐는지, 변화가 실제로 효과가 있었는지 정량적으로 확인할 방법이 없습니다.',
    stat: '0건',
    statLabel: '데이터 기반 의사결정',
  },
];

export const PainPointsSection = () => {
  return (
    <section className="py-32 px-6 bg-[#0c1017] text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/[0.04] rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-violet-500/[0.03] rounded-full blur-[100px]" />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-blue-500/60" />
            <span className="text-blue-400 text-xs font-bold tracking-[0.25em] uppercase">
              Problem
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
            사장님이 겪는
            <br />
            <span className="text-white/40">진짜 문제</span>
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="space-y-4">
          {PAIN_POINTS.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-center gap-6 md:gap-10 p-8 md:p-10 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.04] transition-all duration-500"
            >
              {/* Number */}
              <span className="text-[80px] md:text-[100px] font-black leading-none text-white/[0.04] group-hover:text-white/[0.08] transition-colors duration-500 select-none">
                {point.number}
              </span>

              {/* Text */}
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-white/90 leading-snug whitespace-pre-line mb-3">
                  {point.title}
                </h3>
                <p className="text-sm md:text-base text-white/30 leading-relaxed max-w-lg">
                  {point.description}
                </p>
              </div>

              {/* Stat pill */}
              <div className="flex flex-col items-end text-right">
                <span className="text-2xl md:text-3xl font-black text-blue-400/80">
                  {point.stat}
                </span>
                <span className="text-[11px] text-white/25 font-medium mt-1">
                  {point.statLabel}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
