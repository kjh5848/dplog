"use client";

import { motion } from "framer-motion";
import { TiltCard, InsetGrid } from "@/shared/ui/interactive-grid";
import { TextEffect } from "@/shared/ui/text-effect";

const V4_CARDS = [
  {
    title: "Real-time Ranking",
    description: "내순이 API 연동을 통한 키워드별 실시간 노출 순위를 즉시 수집합니다.",
    className: "md:col-span-8 md:row-span-2 min-h-[400px]",
    image: "https://images.unsplash.com/photo-1761839257946-4616bcfafec7?q=80&w=1169&auto=format&fit=crop",
  },
  {
    title: "AI Report",
    description: "RAG 지식 기반의 AI가 노출 요인을 정밀하게 분석하여 리포트를 생성합니다.",
    className: "md:col-span-4 md:row-span-1 min-h-[190px]",
    image: "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&w=1189&auto=format&fit=crop",
  },
  {
    title: "Action Plan",
    description: "오늘 당장 실행할 수 있는 우선순위 체크리스트를 제공합니다.",
    className: "md:col-span-4 md:row-span-1 min-h-[190px]",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1170&auto=format&fit=crop",
  },
  {
    title: "Diagnostic History",
    description: "지속적인 진단 데이터 축적을 통해 플레이스의 성장 궤적을 추적합니다.",
    className: "md:col-span-12 md:row-span-1 min-h-[220px]",
    image: "https://images.unsplash.com/photo-1652195960911-c9f55224bd89?q=80&w=687&auto=format&fit=crop",
  },
];

export default function HeroV4Page() {
  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-blue-500/30 overflow-x-hidden pt-32 pb-20 px-6 md:px-12 font-sans">
      {/* Background Ambience from V3 style */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05)_0%,transparent_70%)]" />
      </div>

      <div className="max-w-[1400px] mx-auto">
        {/* Header Section Section - Combined V2 structure with PRD value */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-12">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-[10px] font-black tracking-[0.6em] text-blue-500 uppercase mb-6 flex items-center gap-4">
                <span className="h-[1px] w-8 bg-blue-500/40" />
                D-PLOG Diagnostic Solution
              </h1>
              <div className="text-6xl md:text-8xl font-light tracking-[-0.06em] mb-10 text-white/95 leading-none">
                더 정확하게, <br /> <span className="text-white font-medium">더 압도적으로.</span>
              </div>
            </motion.div>
            
            <TextEffect per="word" preset="fade" className="text-2xl md:text-3xl text-white/50 font-extralight leading-snug tracking-tight">
              플레이스 노출의 정답, 근거 데이터로 진단합니다. 정밀 순위 분석부터 AI 리포트까지 10분이면 충분합니다.
            </TextEffect>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
          >
            <button className="group relative overflow-hidden rounded-none border border-white/20 bg-white px-10 py-5 text-xs font-bold uppercase tracking-[0.3em] text-black transition-all active:scale-95">
              지금 시작하기
            </button>
            <button className="rounded-none border border-white/10 bg-white/5 px-10 py-5 text-xs font-bold uppercase tracking-[0.3em] text-white/60 backdrop-blur-3xl transition-all hover:bg-white/10 hover:text-white">
              자세히 보기
            </button>
          </motion.div>
        </div>

        {/* Interactive Inset Grid with V3 Images */}
        <InsetGrid>
          {V4_CARDS.map((card, idx) => (
            <TiltCard key={idx} index={idx} className={card.className}>
              <div className="relative h-full w-full overflow-hidden rounded-[2.5rem] p-10 flex flex-col justify-between group border border-white/5">
                {/* Image Layer - Cinematic Treatment */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={card.image} 
                    alt={card.title} 
                    className="h-full w-full object-cover grayscale-[40%] brightness-[40%] group-hover:grayscale-0 group-hover:brightness-[60%] group-hover:scale-110 transition-all duration-1000 ease-[0.22, 1, 0.36, 1]" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700" />
                </div>

                <div className="relative z-10">
                   <motion.div 
                     initial={{ width: 0 }}
                     whileInView={{ width: "2rem" }}
                     className="h-[1px] bg-white/40 mb-8" 
                   />
                   <h3 className="text-3xl md:text-4xl font-light tracking-tight text-white/90 mb-3">
                      {card.title}
                   </h3>
                </div>

                <div className="relative z-10 flex items-end justify-between">
                   <p className="text-white/30 text-[11px] uppercase tracking-[0.2em] font-medium max-w-[240px] leading-relaxed">
                      {card.description}
                   </p>
                   <motion.div 
                     whileHover={{ scale: 1.1, rotate: 45 }}
                     className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md bg-white/5 text-white/60 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-500"
                   >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                   </motion.div>
                </div>
              </div>
            </TiltCard>
          ))}
        </InsetGrid>
      </div>

      <footer className="mt-52 border-t border-white/5 py-16 flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col gap-2 mb-8 md:mb-0">
          <p className="text-[10px] tracking-[0.5em] text-white/20 uppercase font-black">Archive / Hero V4</p>
          <p className="text-[9px] tracking-[0.1em] text-white/10 uppercase">Extraordinary Digital experience Lab.</p>
        </div>
        <div className="flex gap-12 uppercase tracking-[0.4em] text-[9px] text-white/30 font-bold">
           <a href="#" className="hover:text-white transition-colors">Privacy</a>
           <a href="#" className="hover:text-white transition-colors">Experience</a>
           <a href="#" className="hover:text-white transition-colors">Lab</a>
        </div>
      </footer>
    </div>
  );
}
