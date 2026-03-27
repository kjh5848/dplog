'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const GOALS = [
  {
    id: 'G1',
    number: '01',
    title: '10분 내 진단 완료',
    description:
      '플레이스 URL 하나면 충분합니다. 입력부터 결과 요약까지 빠르게 제공합니다.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'G2',
    number: '02',
    title: '근거 기반 리포트',
    description:
      '"왜" 해야 하는지 데이터로 증명합니다. 납득할 수 있는 개선 방향을 제시합니다.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'G3',
    number: '03',
    title: '즉시 실행 가능',
    description:
      '오늘 바로 매장에 적용할 수 있는 체크리스트와 우선순위 액션을 제안합니다.',
    image:
      'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'G4',
    number: '04',
    title: '반복 개선 사이클',
    description:
      '리포트 히스토리를 비교하여 개선 효과를 정량적으로 추적합니다.',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
];

export const SolutionSectionV2 = () => {
  return (
    <section className="py-32 px-6 bg-[#FAFAF9] dark:bg-[#050505] relative overflow-hidden transition-colors duration-300 border-y border-slate-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 text-xs font-semibold tracking-widest uppercase mb-5">
            Solution
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-5 [text-wrap:balance]">
            D-PLOG가 해결합니다
          </h2>
          <p className="text-slate-500 dark:text-white/40 max-w-xl mx-auto text-base md:text-lg leading-relaxed [text-wrap:balance]">
            진단부터 실행까지, 사장님의 플레이스 성장을 4단계로 지원합니다.
          </p>
        </motion.div>

        {/* 2-Column Rows: Left = Title, Right = Image + Description */}
        <div className="space-y-16 md:space-y-24">
          {GOALS.map((goal, i) => {
            const isEven = i % 2 === 0;
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-10 lg:gap-16`}
              >
                {/* Column 1: Title & Number */}
                <div className="w-full lg:w-[40%] space-y-4">
                  <span className="text-sm font-semibold text-slate-400 dark:text-white/30 tracking-widest">
                    {goal.number}
                  </span>
                  <h3 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-snug">
                    {goal.title}
                  </h3>
                  <p className="text-base md:text-lg text-slate-500 dark:text-white/50 leading-relaxed">
                    {goal.description}
                  </p>
                </div>

                {/* Column 2: Image */}
                <div className="w-full lg:w-[60%]">
                  <div className="relative rounded-2xl overflow-hidden group">
                    <Image
                      src={goal.image}
                      alt={goal.title}
                      width={1200}
                      height={700}
                      className="w-full h-64 md:h-80 object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
