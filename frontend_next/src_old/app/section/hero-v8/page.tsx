"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TextEffect } from "@/shared/ui/text-effect";
import { cn } from "@/shared/lib/utils";

const SERVICE_METRICS = [
  { label: "DAILY ANALYSIS", value: "2,482", unit: "P", color: "text-blue-600" },
  { label: "AI MATCH RATE", value: "98.2", unit: "%", color: "text-indigo-600" },
  { label: "GROWTH SCORE", value: "S+", unit: "LV", color: "text-blue-500" },
  { label: "SERVER STATUS", value: "STABLE", unit: "OK", color: "text-teal-600" },
];

interface Line {
  id: number;
  top: string;
  delay: number;
  duration: number;
  opacity: number;
  width: number;
}

export default function HeroV8Page() {
  const [lines, setLines] = useState<Line[]>([]);

  useEffect(() => {
    // Initialize random lines only on client mount to fix purity issue
    const generatedLines = [...Array(40)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 4,
      duration: 0.3 + Math.random() * 0.5,
      opacity: 0.1 + Math.random() * 0.3,
      width: 200 + Math.random() * 600,
    }));
    setLines(generatedLines);
  }, []);

  return (
    <div className="relative h-screen w-full bg-white overflow-hidden font-sans select-none text-slate-900">
      
      {/* 1. LAYER: BRIGHT MOTION GRADIENT */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.05)_0%,transparent_50%)]" />

      {/* 2. LAYER: ENHANCED LIGHT SPEED LINES (The "Motion Highway") */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden h-full">
         {lines.map((line) => (
           <motion.div
             key={line.id}
             initial={{ x: "-150%" }}
             animate={{ x: "250%" }}
             transition={{ 
               duration: line.duration, 
               repeat: Infinity, 
               delay: line.delay,
               ease: "linear"
             }}
             className="absolute h-[2px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent blur-[0.2px]"
             style={{ 
                top: line.top, 
                left: 0, 
                width: `${line.width}px`,
                opacity: line.opacity * 2.5 // 진하게 강화
             }}
           />
         ))}
         
         {/* Vertical Particle Accents */}
         {[...Array(10)].map((_, i) => (
            <motion.div
              key={`v-${i}`}
              animate={{ opacity: [0, 0.4, 0], scale: [0.5, 1.5, 0.5] }}
              transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.5 }}
              className="absolute w-1.5 h-1.5 bg-blue-500/30 rounded-full blur-[2px]"
              style={{ top: `${10 * i}%`, left: `${15 * i}%` }}
            />
         ))}
      </div>

      {/* 3. LAYER: PREMIUM K-SAAS UI */}
      <div className="relative z-10 flex h-full flex-col justify-start pt-[12vh] px-8 md:px-24">
        <div className="max-w-5xl relative w-full">
           {/* Abstract Decorative Element */}
           <motion.div 
             animate={{ rotate: 360 }}
             transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
             className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" 
           />

           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="inline-flex items-center gap-3 bg-blue-50 border border-blue-100 px-5 py-2 rounded-full mb-8"
           >
              <div className="flex gap-1">
                 <span className="w-1 h-1 rounded-full bg-blue-600 animate-pulse" />
                 <span className="w-1 h-1 rounded-full bg-blue-600/60 animate-pulse delay-75" />
                 <span className="w-1 h-1 rounded-full bg-blue-600/30 animate-pulse delay-150" />
              </div>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-blue-700">Service Accelerator</span>
           </motion.div>

           <div className="mb-4">
             <TextEffect per="word" preset="fade" className="text-xl md:text-2xl font-semibold text-slate-400 tracking-tight">
                사장님의 플레이스 성장을 위한
             </TextEffect>
           </div>

           <motion.h1
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
             className="text-6xl md:text-[7.5rem] font-black tracking-tighter text-slate-900 leading-[0.85] mb-8"
           >
             DATA DRIVEN <br /> 
             <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic">GROWTH.</span>
           </motion.h1>

           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.8, duration: 1 }}
             className="flex flex-col md:flex-row items-center justify-between gap-8 w-full border-t border-slate-100 pt-8"
           >
              <div className="max-w-md text-center md:text-left">
                 <p className="text-base md:text-lg text-slate-500 font-medium leading-relaxed">
                    복잡한 분석은 D-PLOG에게 맡기세요. <br />
                    사장님은 그저 <span className="text-blue-600 font-bold">성장의 가속도</span>를 즐기시면 됩니다.
                 </p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                 <button className="flex-1 md:flex-none h-16 md:h-20 px-10 md:px-16 bg-blue-600 text-white font-bold text-sm rounded-2xl hover:bg-slate-900 transition-all duration-500 active:scale-95 shadow-2xl shadow-blue-500/20">
                    지금 바로 가속 시작
                 </button>
                 <button className="flex-1 md:flex-none h-16 md:h-20 px-10 md:px-16 bg-white border border-slate-200 text-slate-500 font-bold text-sm rounded-2xl hover:border-blue-300 hover:text-blue-600 transition-all duration-300 active:scale-95">
                    서비스 가이드
                 </button>
              </div>
           </motion.div>
        </div>
      </div>

      {/* 4. LAYER: CLEAN SERVICE WIDGETS */}
      <div className="absolute bottom-16 left-8 right-8 md:left-24 md:right-24 z-20">
         <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SERVICE_METRICS.map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="group relative bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] hover:border-blue-200 transition-all duration-500 overflow-hidden"
              >
                 <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                 </div>
                 
                 <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-4 group-hover:text-blue-500 transition-colors">{m.label}</div>
                 <div className="flex items-baseline gap-1">
                    <span className={cn("text-4xl font-black tabular-nums tracking-tighter", m.color)}>
                       {m.value}
                    </span>
                    <span className="text-[10px] text-slate-300 font-bold uppercase">{m.unit}</span>
                 </div>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Top Decoration */}
      <div className="absolute top-12 left-12 right-12 z-20 flex justify-between items-center text-[10px] font-black tracking-[0.4em] text-slate-200 uppercase">
         <div>Connection: Secured</div>
         <div className="flex items-center gap-4">
            <span className="block h-[1px] w-20 bg-slate-100" />
            <span className="text-slate-400">Engine V.8.0</span>
         </div>
      </div>

    </div>
  );
}
