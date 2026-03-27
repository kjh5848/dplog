'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
/* Shared UI */
import { NavbarV3 } from '@/shared/ui/navbar-v3';
import { AuroraBackground } from '@/shared/ui/aurora-background';

/* v13 Local Components */
import { HeroSectionV13 } from './components/HeroSectionV13';
import { Footer } from './components/Footer';
import { AgentFirstV13 } from './components/AgentFirstV13';

/* v12 Components */
import { FeatureExplorer } from '@/features/landing/dplog-v12/components/Features';
import { UseCases, DownloadSection } from '@/features/landing/dplog-v12/components/Resources';

/* v10 Components */
import { DashboardSectionV1 } from '@/features/landing/dplog-v10/components/DashboardSectionV1';
import { PainPointsSectionV3 } from '@/features/landing/dplog-v11/components/PainPointsSectionV3';
import { SolutionSectionV2 } from '@/features/landing/dplog-v11/components/SolutionSectionV2';
import { TestimonialsSection } from '@/features/landing/dplog-v10/components/TestimonialsSection';
import { PricingSection } from '@/features/landing/dplog-v10/components/PricingSection';
import { FAQSection } from '@/features/landing/dplog-v10/components/FAQSection';

/* Scroll Reveal Animation Variants */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const } 
  },
};

const fadeUpSlow = {
  hidden: { opacity: 0, y: 60 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.9, ease: [0.25, 0.4, 0.25, 1] as const } 
  },
};

const scaleUp = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const } 
  },
};

export default function LandingPageV13() {
  const [isHeadlineFinished, setIsHeadlineFinished] = useState(false);
  const [currentPage, setCurrentPage] = useState<'home' | 'buffer'>('home');

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 transition-colors duration-300">
      <AuroraBackground className="min-h-screen" showAurora={isHeadlineFinished}>
        <NavbarV3 />
        
        <main>
          {currentPage === 'home' ? (
            <>
              {/* 1. Hero (Full Screen with Peeking Effect Area) */}
              <HeroSectionV13 onComplete={() => setIsHeadlineFinished(true)} />
              
              {/* 2. Content Sections - Shown after hero animation */}
              {isHeadlineFinished && (
                <div className="relative w-full h-full flex flex-col animate-in fade-in duration-1000">
                  {/* Dashboard - Parallax Peeking Effect */}
                  <motion.div 
                    className="-mt-32 md:-mt-48 relative z-20 pointer-events-auto"
                    variants={scaleUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <DashboardSectionV1 />
                  </motion.div>

                  {/* Problem definition */}
                  <motion.div 
                    className="bg-[#050505]/90 backdrop-blur-sm rounded-3xl overflow-hidden mx-4 md:mx-8"
                    variants={fadeUpSlow}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <PainPointsSectionV3 />
                  </motion.div>

                  {/* Solution */}
                  <motion.div 
                    className="bg-white"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <SolutionSectionV2 />
                  </motion.div>
                  
                  {/* Agent First (VelocityScroll Icons) */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <AgentFirstV13 />
                  </motion.div>
                  
                  {/* Internal Features */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <FeatureExplorer />
                  </motion.div>
                  
                  {/* Social Proof */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <TestimonialsSection />
                  </motion.div>
                  
                  {/* Use Cases */}
                  <motion.div
                    className="relative z-10 bg-white"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <UseCases />
                  </motion.div>
                  
                  {/* Pricing */}
                  <motion.div
                    variants={scaleUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <PricingSection />
                  </motion.div>

                  {/* FAQ */}
                  <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <FAQSection />
                  </motion.div>
                  
                  {/* Final CTA */}
                  <motion.div
                    variants={fadeUpSlow}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <DownloadSection />
                  </motion.div>
                </div>
              )}
            </>
          ) : (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Buffer Dashboard</h2>
                <p className="text-gray-500">대시보드 기능이 준비 중입니다.</p>
                <button 
                  onClick={() => setCurrentPage('home')}
                  className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors"
                >
                  홈으로 돌아가기
                </button>
              </div>
            </div>
          )}
        </main>
      </AuroraBackground>
      
      {(currentPage === 'home' && isHeadlineFinished) && <Footer />}
    </div>
  );
}
