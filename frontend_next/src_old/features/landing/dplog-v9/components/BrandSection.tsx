'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ASSETS } from '../assets';

export const BrandSection = () => {
  return (
    <section id="brand" className="relative min-h-screen bg-neutral-900 text-white py-24 px-6 md:px-20 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        
        {/* Text Content */}
        <div className="order-2 md:order-1 flex flex-col gap-12">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-serif mb-6">
              <span className="block text-gold-400 mb-2 text-2xl tracking-[0.2em] font-sans">SOYO</span>
              逍 遙
            </h2>
            <p className="text-neutral-400 text-lg leading-relaxed font-light">
              슬슬 거닐어 돌아다님.<br />
              자유롭게 이리저리 거닐며 돌아다님.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-2xl font-serif text-white/90">
              Wellness & Hospitality <br />
              by PARNAS
            </h3>
            <p className="text-neutral-400 font-light leading-relaxed max-w-md">
              파르나스 호텔의 노하우가 담긴 섬세한 호스피탈리티 서비스와
              심신의 온전한 쉼을 위한 웰니스 프로그램이 제공됩니다.
              소요한남에서 경험하는 일상은 매 순간이 여행이 됩니다.
            </p>
          </motion.div>
        </div>

        {/* Video/Image Content */}
        <motion.div 
          className="order-1 md:order-2 relative h-[60vh] md:h-[80vh] w-full overflow-hidden rounded-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700"
            poster={ASSETS.images.partnersBg}
          >
            <source src={ASSETS.videos.brand} type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60" />
        </motion.div>
      </div>
    </section>
  );
};
