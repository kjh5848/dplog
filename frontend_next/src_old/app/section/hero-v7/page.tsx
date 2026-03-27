"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { TextEffect } from "@/shared/ui/text-effect";
import { cn } from "@/shared/lib/utils";

const HUD_DATA = [
  { label: "PLACE LOGIC", value: "ANALYZED", status: "optimized" },
  { label: "GROWTH LOG", value: "RECORDING...", status: "active" },
  { label: "DIAGNOSTIC", value: "100%", status: "stable" },
  { label: "DRIVE MODE", value: "SPORT", status: "ready" },
];

export default function HeroV7Page() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isSystemActive, setIsSystemActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 20;
      const y = (clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    
    // Auto-active system after intro
    const timer = setTimeout(() => setIsSystemActive(true), 1500);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timer);
    };
  }, []);

  // Parallax effects for cockpit simulation
  const springX = useSpring(mousePos.x, { stiffness: 100, damping: 30 });
  const springY = useSpring(mousePos.y, { stiffness: 100, damping: 30 });

  return (
    <div ref={containerRef} className="relative h-screen w-full bg-black overflow-hidden font-sans select-none perspective-[1200px]">
      
      {/* 1. LAYER: MAIN BACKGROUND (COCKPIT VIEW) */}
      <motion.div 
        style={{ 
          x: useTransform(springX, (val) => val * -0.5),
          y: useTransform(springY, (val) => val * -0.5),
          scale: 1.05
        }}
        className="absolute inset-0 z-0"
      >
        <img
          src="/brain/6a8c9298-8a8c-41b8-9c18-f4f77db30130/hero_v7_cockpit_view_1770876793783.png"
          alt="The Diagnostic Cockpit"
          className="h-full w-full object-cover brightness-[50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />
      </motion.div>

      {/* 2. LAYER: INTERACTIVE AR HUD OVERLAY */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <motion.div 
           style={{ 
             x: useTransform(springX, (val) => val * 1.2),
             y: useTransform(springY, (val) => val * 1.2),
             rotateY: useTransform(springX, (val) => val * 0.1),
             rotateX: useTransform(springY, (val) => val * -0.1),
           }}
           className="h-full w-full flex flex-col items-center justify-center pt-20"
        >
           {/* Center Targeting / Logic Grid */}
           <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-0">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-blue-500/20 rounded-full border-dashed" 
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border border-blue-400/10 rounded-full" 
              />
              
              <div className="text-center z-10 bg-black/20 backdrop-blur-sm p-8 rounded-full border border-white/5">
                 <motion.div
                   animate={isSystemActive ? { opacity: [0.5, 1, 0.5] } : {}}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="text-[10px] font-black tracking-[0.5em] text-blue-500 uppercase mb-2"
                 >
                   Scanning
                 </motion.div>
                 <div className="text-4xl font-black text-white italic">D-PLOG</div>
              </div>
           </div>

           {/* Repositioned HUD Labels: Side Dashboard Style */}
           <div className="absolute inset-x-0 bottom-64 px-12 flex justify-between items-end pointer-events-none">
              {/* Left Side HUD */}
              <div className="flex flex-col gap-4">
                {HUD_DATA.slice(0, 2).map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -30 }}
                    animate={isSystemActive ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1 + i * 0.2 }}
                    className="bg-blue-900/10 border-l-2 border-blue-500/40 p-4 backdrop-blur-xl min-w-[200px]"
                  >
                     <div className="text-[9px] font-black text-blue-400/60 uppercase tracking-[0.2em] mb-2">{item.label}</div>
                     <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-white font-mono">{item.value}</span>
                        <span className="text-[8px] text-blue-500 px-2 py-0.5 border border-blue-500/30 rounded uppercase">{item.status}</span>
                     </div>
                  </motion.div>
                ))}
              </div>

              {/* Right Side HUD */}
              <div className="flex flex-col gap-4 text-right">
                {HUD_DATA.slice(2, 4).map((item, i) => (
                  <motion.div 
                    key={i+2}
                    initial={{ opacity: 0, x: 30 }}
                    animate={isSystemActive ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 1.4 + i * 0.2 }}
                    className="bg-blue-900/10 border-r-2 border-blue-500/40 p-4 backdrop-blur-xl min-w-[200px]"
                  >
                     <div className="text-[9px] font-black text-blue-400/60 uppercase tracking-[0.2em] mb-2">{item.label}</div>
                     <div className="flex items-center justify-between flex-row-reverse">
                        <span className="text-base font-bold text-white font-mono">{item.value}</span>
                        <span className="text-[8px] text-blue-500 px-2 py-0.5 border border-blue-500/30 rounded uppercase">{item.status}</span>
                     </div>
                  </motion.div>
                ))}
              </div>
           </div>
        </motion.div>
      </div>

      {/* 3. LAYER: NARRATIVE & ACTION CRITICAL */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pt-64 px-6 pointer-events-none">
         <motion.div 
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 1.8, duration: 1 }}
           className="text-center"
         >
            <div className="text-5xl md:text-[5.5rem] font-light tracking-tighter text-white mb-12 leading-tight">
              데이터의 바다를 가르는 <br /> 
              <span className="text-white font-black italic">가장 완벽한 지휘관.</span>
            </div>
            
            <div className="flex gap-6 justify-center pointer-events-auto">
              <button className="h-20 px-12 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.5em] transition-all active:scale-95 shadow-[0_0_60px_rgba(37,99,235,0.4)]">
                콕핏 접속하기
              </button>
              <button className="h-20 px-12 border border-white/20 bg-white/5 backdrop-blur-3xl text-white/50 hover:text-white text-[11px] font-black uppercase tracking-[0.5em] transition-all active:scale-95">
                진단 매뉴얼
              </button>
            </div>
         </motion.div>
      </div>

      {/* Side Decorative Gadgets */}
      <div className="absolute top-12 left-12 z-20 flex flex-col gap-8 opacity-40">
         <div className="flex flex-col gap-1">
            <div className="text-[8px] font-black text-white tracking-widest uppercase mb-2">Diagnostic Logic</div>
            {[...Array(6)].map((_, i) => (
              <motion.div 
                key={i} 
                animate={{ width: [10, 40, 10] }} 
                transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                className="h-0.5 bg-blue-500/50" 
              />
            ))}
         </div>
      </div>

      <div className="absolute top-12 right-12 z-20 text-right opacity-40">
         <div className="text-[8px] font-black text-white tracking-widest uppercase mb-2">Place Log System</div>
         <div className="text-[12px] font-mono text-blue-400">LN-04:88:AZ21</div>
         <div className="w-32 h-[1px] bg-white/10 mt-2" />
         <div className="text-[7px] text-white/30 mt-1 uppercase">Continuous Recording Active</div>
      </div>

      {/* Screen Glitch Overlay */}
      <motion.div 
        animate={{ opacity: [0, 0.03, 0] }}
        transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 5 }}
        className="absolute inset-0 bg-blue-500/10 pointer-events-none z-50 mix-blend-screen"
      />
    </div>
  );
}

// Simple AnimatePresence workaround if not imported correctly
function AnimatePresence({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
