"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BentoGrid, default as BentoItem } from '@/shared/ui/bento-grid';
import { cn } from '@/shared/lib/utils';

const PERSONA_DATA = [
  {
    title: "1인 사장님",
    description: "마케팅할 시간이 부족한 사장님을 위해, 가장 시급한 개선점만 콕 집어 알려드립니다.",
    className: "md:col-span-2 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "매장 매니저",
    description: "사장님께 보고할 성과 리포트가 필요하신가요? 데이터 기반의 보고서를 만들어드려요.",
    className: "md:col-span-2 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "마케팅 대행사",
    description: "여러 클라이언트 매장의 순위를 한눈에 관리하고, 체계적인 관리 리포트를 제공하세요.",
    className: "md:col-span-2 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "AI 진단 엔진",
    description: "리뷰, 플레이스 정보, 키워드 경쟁력을 AI가 종합적으로 분석합니다.",
    className: "md:col-span-3 md:row-span-2 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1551288049-bbbda540d3b9?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "성과 추적",
    description: "실행한 개선 조치가 실제 순위에 어떤 영향을 줬는지 히스토리를 확인하세요.",
    className: "md:col-span-3 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "즉시 실행 가능한 액션",
    description: "오늘 바로 매장에 적용할 수 있는 체크리스트와 우선순위를 제안합니다.",
    className: "md:col-span-3 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
  },
];

export const FeatureGridSectionV2 = () => {
  return (
    <section className="py-24 px-4 bg-white dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden transition-colors duration-300 border-y border-slate-100 dark:border-white/5">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 text-[10px] font-bold tracking-widest uppercase mb-4"
          >
            Target Persona
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tightest text-slate-900 dark:text-white"
          >
            누구에게 필요한가요?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-white/30 max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
          >
            D-PLOG는 다양한 외식업 관계자를 위한 올인원 진단 솔루션입니다.
          </motion.p>
        </div>

        <BentoGrid className="auto-rows-[180px] md:auto-rows-[220px]">
          {PERSONA_DATA.slice(0, 3).map((item, idx) => (
            <BentoItem
              key={idx}
              {...item}
              index={idx}
              className={cn(item.className, "text-slate-900 dark:text-white")}
            />
          ))}

          {/* Central Hero-like Gap */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center px-4 py-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <div className="mb-2 text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white">D-PLOG</div>
              <div className="h-1 w-12 bg-primary rounded-full my-6 mx-auto opacity-50" />
              <button className="group relative rounded-full bg-slate-900 dark:bg-white px-10 py-4 text-base font-bold text-white dark:text-black hover:scale-105 active:scale-95 transition-all shadow-2xl dark:shadow-white/10 overflow-hidden">
                <span className="relative z-10">무료로 시작하기</span>
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
              </button>
            </motion.div>
          </div>

          {PERSONA_DATA.slice(3).map((item, idx) => (
            <BentoItem
              key={idx + 3}
              {...item}
              index={idx + 3}
              className={cn(item.className, "text-slate-900 dark:text-white")}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};
