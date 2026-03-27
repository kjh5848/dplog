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
      '대행사에 월 수십만 원을 맡기지만, 뭘 해주고 있는지 체감이 없습니다.',
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

export const PainPointsSectionV3 = () => {
  return (
    <section className="relative py-32 px-6 bg-[#0c1017] text-white overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 text-white/40 text-xs font-semibold tracking-widest uppercase mb-5">
            Problem
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-5 [text-wrap:balance]">
            사장님이 겪는 진짜 문제
          </h2>
          <p className="text-base md:text-lg text-white/30 leading-relaxed max-w-xl mx-auto [text-wrap:balance]">
            수많은 사장님들이 공통적으로 토로하는 문제들입니다.
            <br className="hidden md:block" />
            D-PLOG는 이 세 가지 문제에 집중합니다.
          </p>
        </motion.div>

        {/* Stacked feature cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PAIN_POINTS.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                delay: i * 0.15,
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="group relative flex flex-col rounded-3xl border border-white/[0.08] hover:border-blue-500/30 bg-white/[0.03] backdrop-blur-sm transition-all duration-500 overflow-hidden"
            >
              {/* Top glow */}
              <div
                className="absolute -top-20 left-1/2 -translate-x-1/2 w-60 h-40 bg-blue-500/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              />

              {/* Large number header */}
              <div className="relative px-8 pt-8 pb-4 bg-gradient-to-b from-blue-500/[0.12] to-transparent">
                <span
                  className="text-[120px] md:text-[140px] font-black leading-none text-white/[0.07] select-none block text-center"
                >
                  {point.number}
                </span>
              </div>

              {/* Content */}
              <div className="relative flex flex-col flex-1 px-8 pb-8 pt-2">
                <h3 className="text-xl font-bold text-white/90 mb-3 leading-snug break-keep">
                  {point.title}
                </h3>
                <p className="text-sm text-white/35 leading-relaxed flex-1 break-keep">
                  {point.description}
                </p>

                {/* Stat divider */}
                <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-baseline justify-between">
                  <span className="text-3xl font-black text-blue-400">
                    {point.stat}
                  </span>
                  <span className="text-[10px] text-white/25 font-medium tracking-wide uppercase">
                    {point.statLabel}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

