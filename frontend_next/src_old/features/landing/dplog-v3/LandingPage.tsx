import React from "react";
import HeroSection from "./HeroSection";
import ProblemSection from "./ProblemSection";
import SolutionSection from "./SolutionSection";
import FeatureSection from "./FeatureSection";
import ConclusionSection from "./ConclusionSection";
import Navigation from "./Navigation";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <main className="landing-v2 relative bg-black text-white">
      <Navigation />

      {/* 
        Sticky Stacking Strategy:
        Each section acts as a sticky card that stacks on top of the previous one.
        We use varying z-indexes to ensure proper layering order if needed, 
        but default HTML order with sticky works well for sequential stacking.
      */}

      <section className="sticky top-0 h-screen w-full z-10">
        <HeroSection onStart={onStart} />
      </section>

      <section className="sticky top-0 h-screen w-full z-20">
        <ProblemSection />
      </section>

      <section className="relative z-30">
        <SolutionSection />
      </section>

      {/* Feature Section is longer than 100vh, so we let it flow naturally or handle it differently.
          For stacking effect, usually works best with 100vh sections. 
          If FeatureSection is long, we might want it to scroll normally *over* the previous ones,
          or be a container that is sticky itself until scrolled through.
          
          For this specific "card stack" request, let's keep it sticky but allow internal scroll if needed,
          or simpler: Let it just cover the previous one.
      */}
      <section className="relative z-40 bg-black"> 
        {/* Changed from sticky to relative to allow full content scrolling for long section */}
        <FeatureSection />
      </section>

      <section className="sticky top-0 h-screen w-full z-50">
        <ConclusionSection onStart={onStart} />
      </section>
    </main>
  );
};

export default LandingPage;
