'use client';
import React from 'react';
import { motion } from 'framer-motion';

const features = [
    { title: "Automated Reporting", desc: "매주 자동으로 생성되는 성과 보고서", col: "col-span-1 md:col-span-2", row: "row-span-2", bg: "bg-neutral-900" },
    { title: "Real-time Analytics", desc: "실시간으로 확인하는 마케팅 지표", col: "col-span-1", row: "row-span-1", bg: "bg-neutral-800" },
    { title: "Smart Matching", desc: "AI 기반 정부지원사업 매칭", col: "col-span-1", row: "row-span-1", bg: "bg-neutral-800" },
    { title: "Cost Optimization", desc: "불필요한 지출을 줄이는 비용 최적화", col: "col-span-1 md:col-span-2", row: "row-span-1", bg: "bg-neutral-900" },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export const FeatureSection = () => {
  return (
    <section className="py-32 bg-black text-white px-6 md:px-20">
         <div className="max-w-screen-xl mx-auto">
            <div className="mb-16">
                <span className="text-gold-400 tracking-[0.2em] font-bold text-sm uppercase">Features</span>
                <h2 className="text-4xl md:text-5xl font-serif mt-4">Why D-PLOG?</h2>
            </div>
            
            <motion.div 
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-10%" }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[240px]"
            >
                {features.map((feat, idx) => (
                    <motion.div
                        key={idx}
                        variants={item}
                        className={`${feat.col} ${feat.row} ${feat.bg} rounded-3xl p-8 border border-white/10 hover:border-gold-500/50 transition-colors group relative overflow-hidden`}
                    >
                         <div className="relative z-10 h-full flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-serif mb-2">{feat.title}</h3>
                                <p className="text-white/60 font-light">{feat.desc}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-gold-500 group-hover:text-black transition-all">
                                <span className="text-lg">↗</span>
                            </div>
                         </div>

                         {/* Background Decoration */}
                         <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700 ease-in-out" />
                    </motion.div>
                ))}
            </motion.div>
         </div>
    </section>
  );
};
