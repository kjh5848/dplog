"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { AlertTriangle, TrendingDown, XCircle } from "lucide-react";
import NoiseOverlay from "./NoiseOverlay";

export default function ProblemSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress -> Parallax & Opacity
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section ref={containerRef} className="relative w-full h-screen flex items-center justify-center bg-[#1a0505] text-white overflow-hidden">
      {/* Noise Overlay */}
      <NoiseOverlay opacity={0.3} />
      
      {/* Dynamic Red Background Effect */}
      <motion.div style={{ y: yBg }} className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(139,0,0,0.5),_transparent_70%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-30"></div>
      </motion.div>

      <div className="z-10 container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left: Text Content with Glitch Effect */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: false }}
          >
            <div className="flex items-center gap-2 text-red-500 mb-4 font-mono">
              <AlertTriangle className="w-6 h-6 animate-bounce" />
              <span className="tracking-widest uppercase font-bold text-sm">Crisis Detected</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-2">
              <span className="block text-gray-500 line-through decoration-red-600 decoration-4">매출 하락</span>
              <span className="text-white relative inline-block">
                 폐업 위기
                <motion.span 
                  className="absolute inset-0 text-red-600 opacity-70 mix-blend-screen"
                  animate={{ x: [0, -2, 2, -1, 0], y: [0, 1, -1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.2, repeatDelay: 3 }}
                >
                  폐업 위기
                </motion.span>
                <div className="w-full h-2 bg-red-600 absolute bottom-1 left-0 -z-10 skew-x-12"></div>
              </span>
            </h2>
            
            <p className="text-lg text-gray-400 mt-6 leading-relaxed">
              &quot;열심히 하는데 왜 안 될까?&quot; <br />
              감에 의존한 경영은 이제 통하지 않습니다. <br />
              <strong className="text-white">데이터가 없는 사장님은 눈을 가리고 운전하는 것과 같습니다.</strong>
            </p>
          </motion.div>
        </div>

        {/* Right: Visual Stats / Danger Graph */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 rounded-full blur-[100px] opacity-20 animate-pulse"></div>
            
            <div className="relative bg-white/5 border border-red-900/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-red-400">월간 매출 추이</h3>
                    <TrendingDown className="text-red-500 w-6 h-6" />
                </div>
                
                {/* Simulated Graph */}
                <div className="flex items-end h-40 gap-4 mb-4 relative overflow-hidden">
                     {/* Bars */}
                    {[80, 70, 60, 45, 30].map((height, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            whileInView={{ height: `${height}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className={`flex-1 rounded-t-sm ${i === 4 ? 'bg-red-600 animate-pulse' : 'bg-gray-700'}`}
                        ></motion.div>
                    ))}
                    {/* Falling Line */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                        <motion.path
                            d="M0,20 Q100,50 300,150"
                            fill="none"
                            stroke="red"
                            strokeWidth="4"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                        />
                    </svg>
                </div>

                <div className="flex items-center gap-3 p-4 bg-red-950/50 rounded-lg border border-red-900/30">
                    <XCircle className="text-red-500 w-8 h-8" />
                    <div>
                        <div className="text-red-200 font-bold">원인 불명</div>
                        <div className="text-red-400 text-xs">데이터 분석 불가</div>
                    </div>
                </div>
            </div>
        </motion.div>
      </div>
    </section>
  );
}
