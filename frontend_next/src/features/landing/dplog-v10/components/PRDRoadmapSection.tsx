"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BentoGrid, default as BentoItem } from '@/shared/ui/bento-grid';
import { cn } from '@/shared/lib/utils';

const PRD_DATA = [
  {
    title: "10분 내 진단 완료",
    description: "URL 입력만으로 실시간 노출 순위와 개선 리포트를 즉시 생성합니다.",
    className: "md:col-span-2 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1551288049-bbbda540d3b9?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "근거 기반 리포트",
    description: "RAG 기술을 활용해 왜 개선이 필요한지 데이터로 증명합니다.",
    className: "md:col-span-2 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "1인 사장님 최적화",
    description: "시간이 부족한 사장님을 위해 즉시 실행 가능한 액션 아이템을 제공합니다.",
    className: "md:col-span-1 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "글로벌 확장성",
    description: "전 세계 어디서든 빠른 인프라로 비즈니스 성장을 지원합니다.",
    className: "md:col-span-1 md:row-span-2 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "매장 매니저 리포트",
    description: "보고에 최적화된 고퀄리티 데이터를 한눈에 확인하세요.",
    className: "md:col-span-2 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "실행 가능성 중심",
    description: "오늘 바로 매장에 적용할 수 있는 체크리스트 우선순위를 제안합니다.",
    className: "md:col-span-1 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "마케팅 대행사 관리",
    description: "여러 클라이언트 매장을 체계적으로 관리하고 성과를 추적하세요.",
    className: "md:col-span-3 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "반복적인 개선 사이클",
    description: "히스토리 비교를 통해 지속 가능한 플레이스 성장을 이뤄냅니다.",
    className: "md:col-span-2 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "지속 가능한 성장",
    description: "데이터 기반의 분석 도구로 비즈니스 잠재력을 깨우세요.",
    className: "md:col-span-1 md:row-span-1 border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03]",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=400&q=80",
  },
];

export const PRDRoadmapSection = () => {
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
            Product Roadmap & Target
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tightest text-slate-900 dark:text-white"
          >
            D-PLOG Strategy
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-white/30 max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
          >
            진단부터 실행까지, 외식업 성장을 위한 로드맵
          </motion.p>
        </div>

        <BentoGrid className="auto-rows-[180px] md:auto-rows-[220px]">
          {PRD_DATA.slice(0, 4).map((item, idx) => (
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

          {PRD_DATA.slice(4).map((item, idx) => (
            <BentoItem 
              key={idx + 4} 
              {...item} 
              index={idx + 4} 
              className={cn(item.className, "text-slate-900 dark:text-white")}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
};
