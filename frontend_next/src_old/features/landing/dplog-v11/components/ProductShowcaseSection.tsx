'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const FEATURES = [
  {
    id: 'keyword',
    tab: 'AI 키워드 분석',
    title: '매장에 최적화된 키워드를 AI가 선별합니다',
    description:
      '검색량, 경쟁도, 매장 적합도를 종합 분석하여 가장 효과적인 키워드 조합을 추천합니다.',
    image:
      'https://images.unsplash.com/photo-1551288049-bbbda540d3b9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'report',
    tab: '진단 리포트',
    title: '근거 기반의 상세 진단 리포트를 제공합니다',
    description:
      'RAG 기술을 활용하여 왜 개선이 필요한지 데이터로 설명하고, 즉시 실행 가능한 액션 아이템을 제안합니다.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'ranking',
    tab: '순위 추적',
    title: '키워드별 실시간 노출 순위를 추적합니다',
    description:
      '매일 자동으로 순위를 기록하고, 변동 추이를 시각화하여 개선 효과를 한눈에 파악할 수 있습니다.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'action',
    tab: '액션 플랜',
    title: '오늘 바로 실행할 수 있는 미션을 제공합니다',
    description:
      '개선 우선순위에 따라 정리된 체크리스트와 주간 미션으로 운영 루틴을 확립합니다.',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  },
];

export const ProductShowcaseSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = FEATURES[activeIndex];

  return (
    <section className="py-28 px-6 bg-white dark:bg-[#0a0f1a]">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-blue-600 dark:text-blue-400 text-sm font-bold tracking-widest uppercase">
            Product
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-3 tracking-tight text-slate-900 dark:text-white">
            핵심 기능 미리보기
          </h2>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center flex-wrap mb-10">
          {FEATURES.map((feat, i) => (
            <button
              key={feat.id}
              onClick={() => setActiveIndex(i)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                i === activeIndex
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              {feat.tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 leading-snug">
                {active.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {active.description}
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20">
                자세히 보기 →
              </button>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden border border-slate-100 dark:border-white/10 shadow-2xl">
                <Image
                  src={active.image}
                  alt={active.title}
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
