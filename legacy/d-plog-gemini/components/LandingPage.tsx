import React from 'react';
import HeroSection from './HeroSection';
import ProblemSection from './ProblemSection';
import SolutionSection from './SolutionSection';
import FeatureSection from './FeatureSection';
import ConclusionSection from './ConclusionSection';
import Navigation from './Navigation';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <main className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar bg-black text-white">
      <Navigation />
      
      <section id="hero" className="h-screen w-full snap-start [scroll-snap-stop:always]">
        <HeroSection onStart={onStart} />
      </section>

      <section id="problem" className="h-screen w-full snap-start [scroll-snap-stop:always]">
        <ProblemSection />
      </section>

      <section id="solution" className="h-screen w-full snap-start [scroll-snap-stop:always]">
        <SolutionSection />
      </section>

      <section id="features" className="h-screen w-full snap-start [scroll-snap-stop:always]">
        <FeatureSection />
      </section>

      <section id="conclusion" className="h-screen w-full snap-start [scroll-snap-stop:always]">
        <ConclusionSection onStart={onStart} />
      </section>
    </main>
  );
};

export default LandingPage;