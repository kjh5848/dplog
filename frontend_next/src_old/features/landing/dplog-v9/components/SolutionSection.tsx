'use client';
import React from 'react';
import { motion } from 'framer-motion';

const cards = [
  {
    title: "Diagnosis",
    subtitle: "진단",
    description: "AI가 귀사의 데이터를 정밀하게 분석하여\n숨겨진 문제점과 기회를 발견합니다.",
    color: "bg-neutral-900",
    number: "01"
  },
  {
    title: "Prescription",
    subtitle: "처방",
    description: "분석된 데이터를 바탕으로\n데이터 중심의 최적화된 마케팅 전략을 수립합니다.",
    color: "bg-neutral-800",
    number: "02"
  },
  {
    title: "Execution",
    subtitle: "실행",
    description: "수립된 전략을 자동으로 실행하고\n실시간 성과를 모니터링하여 지속적으로 개선합니다.",
    color: "bg-neutral-700", // Slightly lighter for contrast
    number: "03"
  }
];

export const SolutionSection = () => {
  return (
    <div className="bg-black text-white py-20">
      <div className="text-center mb-20">
        <span className="text-gold-400 tracking-[0.2em] font-bold text-sm uppercase">Process</span>
        <h2 className="text-4xl md:text-5xl font-serif mt-4">Deep Tech Solution</h2>
      </div>

      <div className="px-6 md:px-20 max-w-screen-xl mx-auto space-y-20 pb-40">
        {cards.map((card, index) => (
          <Card key={index} {...card} index={index} total={cards.length} />
        ))}
      </div>
    </div>
  );
};

const Card = ({ title, subtitle, description, color, number, index }: { title: string, subtitle: string, description: string, color: string, number: string, index: number, total: number }) => {
  return (
    <div className="sticky top-24 md:top-32 w-full">
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.6 }}
            className={`${color} rounded-2xl p-8 md:p-12 border border-white/10 shadow-2xl relative overflow-hidden h-[400px] flex flex-col justify-between`}
            style={{ 
                zIndex: index,
                marginTop: index * 20 
            }}
        >
            <div className="flex justify-between items-start">
                <div>
                     <span className="text-gold-400 text-sm tracking-widest font-bold block mb-2">{subtitle}</span>
                     <h3 className="text-4xl md:text-6xl font-serif">{title}</h3>
                </div>
                <span className="text-6xl md:text-8xl font-serif text-white/5 opacity-20 font-bold">{number}</span>
            </div>
            
            <p className="text-white/70 text-lg md:text-xl font-light whitespace-pre-line leading-relaxed max-w-2xl">
                {description}
            </p>

            {/* Decorative Gradient */}
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl opacity-50" />
        </motion.div>
    </div>
  );
}
