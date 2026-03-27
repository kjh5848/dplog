'use client';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ASSETS } from '../assets';

export const HannamSection = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <section id="hannam" ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Parallax Background */}
            <motion.div 
                style={{ y }}
                className="absolute inset-0 z-0"
            >
                <img 
                    src={ASSETS.images.hannamBg} 
                    alt="Hannam View" 
                    className="w-full h-[120%] object-cover object-center filter brightness-[0.7]"
                />
            </motion.div>

            {/* Content Overlay */}
            <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="block text-gold-400 tracking-[0.3em] text-sm md:text-base mb-6 font-bold uppercase">
                        Location Value
                    </span>
                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-8 leading-tight">
                        The Center of <br/> Inspiration
                    </h2>
                    <p className="text-white/80 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
                        한남동, 그 중심에서 만나는 새로운 차원의 프레스티지.<br/>
                        남산의 정기와 한강의 흐름이 만나는 배산임수의 명당에서<br/>
                        진정한 하이엔드 라이프스타일이 시작됩니다.
                    </p>
                </motion.div>
            </div>
            
            {/* Decorative Borders */}
            <div className="absolute top-10 left-10 right-10 bottom-10 border border-white/10 pointer-events-none z-20" />
        </section>
    );
};
