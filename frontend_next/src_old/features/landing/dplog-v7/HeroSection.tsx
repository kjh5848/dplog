import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import FeatureSlideshow from "./FeatureSlideshow";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen flex flex-col items-center pt-32 md:pt-48 overflow-hidden bg-brand-primary selection:bg-brand-secondary/30">
      {/* Advanced Background: Grid + Noise + Glow */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* Primary Glow - Top Center */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-secondary/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      
      {/* Secondary Glow - Bottom Left Accent */}
      <div className="absolute bottom-0 left-0 w-[800px] h-[600px] bg-purple-900/10 blur-[150px] rounded-full pointer-events-none mix-blend-screen" />

      {/* Badge - High Fidelity Glass Pill */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-glass border border-white/10 text-sm text-text-secondary mb-10 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02] transition-all cursor-pointer group backdrop-blur-md shadow-[0_0_20px_-10px_rgba(59,130,246,0.5)]"
      >
        <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
        </span>
        <span className="font-medium tracking-wide text-xs md:text-sm bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">New: AI Diagnosis Engine V2 is live</span>
        <ArrowRight size={14} className="text-gray-400 group-hover:translate-x-0.5 transition-transform" />
      </motion.div>

      {/* Headline - "Tight" Apple Style Typography */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="relative z-10 text-5xl md:text-7xl lg:text-8xl font-semibold text-center tracking-tighter leading-[1.05] mb-8 text-text-primary max-w-5xl mx-auto drop-shadow-2xl font-display"
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/70">매장 노출 순위,</span><br/>
        <span className="bg-clip-text text-transparent bg-gradient-to-b from-gray-400 via-gray-500 to-gray-700">데이터로 증명합니다.</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="relative z-10 text-lg md:text-xl text-text-secondary text-center max-w-2xl mb-12 leading-relaxed px-4 font-medium tracking-tight font-body"
      >
        "왜 우리 가게만 안 보일까?"<br className="md:hidden"/>
        감에 의존하지 마세요. 경쟁사 비교 분석부터 실행 가이드까지,<br className="hidden md:block"/>
        D-PLOG가 <strong>매출 상승의 로드맵</strong>을 제시합니다.
      </motion.p>

      {/* CTA Buttons - Advanced Glow Interactions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        className="relative z-10 flex flex-col md:flex-row items-center gap-4 mb-24"
      >
        <button className="btn-primary group">
            <span className="relative z-10 flex items-center gap-2">
                무료로 진단하기 <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        </button>
        <button className="btn-glass">
            도입 사례 보기
        </button>
      </motion.div>
      
       {/* Feature Slideshow - Infinite Loop */}
       <motion.div
         initial={{ opacity: 0, y: 50 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
         className="w-full relative z-10"
       >
          <FeatureSlideshow />
       </motion.div>

    </section>
  );
}
