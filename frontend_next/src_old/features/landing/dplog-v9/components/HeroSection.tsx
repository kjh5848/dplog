'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ASSETS } from '../assets';

export const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
          poster={ASSETS.images.hannamBg} // Fallback
        >
          <source src={ASSETS.videos.hero} type="video/mp4" />
        </video>
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        <div className="flex flex-col items-center gap-6">
          <motion.img 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            src={ASSETS.images.logoWhite} 
            alt="Soyo Hannam Logo" 
            className="w-48 md:w-64 mb-8 opacity-90"
          />
          
          <div className="overflow-hidden">
            <motion.h1 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.5 }}
              className="text-3xl md:text-5xl lg:text-6xl font-serif text-white/90 tracking-wide font-light leading-tight"
            >
              <span className="block mb-2">일상을 벗어난 일상</span>
            </motion.h1>
          </div>

          <div className="overflow-hidden">
            <motion.p
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              transition={{ duration: 1, ease: [0.33, 1, 0.68, 1], delay: 0.7 }}
              className="block text-lg md:text-xl font-sans font-light opacity-80 mt-4 tracking-[0.2em]"
            >
              EXTRAORDINARY EVERYDAY LIFE
            </motion.p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] tracking-widest uppercase opacity-60">Scroll</span>
          <div className="w-[1px] h-12 bg-white/30 overflow-hidden relative">
            <motion.div 
              className="absolute top-0 w-full h-1/2 bg-white"
              animate={{ y: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
};
