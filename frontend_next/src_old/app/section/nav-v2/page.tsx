"use client";

import React from "react";
import { motion } from "framer-motion";
import { NavbarV2 } from "@/shared/ui/navbar-v2";

export default function NavV2Page() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500/30 font-sans">
      <NavbarV2 />

      <main className="container mx-auto px-6 pt-40 flex flex-col items-center">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-sm font-bold tracking-[0.4em] text-white/20 uppercase mb-12"
        >
          네브바
        </motion.h2>

        <section className="max-w-4xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tightest mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">
              EXPAND ON <br /> INTERACT
            </h1>
            <p className="text-white/40 text-lg md:text-xl font-light leading-relaxed mb-20 max-w-2xl mx-auto">
              상단의 작은 원형 아이콘에 마우스를 올려보세요. <br />
              감춰져 있던 메뉴들이 매끄럽게 확장되며 당신을 맞이합니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-40">
            <div className="aspect-square rounded-[3rem] bg-white/[0.02] border border-white/5 flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="text-white/10 text-4xl font-bold tracking-widest">MINIMAL</div>
            </div>
            <div className="aspect-square rounded-[3rem] bg-white/[0.02] border border-white/5 flex items-center justify-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
               <div className="text-white/10 text-4xl font-bold tracking-widest">DYNAMICAL</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 text-center text-white/5 text-xs tracking-widest uppercase">
        Designed for Interactive Experience
      </footer>
    </div>
  );
}
