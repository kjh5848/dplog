'use client';

import React, { useState } from 'react';
import { NavbarV3 } from '@/shared/ui/navbar-v3';
import { HeroSection } from './components/HeroSection';
import { DashboardSectionV1 } from './components/DashboardSectionV1';
import { SkeletonsSection } from './components/SkeletonsSection';
import { PainPointsSectionV3 } from '@/features/landing/dplog-v11/components/PainPointsSectionV3';
import { SolutionSectionV2 } from '@/features/landing/dplog-v11/components/SolutionSectionV2';
import { FeatureGridSection } from './components/FeatureGridSection';
import { TimelineSection } from './components/TimelineSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PRDRoadmapSection } from './components/PRDRoadmapSection';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';
import { FloatingControls } from './components/FloatingControls';
import { AuroraBackground } from '@/shared/ui/aurora-background';


export default function LandingPageV10() {
  const [isHeadlineFinished, setIsHeadlineFinished] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      <main>
        <AuroraBackground className="min-h-screen" showAurora={isHeadlineFinished}>
          <NavbarV3 />
          <HeroSection onComplete={() => setIsHeadlineFinished(true)} />
        

        {/* children은 항상 표시 */}
        {isHeadlineFinished && (
          <div className="relative w-full h-full flex flex-col animate-in fade-in duration-1000">
            
            
            {/* V1: Restored Tab-based Carousel */}
            <DashboardSectionV1 />

            {/* §2 문제 정의 */}
            <PainPointsSectionV3 />          

            {/* §3 4대 목표 */}
            <SolutionSectionV2 />
            {/* <SkeletonsSection /> */}
            
            <TimelineSection />
            <TestimonialsSection />


            <FeatureGridSection />
            {/* <PRDRoadmapSection /> */}
            <PricingSection />
            <FAQSection />
            <CTASection />
          </div>
        )}
        </AuroraBackground>
      </main>
      {isHeadlineFinished && (
        <>
          <Footer />
          <FloatingControls />
        </>
      )}
    </div>
  );
}
