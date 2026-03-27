"use client";

import React from "react";
import { motion } from "framer-motion";
import { NavbarV1 } from "@/shared/ui/navbar-v1";

export default function NavV1Page() {
  return (
    <div className="min-h-[300vh] bg-[#050505] text-white selection:bg-white/20">
      <NavbarV1 />

      {/* Hero Section of the demo page */}
      <section className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_100%)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6">
            TRANSFORMING <br /> NAVBAR
          </h1>
          <p className="text-white/40 text-lg md:text-xl max-w-xl mx-auto font-light leading-relaxed">
            스크롤을 내려보세요. 내비게이션 바가 우아한 캡슐 형태로 변형됩니다.
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
           <span className="text-[10px] uppercase tracking-[0.5em] text-white/20 animate-pulse">Scroll Down</span>
           <div className="h-20 w-[1px] bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* Content to enable scrolling */}
      <section className="container mx-auto px-6 py-40">
        <div className="grid gap-20">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[60vh] rounded-[3rem] border border-white/5 bg-white/[0.02] flex items-center justify-center text-white/10 text-9xl font-black">
              0{i}
            </div>
          ))}
        </div>
      </section>

      <footer className="py-20 text-center text-white/10 text-sm">
        <p>© 2026 D-PLOG Navigation Archive.</p>
      </footer>
    </div>
  );
}
