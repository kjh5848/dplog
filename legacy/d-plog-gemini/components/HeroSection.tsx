import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface HeroSectionProps {
  onStart: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-black text-white px-4">
      {/* Abstract Background Element */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20">
         <img 
            src="https://picsum.photos/1920/1080?grayscale&blur=2" 
            alt="Background" 
            className="w-full h-full object-cover"
         />
         <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 text-center max-w-4xl flex flex-col items-center"
      >
        <h2 className="text-sm md:text-lg font-light tracking-[0.3em] mb-4 text-gray-300 uppercase">
          Intelligent Management Platform
        </h2>
        <h1 className="text-5xl md:text-8xl font-black mb-8 leading-tight tracking-tighter">
          D-PLOG
          <span className="block text-2xl md:text-4xl font-light mt-4 tracking-normal text-gray-400">
            소상공인 생존을 위한 AI 파트너
          </span>
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed break-keep mb-10">
          대한민국 자영업자 7곳 중 1곳이 문을 닫는 시대.<br/>
          사장님의 소중한 가게가 '데스밸리'를 넘어설 수 있도록,<br/>
          데이터 기반의 생존 전략을 제안합니다.
        </p>

        <button 
          onClick={onStart}
          className="bg-white text-black font-bold px-10 py-4 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transform duration-200"
        >
          무료 진단 시작하기 <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-10 z-10"
      >
        <ChevronDown size={32} className="text-white/50" />
      </motion.div>
    </div>
  );
};

export default HeroSection;