'use client';

import React, { useState } from 'react';
import { NavbarV3 } from '@/shared/ui/navbar-v3';
import { HeroSection } from './components/HeroSection';
import { PainPointsSection } from './components/PainPointsSection';
import { SolutionSection } from './components/SolutionSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ProductShowcaseSection } from './components/ProductShowcaseSection';
import { SocialProofSection } from './components/SocialProofSection';
import { PersonaSection } from './components/PersonaSection';
import { PricingSection } from '@/features/landing/dplog-v10/components/PricingSection';
import { FAQSection } from '@/features/landing/dplog-v10/components/FAQSection';
import { CTASection } from '@/features/landing/dplog-v10/components/CTASection';
import { Footer } from '@/features/landing/dplog-v10/components/Footer';
import { FloatingControls } from '@/features/landing/dplog-v10/components/FloatingControls';
import { AuroraBackground } from '@/shared/ui/aurora-background';

export default function LandingPageV11() {
  const [isReady, setIsReady] = useState(false);

  return (
    <div className="bg-[#FAFAF9] dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">
      <main>
        <AuroraBackground className="min-h-screen" showAurora={isReady}>
        <NavbarV3 />
        <HeroSection onComplete={() => setIsReady(true)} />

        {isReady && (
          <div className="relative w-full animate-in fade-in duration-1000">
            {/* §2 문제 정의 */}
            <PainPointsSection />

            {/* §3 4대 목표 */}
            <SolutionSection />

            {/* §6 사용자 여정 */}
            <HowItWorksSection />

            {/* §7 제품 데모 */}
            <ProductShowcaseSection />

            {/* 신뢰 구축 */}
            <SocialProofSection />

            {/* §5 페르소나 */}
            <PersonaSection />

            {/* 요금제 */}
            <PricingSection />

            {/* FAQ */}
            <FAQSection />

            {/* 최종 전환 */}
            <CTASection />
          </div>
        )}
        </AuroraBackground>
      </main>
      {isReady && (
        <>
          <Footer />
          <FloatingControls />
        </>
      )}
    </div>
  );
}
