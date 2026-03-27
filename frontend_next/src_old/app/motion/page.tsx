"use client";

import React, { useState, useEffect } from "react";
import { GooeyText } from "@/shared/ui/gooey-text";
import { TextEffect } from "@/shared/ui/text-effect";
import { motion } from "framer-motion";
import { cn } from "@/shared/lib/utils";

// --- TextEffect Examples ---

function TextEffectPerChar() {
  return (
    <TextEffect per='char' preset='fade' className="text-xl font-medium">
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

function TextEffectWithPreset() {
  return (
    <TextEffect per='word' as='h3' preset='slide' className="text-2xl font-bold">
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

function TextEffectWithCustomVariants() {
  const fancyVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
        },
      },
    },
    item: {
      hidden: () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return {
          opacity: 0,
          y: Math.random() * 100 - 50,
          rotate: Math.random() * 90 - 45,
          scale: 0.3,
          color: color,
        };
      },
      visible: {
        opacity: 1,
        y: 0,
        rotate: 0,
        scale: 1,
        transition: {
          type: 'spring',
          damping: 12,
          stiffness: 200,
        },
      },
    },
  };

  return (
    <TextEffect per='word' variants={fancyVariants as any} className="text-xl">
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

function TextEffectWithExit() {
  const [trigger, setTrigger] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTrigger((prev) => !prev);
    }, 2000);

    return () => clearInterval(interval);
  }, []);
  
  const blurSlideVariants = {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.01 },
      },
      exit: {
        transition: { staggerChildren: 0.01, staggerDirection: 1 },
      },
    },
    item: {
      hidden: {
        opacity: 0,
        filter: 'blur(10px) brightness(0%)',
        y: 0,
      },
      visible: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px) brightness(100%)',
        transition: {
          duration: 0.4,
        },
      },
      exit: {
        opacity: 0,
        y: -30,
        filter: 'blur(10px) brightness(0%)',
        transition: {
          duration: 0.4,
        },
      },
    },
  };

  return (
    <TextEffect
      className='inline-flex text-xl'
      per='char'
      variants={blurSlideVariants}
      trigger={trigger}
    >
      Animate your ideas with motion-primitives
    </TextEffect>
  );
}

// --- Main Page Component ---

export default function MotionWarehousePage() {
  const gooeyExamples = [
    ["Motion", "Design", "Warehouse", "Creative"],
    ["Premium", "Dynamic", "Seamless", "Fluid"],
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20">
      {/* Hero Section */}
      <section className="relative flex min-h-[60vh] flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="z-10"
        >
          <h1 className="mb-4 text-sm font-medium tracking-[0.2em] text-white/50 uppercase">
            Design Archive
          </h1>
          <div className="mb-8">
            <GooeyText
              texts={gooeyExamples[0]}
              className="h-32 md:h-48"
              textClassName="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            />
          </div>
          <p className="mx-auto max-w-lg text-lg text-white/40 leading-relaxed">
            디테일한 움직임과 유연한 인터랙션을 모아놓은 <br />
            D-PLOG만의 디자인 모션 창고입니다.
          </p>
        </motion.div>

        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-[120px]" />
          <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.02)_0%,transparent_50%)]" />
        </div>
      </section>

      {/* Components Grid */}
      <section className="container mx-auto px-6 py-24">
        {/* Gooey Section */}
        <div className="mb-24">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold tracking-tight text-white/90">
              01. Gooey Animations
            </h2>
            <div className="mt-2 h-1 w-12 bg-white/20" />
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="mb-6 text-sm font-medium text-white/50 uppercase tracking-wider">Fluid Morph</h3>
              <div className="flex h-40 items-center justify-center rounded-xl bg-black/40 backdrop-blur-sm">
                <GooeyText texts={gooeyExamples[1]} className="h-20" textClassName="text-4xl md:text-5xl text-white/90" />
              </div>
            </motion.div>
            
            <motion.div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 flex flex-col justify-center">
              <h3 className="mb-4 text-lg text-white/80">Concept</h3>
              <p className="text-white/40 leading-relaxed">
                SVG 필터의 `feColorMatrix`를 활용하여 텍스트 간의 연결 부위를 유연하게 결합하는 애니메이션입니다. 액체 같은 질감과 부드러운 전환이 특징입니다.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Text Effect Section */}
        <div className="mb-24">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold tracking-tight text-white/90">
              02. Text Reveal Effects
            </h2>
            <div className="mt-2 h-1 w-12 bg-white/20" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Fade In (Char)", component: <TextEffectPerChar /> },
              { title: "Slide Up (Word)", component: <TextEffectWithPreset /> },
              { title: "Blur & Loop", component: <TextEffectWithExit /> },
              { title: "Complex Motion", component: <TextEffectWithCustomVariants />, full: true },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                className={cn(
                  "rounded-xl border border-white/10 bg-white/[0.01] p-8",
                  item.full && "md:col-span-2 lg:col-span-3"
                )}
              >
                <h3 className="mb-8 text-xs font-semibold text-white/30 uppercase tracking-[0.2em]">{item.title}</h3>
                <div className="min-h-[60px] flex items-center">
                  {item.component}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-sm text-white/20">
        <p>© 2026 D-PLOG Motion Archive. All rights reserved.</p>
      </footer>
    </div>
  );
}
