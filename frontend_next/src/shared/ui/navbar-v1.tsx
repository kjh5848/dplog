"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/shared/lib/utils";

export const NavbarV1 = () => {
  const { scrollY } = useScroll();
  
  // 스크롤에 따른 변형 값 정의
  const width = useTransform(scrollY, [0, 100], ["100%", "90%"]);
  const maxWidth = useTransform(scrollY, [0, 100], ["100%", "1200px"]);
  const borderRadius = useTransform(scrollY, [0, 100], ["0px", "40px"]);
  const top = useTransform(scrollY, [0, 100], ["0px", "24px"]);
  const paddingX = useTransform(scrollY, [0, 100], ["40px", "24px"]);
  const backgroundOpacity = useTransform(scrollY, [0, 100], [0, 0.8]);
  const blur = useTransform(scrollY, [0, 100], ["0px", "12px"]);
  const borderOpacity = useTransform(scrollY, [0, 100], [0, 1]);

  const smoothWidth = useSpring(width, { stiffness: 300, damping: 30 });
  const smoothMaxW = useSpring(maxWidth, { stiffness: 300, damping: 30 });
  const smoothRadius = useSpring(borderRadius, { stiffness: 300, damping: 30 });
  const smoothTop = useSpring(top, { stiffness: 300, damping: 30 });

  return (
    <motion.nav
      style={{
        width: smoothWidth,
        maxWidth: smoothMaxW,
        borderRadius: smoothRadius,
        top: smoothTop,
        paddingLeft: paddingX,
        paddingRight: paddingX,
        backgroundColor: `rgba(10, 10, 10, ${backgroundOpacity.get()})`,
        backdropFilter: `blur(${blur.get()})`,
        borderColor: `rgba(255, 255, 255, ${borderOpacity.get() * 0.1})`,
      }}
      className="fixed left-1/2 -translate-x-1/2 z-[100] h-20 flex items-center justify-between border-b transition-colors duration-300"
    >
      <div className="flex items-center gap-8">
        <div className="text-xl font-bold tracking-tighter text-white">D-PLOG</div>
        <div className="hidden md:flex gap-6">
          {["Work", "Studio", "About"].map((item) => (
            <a key={item} href="#" className="text-sm font-medium text-white/50 hover:text-white transition-colors">
              {item}
            </a>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-sm font-medium text-white/50 hover:text-white transition-colors">
          Login
        </button>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black"
        >
          Get Started
        </motion.button>
      </div>
    </motion.nav>
  );
};
