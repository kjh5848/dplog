"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { TextEffect } from "@/shared/ui/text-effect";
import { cn } from "@/shared/lib/utils";

const DASHBOARD_METRICS = [
  { label: "VELOCITY", value: "180", unit: "km/h", color: "text-blue-500" },
  { label: "ENGINE LOAD", value: "82", unit: "%", color: "text-indigo-500" },
  { label: "DATA FLOW", value: "1.2", unit: "gb/s", color: "text-blue-400" },
  { label: "GROWTH RATE", value: "24", unit: "%", color: "text-blue-600" },
];

export default function HeroV6Page() {
  const [speed, setSpeed] = useState(180);
  
  // Memoize random values to avoid React render purity issues while keeping dynamic feel
  const speedLines = useMemo(() => 
    [...Array(30)].map(() => ({
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: 0.3 + Math.random() * 0.4,
    }))
  , []);

  const gridDataPoints = useMemo(() => 
    [...Array(40)].map(() => ({
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
    }))
  , []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.min(Math.max(prev + delta, 170), 195);
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-sans select-none">
      {/* Background Image: AI Generated Car Drive */}
      <div className="absolute inset-0 z-0">
        <motion.div
           initial={{ scale: 1.1, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 2, ease: "easeOut" }}
           className="relative h-full w-full"
        >
          <img
            src="/assets/hero/hero-v7.png"
            alt="The Diagnostic Cockpit"
            className="h-full w-full object-cover brightness-[50%]"
          />
          {/* Light Leak Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-transparent to-blue-900/10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </motion.div>
      </div>

      {/* PERSPECTIVE DATA ROAD - The "Data High-way" */}
      <div className="absolute bottom-0 left-0 w-full h-[40%] z-0 overflow-hidden perspective-[1000px]">
         <motion.div 
           initial={{ rotateX: 60, scale: 2 }}
           animate={{ rotateX: 60, scale: 2 }}
           className="absolute inset-0 w-full h-[200%] origin-top"
           style={{ 
             backgroundImage: "linear-gradient(to right, #3b82f620 1px, transparent 1px), linear-gradient(to bottom, #3b82f620 1px, transparent 1px)",
             backgroundSize: "60px 60px",
           }}
         >
           {/* Moving Grid Animation */}
           <motion.div 
             animate={{ y: ["0%", "100%"] }}
             transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
             className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(59,130,246,0.1)_50%,transparent_100%)] h-full w-full"
           />
           
           {/* Streaming Data Particles on Grid */}
           {gridDataPoints.map((p, i) => (
             <motion.div
               key={i}
               className="absolute w-1 h-32 bg-blue-500/40 blur-[2px]"
               animate={{ y: ["-10%", "110%"] }}
               transition={{ duration: 0.4, repeat: Infinity, delay: p.delay, ease: "linear" }}
               style={{ left: p.left }}
             />
           ))}
         </motion.div>
         {/* Fade out the road into the distance */}
         <div className="absolute inset-0 bg-gradient-to-t from-transparent via-black/40 to-black z-10" />
      </div>

      {/* Speed Lines Emulation */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-40">
         {speedLines.map((line, i) => (
           <motion.div
             key={i}
             initial={{ x: "-100%", opacity: 0 }}
             animate={{ x: "200%", opacity: [0, 1, 0] }}
             transition={{ 
               duration: line.duration, 
               repeat: Infinity, 
               delay: line.delay,
               ease: "linear"
             }}
             className="absolute h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent w-[500px]"
             style={{ top: line.top, left: 0 }}
           />
         ))}
      </div>

      {/* Main Narrative */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center pt-20 px-6">
        <div className="max-w-6xl w-full text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 1 }}
             className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 backdrop-blur-md"
           >
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span className="text-[10px] font-black tracking-[0.4em] text-white/60 uppercase">D-PLOG : Drive Mode Active</span>
           </motion.div>

           <div className="mb-4 overflow-hidden">
             <TextEffect per="char" preset="fade" className="text-xl md:text-2xl font-light tracking-[0.5em] text-blue-500 uppercase italic">
                Data Driven
             </TextEffect>
           </div>

           <motion.h1
             initial={{ opacity: 0, filter: "blur(20px)", scale: 0.8 }}
             animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
             transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
             className="text-7xl md:text-[12rem] font-black tracking-tighter text-white leading-[0.85] italic mb-12"
           >
             GROWTH
           </motion.h1>

           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1, duration: 1.5 }}
             className="flex flex-col md:flex-row items-center justify-center gap-12 mt-4"
           >
              <div className="max-w-md text-left md:border-l border-white/10 md:pl-8">
                 <p className="text-lg text-white/40 font-light leading-relaxed">
                    플레이스 노출 진단, <br />
                    비즈니스의 가속도를 결정하는 <br />
                    <span className="text-white font-medium">데이터 드리븐 엔진</span>을 탑재하세요.
                 </p>
              </div>

              <div className="flex gap-4">
                 <button className="h-20 px-12 bg-white text-black font-black text-xs uppercase tracking-[0.4em] hover:bg-blue-600 hover:text-white transition-all duration-500 active:scale-95">
                    가속 시작하기
                 </button>
                 <button className="h-20 px-12 border border-white/20 bg-white/5 backdrop-blur-md text-white font-black text-xs uppercase tracking-[0.4em] hover:bg-white/10 transition-all duration-500 active:scale-95">
                    엔진 진단
                 </button>
              </div>
           </motion.div>
        </div>
      </div>

      {/* Dashboard Metrics Layer */}
      <div className="absolute bottom-12 left-12 right-12 z-20 hidden md:block">
         <div className="flex justify-between items-end border-t border-white/10 pt-10">
            <div className="grid grid-cols-4 gap-16">
               {DASHBOARD_METRICS.map((m, i) => (
                 <div key={i} className="flex flex-col gap-2">
                    <span className="text-[9px] font-black tracking-[0.3em] text-white/30 uppercase">{m.label}</span>
                    <div className="flex items-baseline gap-1">
                       <span className={cn("text-4xl font-light tracking-tighter font-mono", m.color)}>
                          {m.label === "VELOCITY" ? speed : m.value}
                       </span>
                       <span className="text-[10px] text-white/20 font-bold uppercase">{m.unit}</span>
                    </div>
                 </div>
               ))}
            </div>

            <div className="flex flex-col items-end gap-4">
               <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={cn("h-4 w-1 rounded-full", i < (speed-150)/10 ? "bg-blue-500" : "bg-white/10")} />
                  ))}
               </div>
               <span className="text-[10px] tracking-[0.4em] text-white/20 uppercase">Place AI Engine v.3.0</span>
            </div>
         </div>
      </div>

      {/* Corner Decorative Elements */}
      <div className="absolute top-12 left-12 z-20 text-[9px] tracking-[0.4em] text-white/20 uppercase font-black">
         Diagnostic Radar / 001
      </div>
      <div className="absolute top-12 right-12 z-20 flex items-center gap-4">
         <div className="h-1 w-24 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
               animate={{ width: ["0%", "100%", "0%"] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="h-full bg-blue-500" 
            />
         </div>
         <span className="text-[9px] tracking-[0.4em] text-white/20 uppercase font-black">Scanning</span>
      </div>
    </div>
  );
}
