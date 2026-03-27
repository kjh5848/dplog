"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";

// ─── Inline Data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    title: "RAG 기반 정밀 진단",
    description:
      "단순히 매출 추이만 보여주지 않습니다. RAG 엔진이 리뷰와 상권 데이터를 분석하여 '왜' 매출이 떨어졌는지, '무엇'을 개선해야 하는지 명확한 원인과 처방을 제시합니다.",
    videoSrc:
      "https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4", // Data Analysis Dashboard
  },
  {
    title: "AI 콘텐츠 팩토리",
    description:
      "전문 마케터 없이도 블로그 원고, 인스타그램 이미지, 숏폼 대본을 AI가 자동으로 생성합니다. 매일 반복되는 마케팅 고민을 10분 만에 해결하세요.",
    videoSrc:
      "https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4", // Content Creation / Typing
  },
  {
    title: "맞춤형 성장 로드맵",
    description:
      "내 가게 상황에 딱 맞는 정부 지원사업을 자동으로 매칭하고, 복잡한 사업계획서 초안까지 작성해 드립니다. 비용 부담은 줄이고 성장 기회는 놓치지 마세요.",
    videoSrc:
      "https://videos.pexels.com/video-files/7688460/7688460-uhd_2560_1440_30fps.mp4", // Business Planning / Meeting
  },
];

// ─── Inline Components ───────────────────────────────────────────────────────

interface NoiseOverlayProps {
  opacity?: number;
}

const NoiseOverlay: React.FC<NoiseOverlayProps> = ({ opacity = 0.2 }) => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-0 mix-blend-overlay"
      style={{ opacity }}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150"></div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function FeatureStickySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section ref={containerRef} className="relative w-full bg-white text-zinc-900 overflow-visible">
      <NoiseOverlay opacity={0.05} />
      
      {/* 
        Sticky Layout Logic:
        The container div uses flex. 
        Left column has md:sticky md:top-0 to stay during parent scroll.
        Note: Parent sections or main container must not have overflow-hidden 
        that breaks sticky position.
      */}
      <div className="flex flex-col md:flex-row w-full items-start">
        
        {/* Left Column: Sticky Title (1열 고정) */}
        <div className="w-full md:w-[40%] p-8 md:p-16 h-auto md:h-screen md:sticky md:top-0 flex flex-col justify-center z-10 bg-white/90 backdrop-blur-md md:bg-transparent">
             <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-xl"
             >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-1 bg-emerald-500"></div>
                    <span className="text-emerald-600 font-bold tracking-[0.2em] text-xl uppercase">Features</span>
                </div>
                <h2 className="text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter mb-10 text-black">
                    실행 중심<br/>
                    <span className="text-emerald-600">AI 경영</span>
                </h2>
                <div className="space-y-4">
                    <p className="text-zinc-400 text-3xl font-extralight leading-tight">
                        조회만 하는 대시보드는 그만.
                    </p>
                    <p className="text-zinc-900 text-3xl font-bold leading-tight">
                        매출을 실제로 움직이는<br/>
                        데이터 기반 액션을 제안합니다.
                    </p>
                </div>
             </motion.div>
        </div>

        {/* Right Column: Scrolling Content (2열 스크롤) */}
        <div className="w-full md:w-[60%] p-6 md:p-20 space-y-40 md:space-y-80 py-24 md:py-40">
             {FEATURES.map((feature, index) => (
                <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 100 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    viewport={{ once: true, margin: "-10%" }}
                    className="flex flex-col gap-12 group"
                >
                    <div className="max-w-2xl">
                        <span className="text-emerald-500 font-mono text-lg mb-4 block">0{index + 1}</span>
                        <h3 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-black break-keep">{feature.title}</h3>
                        <p className="text-zinc-500 text-2xl md:text-3xl font-light leading-relaxed text-left break-keep">
                            {feature.description}
                        </p>
                    </div>

                    {/* Video/Image Content - Larger with better framing */}
                    <div className="relative w-full rounded-[3rem] overflow-hidden shadow-[0_30px_100px_-20px_rgba(0,0,0,0.15)] bg-zinc-50 aspect-[16/10] border border-zinc-100">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                            src={feature.videoSrc}
                        />
                        <div className="absolute inset-0 ring-1 ring-black/5 rounded-[3rem] pointer-events-none"></div>
                        
                        {/* Overlay UI Mockup */}
                        <div className="absolute bottom-10 left-10">
                            <div className="flex items-center gap-4 px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20">
                                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                                <span className="text-xs font-bold font-mono text-white tracking-widest">REAL-TIME INSIGHT</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
             ))}
             
             {/* Bottom Spacer to ensure last item clears comfortably */}
             <div className="h-60"></div>
        </div>
      </div>
    </section>
  );
}
