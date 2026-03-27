import React from "react";
import Navigation from "./Navigation";
import HeroSection from "./HeroSection";
import EmpathySection from "./EmpathySection";
import SolutionSection from "./SolutionSection";
import Footer from "./Footer";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <main className="landing-v8 min-h-screen bg-brand-inuri-beige font-body">
      <Navigation />
      
      <HeroSection onStart={onStart} />

      <EmpathySection />
      
      <SolutionSection />

      <Footer />
    </main>
  );
};

export default LandingPage;
