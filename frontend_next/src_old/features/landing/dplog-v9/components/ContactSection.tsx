'use client';
import React from 'react';
import { ASSETS } from '../assets';

export const ContactSection = () => {
    return (
        <section id="contact" className="relative min-h-screen flex items-center justify-center bg-neutral-900 text-white">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={ASSETS.images.contactBg} 
                    alt="Contact Background" 
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-neutral-900/80" />
            </div>

            <div className="relative z-10 text-center space-y-12 px-6">
                <h2 className="text-4xl md:text-5xl font-serif">PRIVATE LOUNGE</h2>
                
                <div className="space-y-2 text-lg md:text-xl font-light text-white/80">
                    <p>Grand InterContinental Seoul Parnas 1F</p>
                    <p>그랜드 인터컨티넨탈 서울 파르나스 1층</p>
                </div>

                <div className="w-12 h-[1px] bg-gold-500 mx-auto" />

                <div className="text-3xl md:text-4xl font-serif tracking-widest text-gold-400">
                    02.555.0000
                </div>

                <p className="text-sm text-neutral-500 max-w-lg mx-auto leading-relaxed">
                    * 100% 사전 예약제로 운영됩니다.<br/>
                    * 방문 예약은 전화 또는 홈페이지 REGISTER를 통해 가능합니다.
                </p>

                <footer className="absolute bottom-8 left-0 right-0 text-center text-[10px] text-white/30 tracking-widest uppercase">
                    &copy; 2026 SOYO HANNAM. All Rights Reserved.
                </footer>
            </div>
        </section>
    );
};
