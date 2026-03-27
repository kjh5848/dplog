import React from 'react';
import { motion } from 'framer-motion';

export const CTASection = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-7xl mx-auto bg-gradient-to-br from-primary to-blue-700 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        <h2 className="text-4xl md:text-5xl font-black mb-8 relative z-10 leading-tight tracking-tight">
          내 가게의 잠재력,<br />
          D-PLOG와 함께 깨워보세요.
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-primary px-10 py-5 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-xl"
          >
            <span className="material-icons-round">play_arrow</span>
            무료로 진단 시작하기
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white/20 backdrop-blur-md border border-white/30 text-white px-10 py-5 rounded-full font-bold hover:bg-white/30 transition-all"
          >
            서비스 소개서 다운로드
          </motion.button>
        </div>
      </div>
    </section>
  );
};
