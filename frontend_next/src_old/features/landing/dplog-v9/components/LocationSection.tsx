'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ASSETS } from '../assets';

export const LocationSection = () => {
    return (
        <section id="location" className="relative min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center py-20 px-6">
             <div className="max-w-screen-xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <span className="text-gold-400 tracking-[0.3em] font-bold text-sm uppercase">
                        The Connectivity
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                        HANNAM <br />
                        THE CENTER
                    </h2>
                    <p className="text-neutral-400 font-light leading-relaxed max-w-md">
                        한남대교와 남산1호터널을 통해 강남과 강북을 잇는<br/>
                        서울의 중심. 한남동의 독보적인 위치 가치를 누리십시오.
                    </p>
                    
                    <ul className="space-y-4 pt-4 border-t border-white/10 mt-8">
                        <li className="flex justify-between text-sm md:text-base font-light">
                            <span className="text-white/80">한강진역 (6호선)</span>
                            <span className="text-white/40">도보 5분</span>
                        </li>
                        <li className="flex justify-between text-sm md:text-base font-light">
                            <span className="text-white/80">한남대교 (강남 진입)</span>
                            <span className="text-white/40">차량 3분</span>
                        </li>
                        <li className="flex justify-between text-sm md:text-base font-light">
                            <span className="text-white/80">이태원 거리</span>
                            <span className="text-white/40">도보 10분</span>
                        </li>
                    </ul>
                </motion.div>

                {/* Map Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="relative"
                >
                    {/* Placeholder for interactive map or just the SVG image */}
                    <div className="relative aspect-square md:aspect-[4/3] bg-neutral-800 rounded-sm overflow-hidden border border-white/5">
                        <img 
                            src={ASSETS.images.map} 
                            alt="Location Map" 
                            className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-500"
                        />
                         {/* Animated Location Markers (Decoration) */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gold-500 rounded-full animate-ping opacity-75" />
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full" />
                    </div>
                </motion.div>
             </div>
        </section>
    );
};
