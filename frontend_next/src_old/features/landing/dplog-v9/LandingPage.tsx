'use client';

import React from 'react';
import { HeroSection } from './components/HeroSection';
import { BrandSection } from './components/BrandSection';
import { SolutionSection } from './components/SolutionSection';
import { ShowcaseSection } from './components/ShowcaseSection';
import { FeatureSection } from './components/FeatureSection';
import { HannamSection } from './components/HannamSection';
import { LocationSection } from './components/LocationSection';
import { PartnersSection } from './components/PartnersSection';
import { ContactSection } from './components/ContactSection';
import { Header } from './components/Header';
import { RegisterModal } from './components/RegisterModal';

export default function LandingPageV9() {
  const [isRegisterOpen, setIsRegisterOpen] = React.useState(false);

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-gold-500 selection:text-black">
      <Header onOpenRegister={() => setIsRegisterOpen(true)} />
      <main>
        <HeroSection />
        <BrandSection />
        <SolutionSection />
        <ShowcaseSection />
        <FeatureSection />
        <HannamSection />
        <LocationSection />
        <PartnersSection />
        <ContactSection />
      </main>
      <RegisterModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </div>
  );
}
