"use client";

import React from "react";
import { motion } from "framer-motion";
import { NavbarV4 } from "@/shared/ui/navbar-v4";

export default function NavV4Page() {
  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-blue-500/30 overflow-x-hidden">
      <NavbarV4 />

      <main className="relative pt-40 pb-20">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-20">
           <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px]" />
           <div className="absolute top-80 right-10 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[150px]" />
        </div>

        <section className="container mx-auto px-6 text-center z-10 relative">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-black tracking-[0.5em] text-blue-500 uppercase mb-6"
          >
            D-PLOG 진단 레이더
          </motion.h2>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tightest mb-8 italic"
          >
            DATA DRIVEN <br /> <span className="text-white/20">GROWTH</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg md:text-xl font-light leading-relaxed max-w-3xl mx-auto mb-16"
          >
             네이버 플레이스 노출의 모든 요소를 10분 만에 정밀 진단합니다. <br />
             사장님이 오늘 당장 실행할 수 있는 체크리스트를 데이터 근거와 함께 제공합니다.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
             {[
               { title: "실시간 노출 진단", desc: "키워드별 현재 순위를 즉시 수집합니다." },
               { title: "경쟁 매장 비교", desc: "상위 노출 매장의 패턴을 정밀 분석합니다." },
               { title: "실행 가이드 제공", desc: "가장 우선순위 높은 액션을 제안합니다." }
             ].map((item, i) => (
               <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 viewport={{ once: true }}
                 className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
               >
                  <div className="text-blue-500 font-bold mb-4 uppercase tracking-tighter">0{i+1}. {item.title}</div>
                  <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
               </motion.div>
             ))}
          </div>
        </section>

        {/* Long Content for Scroll Test */}
        <section className="container mx-auto px-6 py-40">
           <div className="space-y-40">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
                   <div className="relative h-[400px] border border-white/5 bg-[#050505] rounded-3xl flex items-center justify-center">
                      <div className="text-white/5 text-[15rem] font-black select-none">{i}</div>
                   </div>
                </div>
              ))}
           </div>
        </section>
      </main>

      <footer className="py-20 text-center border-t border-white/5 relative bg-black/50">
        <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase">Built for Smarter Business Operations</p>
      </footer>
    </div>
  );
}
