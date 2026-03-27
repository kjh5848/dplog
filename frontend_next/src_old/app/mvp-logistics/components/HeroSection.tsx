"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen overflow-hidden bg-[#1F1F61] text-white flex items-center justify-center">
      {/* Background Image Placeholder - In production, this would be a slider */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2670&q=80')" }} 
      />
      
      <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center h-full">
        {/* Left Content */}
        <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-6"
        >
            <div className="w-20 h-1 bg-white/20 mb-4"></div>
            <h1 className="font-bebas text-6xl md:text-8xl leading-[0.9] tracking-tight">
                WE DELIVER <br />
                <span className="text-white/80">MORE THAN CARGO</span>
            </h1>
            <p className="font-roboto text-lg md:text-xl text-white/80 max-w-lg leading-relaxed">
                WE DELIVER PEACE OF MIND. RELIABLE LOGISTICS SOLUTIONS TAILORED TO YOUR BUSINESS NEEDS.
            </p>
            
            <button className="group mt-8 flex items-center gap-4 text-lg font-bebas tracking-wide hover:gap-6 transition-all">
                <span className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center group-hover:bg-white group-hover:text-[#1F1F61] transition-colors">
                    <ArrowRight size={20} />
                </span>
                <span>LEARN MORE ABOUT US</span>
            </button>
        </motion.div>

        {/* Right Content - Counter/Slider Interface */}
        <div className="hidden md:flex flex-col items-end justify-center h-full pb-20">
            <div className="flex flex-col items-end mb-12">
                 <span className="font-bebas text-6xl text-white/20">01</span>
                 <div className="w-1 h-20 bg-white/20 mt-4"></div>
            </div>
        </div>
      </div>

       {/* Bottom Scroll Indicator */}
       <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 1, duration: 1 }}
         className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
       >
         <span className="text-xs tracking-[0.2em] font-roboto font-light">SCROLL DOWN</span>
         <div className="w-[1px] h-12 bg-white/30"></div>
       </motion.div>
    </section>
  );
}
