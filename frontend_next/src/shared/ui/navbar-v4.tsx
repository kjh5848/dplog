"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

export const NavbarV4 = () => {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [diagnosisCount, setDiagnosisCount] = useState(1284);

  useEffect(() => {
    const unsub = scrollY.on("change", (latest) => {
      setScrolled(latest > 50);
    });
    
    // 심심하지 않게 진단 수 시뮬레이션
    const interval = setInterval(() => {
      setDiagnosisCount(prev => prev + Math.floor(Math.random() * 2));
    }, 5000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [scrollY]);

  return (
    <div className="fixed top-0 left-0 w-full z-[100] flex justify-center p-4 md:p-6 pointer-events-none">
      <motion.nav
        layout
        initial={false}
        animate={{
          width: scrolled ? "auto" : "100%",
          maxWidth: scrolled ? "600px" : "1200px",
          backgroundColor: scrolled ? "rgba(10, 10, 10, 0.8)" : "rgba(255, 255, 255, 0.03)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(0px)",
          borderRadius: scrolled ? "40px" : "16px",
          padding: scrolled ? "8px 12px" : "16px 24px",
          border: scrolled ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(255,255,255,0.05)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex items-center justify-between pointer-events-auto shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-6">
          <motion.div layout className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xs text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                D
             </div>
             {!scrolled && (
               <motion.div
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="flex flex-col"
               >
                 <span className="text-sm font-bold text-white leading-none">D-PLOG</span>
                 <span className="text-[10px] text-white/40 font-medium">Diagnostic Gear</span>
               </motion.div>
             )}
          </motion.div>

          <AnimatePresence>
            {!scrolled && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="hidden md:flex items-center gap-6 border-l border-white/10 pl-6"
              >
                {["Core", "Report", "Tech"].map((item) => (
                  <a key={item} href="#" className="text-xs font-semibold text-white/40 hover:text-white transition-colors uppercase tracking-widest">
                    {item}
                  </a>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          <motion.div 
            layout
            className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5"
          >
             <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
             </span>
             <span className="text-[10px] font-mono text-white/60 tabular-nums">
                LIVE: {diagnosisCount.toLocaleString()}
             </span>
          </motion.div>

          <Button 
            variant="default" 
            size={scrolled ? "sm" : "default"}
            className={cn(
              "rounded-full font-bold transition-all duration-500",
              scrolled ? "bg-blue-600 text-white hover:bg-blue-500 px-6" : "bg-white text-black hover:scale-105"
            )}
          >
            {scrolled ? "진단 시작" : "무료로 진단 시작"}
          </Button>
        </div>
      </motion.nav>
    </div>
  );
};
