'use client';
import React from 'react';
import { motion } from 'framer-motion';

const partners = [
    { role: 'STARTUP', name: 'Toss', desc: '금융의 모든 것' },
    { role: 'E-COMMERCE', name: 'Danggeun', desc: '당신의 근처' },
    { role: 'ENTERPRISE', name: 'Samsung', desc: '미래를 선도하는' },
    { role: 'FINTECH', name: 'Kakao Bank', desc: '같지만 다른 은행' },
    { role: 'MOBILITY', name: 'Socar', desc: '차가 필요할 때' },
    { role: 'AI', name: 'Naver HyperCLOVA', desc: '초거대 AI' },
];

export const PartnersSection = () => {
    return (
        <section className="relative bg-black text-white py-24 overflow-hidden">
             <div className="text-center mb-16 relative z-10">
                <span className="text-gold-400 tracking-[0.2em] font-bold text-sm uppercase">Trust</span>
                <h2 className="text-3xl md:text-4xl font-serif mt-2">Trusted by Industry Leaders</h2>
            </div>
            
            {/* Background Overlay */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                 <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-10" />
                 <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-10" />
            </div>

            <div className="flex">
                <motion.div 
                    className="flex gap-12 px-6"
                    animate={{ x: "-50%" }}
                    transition={{ 
                        repeat: Infinity, 
                        duration: 30, 
                        ease: "linear" 
                    }}
                    style={{ width: "max-content" }}
                >
                    {[...partners, ...partners, ...partners].map((partner, index) => (
                        <div key={index} className="flex-shrink-0 w-64 md:w-80 border border-white/10 rounded-xl p-8 bg-neutral-900/50 backdrop-blur-sm grayscale hover:grayscale-0 transition-all duration-500 hover:border-gold-500/50 group">
                            <span className="block text-xs tracking-widest text-neutral-500 mb-4 group-hover:text-gold-400">
                                {partner.role}
                            </span>
                            <h3 className="text-2xl font-serif mb-2">{partner.name}</h3>
                            <p className="text-white/40 text-sm group-hover:text-white/80 transition-colors">{partner.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};
