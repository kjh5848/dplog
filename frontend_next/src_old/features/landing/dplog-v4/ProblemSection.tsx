"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AlertTriangle, TrendingDown, Activity, AlertOctagon } from "lucide-react";
import NoiseOverlay from "./NoiseOverlay";

export default function ProblemSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress -> Parallax & Opacity
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  return (
    <section ref={containerRef} className="relative w-full h-screen flex items-center justify-center bg-[#0b0f0c] text-white overflow-hidden font-sans">
      {/* 1. Background: Deep Dark Navy/Black with Grid Scan */}
      <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(20,30,25,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(20,30,25,0.8)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
          
          {/* Scanning Line Animation */}
          <motion.div 
            className="absolute inset-x-0 h-[2px] bg-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
          
          <NoiseOverlay opacity={0.4} />
          
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0b0f0c_90%)]"></div>
      </div>

      <div className="z-10 container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative">
        {/* Decorative System Lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-white/10 hidden md:block"></div>
        <div className="absolute bottom-0 left-0 w-full h-px bg-white/10 hidden md:block"></div>

        {/* Left: Text Content - System Alert Style */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false }}
          >
            {/* Tag */}
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-sm bg-red-950/30 border border-red-900/50 mb-6">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-red-400 text-xs font-mono tracking-[0.2em] uppercase">시스템 경고: 위험 단계</span>
            </div>
            
            {/* Headline */}
            <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              <span className="block text-white/40 text-2xl md:text-3xl font-light mb-2 tracking-wide">경고:</span>
              <span className="relative inline-block text-white">
                 매출 하락
                 <svg className="absolute w-full h-2 bottom-1 left-0 text-red-600" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <line x1="0" y1="5" x2="100" y2="5" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                 </svg>
              </span>
              <br />
              <span className="text-red-500 font-mono tracking-tighter decoration-clone">
                감지됨
              </span>
            </h2>
            
            <p className="text-lg text-[#f1f4ee]/60 border-l-2 border-red-900/50 pl-6 leading-relaxed max-w-md">
              <span className="text-red-400 font-mono text-xs block mb-2">// 분석 리포트 </span>
              직관에 의존한 경영 방식이 <br/>
              <strong className="text-white">한계점에 도달했습니다.</strong><br/>
              데이터 부재로 인한 생존 확률 급감 중.
            </p>
          </motion.div>
        </div>

        {/* Right: Holographic HUD / Graph */}
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative perspective-1000"
        >
            {/* HUD Container */}
            <div className="relative bg-[#0f1412]/80 border border-white/10 backdrop-blur-md p-8 rounded-xl overflow-hidden group hover:border-red-500/30 transition-colors duration-500">
                {/* HUD Decor */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/50"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/50"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500/50"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/50"></div>

                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-mono text-white/50 uppercase">실시간 지표 모니터링</span>
                    </div>
                    <span className="text-xs font-mono text-red-500 animate-pulse">● 분석 중</span>
                </div>
                
                {/* Graph Area */}
                <div className="relative h-48 w-full flex items-end justify-between px-2 gap-2">
                     {/* Bars */}
                    {[65, 55, 45, 30, 15].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col justify-end gap-1 group/bar">
                            <motion.div 
                                initial={{ height: 0 }}
                                whileInView={{ height: `${h}%` }}
                                transition={{ delay: i * 0.1, duration: 0.6, type: "spring" }}
                                className={`w-full relative ${i === 4 ? 'bg-red-600/80 shadow-[0_0_15px_rgba(220,38,38,0.6)]' : 'bg-white/10'}`}
                            >
                                {i === 4 && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-mono text-red-400 whitespace-nowrap">
                                        위험
                                    </div>
                                )}
                            </motion.div>
                            <div className="h-[2px] w-full bg-white/5 group-hover/bar:bg-white/20 transition-colors"></div>
                        </div>
                    ))}
                    
                    {/* Trend Line Overlay */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <motion.path
                            d="M 10 70 L 60 100 L 110 130 L 160 170 L 210 200" // Simplified points, just visual
                            fill="none"
                            stroke="rgba(239, 68, 68, 0.5)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 2, ease: "linear" }}
                        />
                         <defs>
                            <linearGradient id="gradientRed" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="rgba(220, 38, 38, 0.5)" />
                            <stop offset="100%" stopColor="rgba(220, 38, 38, 0)" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Footer Alert */}
                <div className="mt-6 flex items-start gap-3 bg-red-500/10 p-4 rounded border border-red-500/20">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <div className="text-red-400 text-sm font-bold font-mono tracking-wide">분석 데이터 부족</div>
                        <div className="text-red-400/60 text-xs mt-1 leading-snug">
                            생존을 위한 운영 데이터가 부족합니다.<br/>
                            즉시 정밀 진단이 필요합니다.
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Glow backing */}
            <div className="absolute -inset-4 bg-red-600/5 blur-[80px] -z-10"></div>
        </motion.div>
      </div>
    </section>
  );
}
