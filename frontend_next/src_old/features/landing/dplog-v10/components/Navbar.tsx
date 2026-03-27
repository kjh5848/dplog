import React, { useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <motion.nav 
      initial={{ 
        width: "100%", 
        borderRadius: "0px", 
        y: 0,
        backgroundColor: "rgba(255, 255, 255, 0)", // Transparent start
        borderColor: "rgba(226, 232, 240, 0)", // Transparent border
        boxShadow: "0 0 0 0 rgba(0,0,0,0)"
      }}
      animate={isScrolled ? { 
        width: "90%", 
        borderRadius: "9999px", 
        y: 16,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderColor: "rgba(226, 232, 240, 1)",
        backdropFilter: "blur(12px)",
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
        top: 0,
        left: 0,
        right: 0,
        marginLeft: "auto",
        marginRight: "auto"
      } : { 
        width: "100%", 
        borderRadius: "0px", 
        y: 0,
        backgroundColor: "rgba(255, 255, 255, 0)",
        borderColor: "rgba(226, 232, 240, 0)",
        backdropFilter: "blur(0px)",
        boxShadow: "0 0 0 0 rgba(0,0,0,0)"
      }}
      transition={{ 
        duration: 0.4,
        ease: [0.23, 1, 0.32, 1]
      }}
      className="fixed z-50 border-b transition-colors"
      style={{ maxWidth: isScrolled ? "80rem" : "100%" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <div className="text-2xl font-extrabold text-primary flex items-center gap-2 cursor-pointer">
              <span className="material-icons-round text-3xl">hub</span>
              D-PLOG
            </div>
            <div className="hidden md:flex gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
              <a href="#" className="hover:text-primary transition-colors">서비스 소개</a>
              <a href="#" className="hover:text-primary transition-colors">기능</a>
              <a href="#" className="hover:text-primary transition-colors">요금안내</a>
              <a href="#" className="hover:text-primary transition-colors">리소스</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors">로그인</button>
            <button className="bg-primary hover:bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 active:scale-95">무료로 시작하기</button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};
