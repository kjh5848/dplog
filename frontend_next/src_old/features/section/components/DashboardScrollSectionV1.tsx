'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ContainerScroll } from '@/shared/ui/container-scroll-animation';

export const DashboardScrollSectionV1 = () => {
  return (
    <section className="dashboard-scroll-section bg-[#020617] text-white">
      <ContainerScroll
        titleComponent={
          <div className="flex flex-col items-center mb-10">
            <motion.p
              className="text-sm font-bold tracking-[0.2em] text-blue-400 uppercase mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              EXAMPLE COMPONENT
            </motion.p>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight text-center">
              Dashboard Scroll V1
            </h1>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto font-medium text-center">
              This is an example component moved to the features/section domain.<br />
              It demonstrates the 3D scroll animation using Aceternity UI.
            </p>
          </div>
        }
      >
        <div className="relative w-full h-full bg-slate-900 overflow-hidden rounded-2xl border border-slate-700">
          {/* Main Dashboard Demo Video - Ensure path is correct or use placeholder */}
          <video
            src="/videos/dashboard-demo.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          
          {/* Floating UI Elements */}
          <div className="absolute bottom-8 left-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-green-400">LIVE</span>
              </div>
              <p className="text-lg font-bold text-white">Example Mode</p>
            </div>
          </div>
        </div>
      </ContainerScroll>

      <style jsx>{`
        .dashboard-scroll-section {
          overflow: hidden;
          position: relative;
          width: 100%;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </section>
  );
};
