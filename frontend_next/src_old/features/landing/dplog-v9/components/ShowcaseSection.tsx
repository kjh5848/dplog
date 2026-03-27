'use client';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

export const ShowcaseSection = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const scale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const xPct = (clientX - left) / width - 0.5;
        const yPct = (clientY - top) / height - 0.5;
        
        x.set(xPct * 20); // Rotate Y axis based on X position
        y.set(yPct * -20); // Rotate X axis based on Y position
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <section ref={containerRef} className="py-32 bg-black text-white px-6 md:px-20 overflow-hidden perspective-1000">
             <div className="text-center mb-20">
                <span className="text-gold-400 tracking-[0.2em] font-bold text-sm uppercase">Platform</span>
                <h2 className="text-4xl md:text-5xl font-serif mt-4">Powerful Dashboard</h2>
                <p className="text-white/60 mt-4 max-w-xl mx-auto">
                    복잡한 데이터를 한눈에 파악하고, 직관적인 인사이트를 얻으세요.
                </p>
            </div>

            <motion.div 
                style={{ scale, opacity, perspective: 1000 }}
                className="max-w-screen-xl mx-auto"
            >
                <motion.div
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ 
                        rotateX: mouseY, 
                        rotateY: mouseX,
                        transformStyle: "preserve-3d" // Essential for 3D effect
                    }}
                    className="relative aspect-video bg-neutral-900 rounded-xl border border-white/10 shadow-2xl overflow-hidden group"
                >
                    {/* Placeholder Dashboard UI */}
                    <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-950 p-8 flex flex-col">
                        {/* Header */}
                        <div className="h-12 border-b border-white/10 flex items-center justify-between px-4 mb-8">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                            </div>
                            <div className="w-32 h-2 bg-white/10 rounded-full" />
                        </div>
                        {/* Body */}
                        <div className="flex-1 grid grid-cols-12 gap-6">
                            <div className="col-span-3 bg-white/5 rounded-lg border border-white/5" />
                            <div className="col-span-9 bg-white/5 rounded-lg border border-white/5 grid grid-rows-2 gap-6 p-6">
                                <div className="row-span-1 grid grid-cols-3 gap-6">
                                     <div className="bg-white/5 rounded border border-white/5 hover:bg-gold-500/20 transition-colors" />
                                     <div className="bg-white/5 rounded border border-white/5 hover:bg-gold-500/20 transition-colors" />
                                     <div className="bg-white/5 rounded border border-white/5 hover:bg-gold-500/20 transition-colors" />
                                </div>
                                <div className="row-span-1 bg-white/5 rounded border border-white/5" />
                            </div>
                        </div>
                    </div>

                    {/* Reflection / Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
            </motion.div>
        </section>
    );
};
