"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TextEffect } from "@/shared/ui/text-effect";
import { cn } from "@/shared/lib/utils";

const IMAGES = [
  "https://images.unsplash.com/photo-1761839257946-4616bcfafec7?q=80&w=1169&auto=format&fit=crop",
  "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&w=1189&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1170&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1652195960911-c9f55224bd89?q=80&w=687&auto=format&fit=crop",
];

export default function HeroV3Page() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden font-sans">
      {/* Cinematic Background Slider */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <img
              src={IMAGES[currentIndex]}
              alt="Background"
              className="h-full w-full object-cover grayscale-[30%] brightness-[40%]"
            />
          </motion.div>
        </AnimatePresence>
        {/* Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-10 py-12 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto"
        >
          <div className="text-xl font-medium tracking-[0.2em] text-white/90">D-PLOG</div>
        </motion.div>
        <div className="hidden md:flex gap-10 items-center pointer-events-auto text-[11px] uppercase tracking-[0.3em] text-white/40">
           {["Solutions", "Studio", "Archive", "Contact"].map((item) => (
             <a key={item} href="#" className="hover:text-white transition-colors">{item}</a>
           ))}
        </div>
      </nav>

      {/* Center Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <div className="mb-8 overflow-hidden">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.5,
                  },
                },
              }}
              className="flex justify-center text-white/90 text-7xl md:text-9xl font-light tracking-[-0.05em]"
            >
              {"D-PLOG".split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.8 },
                    visible: { 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: {
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                      }
                    },
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          </div>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mb-8 text-2xl md:text-5xl font-extralight tracking-[0.15em] text-white leading-tight"
          >
            일상의 한계를 넘어서는 <br /> 
            <span className="font-light">압도적인 디지털 경험</span>
          </motion.h2>

          <TextEffect 
            per="word" 
            preset="fade" 
            className="mb-12 text-sm md:text-lg font-light text-white/40 tracking-[0.2em] uppercase"
          >
            Extraordinary Everyday life through Deep Tech
          </TextEffect>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col md:flex-row gap-6 mt-4"
          >
            <button className="rounded-none border border-white/20 bg-white/5 px-12 py-5 text-xs font-bold uppercase tracking-[0.4em] text-white backdrop-blur-md hover:bg-white hover:text-black transition-all duration-500">
               지금 시작하기
            </button>
            <button className="rounded-none border border-white/10 px-12 py-5 text-xs font-bold uppercase tracking-[0.4em] text-white/60 hover:text-white transition-all duration-500">
               자세히 보기
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-4">
         <span className="text-[10px] uppercase tracking-[0.5em] text-white/20">Scroll</span>
         <div className="h-12 w-[1px] bg-gradient-to-b from-white/20 to-transparent" />
      </div>

      {/* Slider Progress Indicator */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-6">
        {IMAGES.map((_, idx) => (
          <div 
            key={idx} 
            className={cn(
              "h-1.5 w-1.5 rounded-full transition-all duration-700",
              currentIndex === idx ? "bg-white scale-125" : "bg-white/20"
            )}
          />
        ))}
      </div>
    </div>
  );
}
