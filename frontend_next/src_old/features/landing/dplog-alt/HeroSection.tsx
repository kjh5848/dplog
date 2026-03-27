import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import NoiseOverlay from "./NoiseOverlay";

interface HeroSectionProps {
  onStart: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityBg = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div ref={containerRef} className="landing-v2-hero h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-black text-white px-4 shadow-[0_0_100px_rgba(0,0,0,0.5)_inset]">
      <motion.div 
        style={{ y: yBg, opacity: opacityBg }}
        className="absolute top-0 left-0 w-full h-full"
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover opacity-60 scale-105"
          poster="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop"
        >
           {/* Chef cooking in kitchen / Busy restaurant atmosphere */}
           <source src="https://videos.pexels.com/video-files/3196238/3196238-uhd_2560_1440_25fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80"></div>
        <NoiseOverlay opacity={0.2} />
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="z-10 text-center max-w-4xl flex flex-col items-center"
      >
        <motion.h2
          variants={item}
          className="landing-v2-hero-eyebrow font-light tracking-[0.3em] mb-4 text-gray-300 uppercase"
          style={{ fontSize: "15px" }}
        >
          지능형 경영 플랫폼
        </motion.h2>
        <motion.h1
          variants={item}
          className="landing-v2-hero-title font-black mb-8 leading-tight tracking-tighter"
          style={{ fontSize: "clamp(50px, 12vw, 90px)" }}
        >
          <Link className="inline-block hover:text-gray-200 transition-colors" href="/landing/dplog-alt">
            D-PLOG
          </Link>
          <span className="block mb-6 text-2xl md:text-4xl font-light mt-4 tracking-normal text-gray-400">
            소상공인 생존을 위한 AI 파트너
          </span>
        </motion.h1>
        <motion.p 
          variants={item}
          className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed break-keep mb-10"
        >
          대한민국 자영업자 7곳 중 1곳이 문을 닫는 시대.<br />
          사장님의 소중한 가게가 "데스밸리"를 넘어설 수 있도록,<br />
          데이터 기반의 생존 전략을 제안합니다.
        </motion.p>

        <motion.button 
          variants={item}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart} 
          className="btn btn-primary btn-lg"
        >
          무료 진단 시작하기{" "}
          <span className="material-symbols-outlined">arrow_forward</span>
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        className="absolute bottom-10 z-10"
      >
        <ChevronDown size={32} className="text-white/50" />
      </motion.div>
    </div>
  );
};

export default HeroSection;
