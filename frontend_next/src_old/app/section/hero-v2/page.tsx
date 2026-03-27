"use client";

import React from "react";
import { motion } from "framer-motion";
import { TiltCard, InsetGrid } from "@/shared/ui/interactive-grid";
import { TextEffect } from "@/shared/ui/text-effect";
import { GooeyText } from "@/shared/ui/gooey-text";
import { cn } from "@/shared/lib/utils";

const V2_CARDS = [
  {
    title: "Intelligence",
    description: "데이터의 흐름을 읽는 고지능 솔루션",
    className: "md:col-span-8 md:row-span-2 min-h-[400px]",
    image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Interface",
    description: "한계를 넘어서는 사용자 경험",
    className: "md:col-span-4 md:row-span-1 min-h-[190px]",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Connectivity",
    description: "모든 것을 하나로 잇는 기술",
    className: "md:col-span-4 md:row-span-1 min-h-[190px]",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Evolution",
    description: "진화하는 시스템 아키텍처",
    className: "md:col-span-12 md:row-span-1 min-h-[220px]",
    image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1600&q=80",
  },
];

export default function HeroV2Page() {
  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-purple-500/30 overflow-x-hidden pt-32 pb-20 px-6 md:px-12">
      {/* Background Ambience */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-sm font-bold tracking-[0.3em] text-purple-500 uppercase mb-4">
                Version 2.0 / Immersive
              </h1>
              <div className="text-6xl md:text-8xl font-black tracking-tightest mb-8">
                D-PLOG
              </div>
            </motion.div>
            <TextEffect per="char" preset="blur" className="text-xl md:text-2xl text-white/40 font-light leading-relaxed">
              우리는 정적인 웹을 넘어, 생동감 있게 반응하는 디지털 경험을 설계합니다. 
              기술과 예술이 교차하는 지점에서 태어난 D-PLOG v2를 만나보세요.
            </TextEffect>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-4"
          >
            <button className="group relative overflow-hidden rounded-full bg-white px-10 py-5 text-sm font-bold text-black transition-all hover:pr-14 active:scale-95">
              무료 14일 체험
              <svg className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 transition-all group-hover:opacity-100" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
            <button className="rounded-full border border-white/10 bg-white/5 px-10 py-5 text-sm font-bold backdrop-blur-xl transition-all hover:bg-white/10">
              알아보기
            </button>
          </motion.div>
        </div>

        {/* Interactive Inset Grid */}
        <InsetGrid>
          {V2_CARDS.map((card, idx) => (
            <TiltCard key={idx} index={idx} className={card.className}>
              <div className="relative h-full w-full overflow-hidden rounded-3xl p-8 flex flex-col justify-between">
                {/* Image Layer */}
                <div className="absolute inset-0 z-0">
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover opacity-30 grayscale hover:grayscale-0 transition-all duration-700 hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="relative z-10">
                   <div className="h-[1px] w-8 bg-purple-500 mb-6" />
                   <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 underline-offset-8 group-hover:underline">
                      {card.title}
                   </h3>
                </div>

                <div className="relative z-10 flex items-end justify-between">
                   <p className="text-white/40 text-sm max-w-[200px]">
                      {card.description}
                   </p>
                   <div className="h-12 w-12 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                   </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </InsetGrid>
      </div>

      <footer className="mt-40 border-t border-white/5 py-12 flex flex-col md:flex-row items-center justify-between text-xs text-white/20">
        <p>© 2026 D-PLOG LABS. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-8 mt-4 md:mt-0 uppercase tracking-widest">
           <a href="#" className="hover:text-white transition-colors">Privacy</a>
           <a href="#" className="hover:text-white transition-colors">Terms</a>
           <a href="#" className="hover:text-white transition-colors">Github</a>
        </div>
      </footer>
    </div>
  );
}
