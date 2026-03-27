"use client";

import React from "react";
import { motion } from "framer-motion";
import { BentoGrid, default as BentoItem } from "@/shared/ui/bento-grid";
import { GooeyText } from "@/shared/ui/gooey-text";
import { cn } from "@/shared/lib/utils";

const CARDS = [
  {
    title: "AI Strategy",
    description: "Deep Tech 분석을 통한 서비스 고도화",
    className: "md:col-span-2 md:row-span-1",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4628c71d0?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Data Insights",
    description: "실시간 로그 분석 및 시각화 시스템",
    className: "md:col-span-2 md:row-span-1",
    image: "https://images.unsplash.com/photo-1551288049-bbbda540d3b9?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "UX Design",
    description: "감각적인 사용자 인터페이스 설계",
    className: "md:col-span-1 md:row-span-1",
    image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Global Scalability",
    description: "전 세계 어디서든 빠른 인프라",
    className: "md:col-span-1 md:row-span-2",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Security First",
    description: "철저한 보안 프로토콜 및 암호화",
    className: "md:col-span-2 md:row-span-1",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
  },
  // Hero Section will be inserted between CARD 5 and CARD 6 in the grid
  {
    title: "Workflow",
    description: "효율적인 협업을 위한 워크플로우",
    className: "md:col-span-1 md:row-span-1",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
  },
  {
    title: "Performance",
    description: "최첨단 성능 최적화 기술 적용",
    className: "md:col-span-3 md:row-span-1",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Integrations",
    description: "다양한 서드파티 서비스와의 연결",
    className: "md:col-span-2 md:row-span-1",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc48?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Growth",
    description: "지속 가능한 성장을 위한 분석 도구",
    className: "md:col-span-1 md:row-span-1",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80",
  },
];

export default function HeroSectionPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20 overflow-x-hidden p-4 md:p-8">
      {/* Container to center the entire grid */}
      <div className="mx-auto max-w-[1400px] pt-12 md:pt-20">
        
        <BentoGrid className="auto-rows-[180px] md:auto-rows-[220px]">
          {/* Row 1 */}
          <BentoItem {...CARDS[0]} index={0} />
          <BentoItem {...CARDS[1]} index={1} />
          <BentoItem {...CARDS[2]} index={2} />
          <BentoItem {...CARDS[3]} index={3} />

          {/* Row 2 */}
          <BentoItem {...CARDS[4]} index={4} />
          
          {/* Central Hero Gap (col-span-2) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center text-center px-4">
             <motion.div
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8, ease: "easeOut" }}
             >
                <div className="mb-2 text-2xl md:text-3xl font-black tracking-tightest">D-PLOG</div>
                <div className="flex gap-2 mt-4">
                   <button className="rounded-full bg-white px-4 py-2 text-[10px] md:text-xs font-bold text-black hover:scale-105 transition-transform">
                     무료 14일 체험
                   </button>
                   <button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] md:text-xs font-bold text-white/80 hover:bg-white/10 transition-colors">
                     알아보기
                   </button>
                </div>
             </motion.div>
          </div>

          <BentoItem {...CARDS[5]} index={5} />
          {/* Card 4 (3번 인덱스) spans row 1 & 2 at col 6 */}

          {/* Row 3 */}
          <BentoItem {...CARDS[6]} index={6} />
          <BentoItem {...CARDS[7]} index={7} />
          <BentoItem {...CARDS[8]} index={8} />
        </BentoGrid>

        {/* Support Text Below Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-12 text-center"
        >
          <p className="text-white/20 text-sm tracking-widest uppercase">
            Designed for Deep Tech Innovation
          </p>
        </motion.div>
      </div>

      {/* Decorative Grid Background */}
      <div className="fixed inset-0 -z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="fixed inset-0 -z-20 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_100%)] pointer-events-none" />
    </div>
  );
}
