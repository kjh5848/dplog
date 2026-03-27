import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import HeroSection from "./HeroSection";
import TargetAudienceSection from "./TargetAudienceSection";
import EarlyStageProblemSection from "./EarlyStageProblemSection";
import OperationalProblemSection from "./OperationalProblemSection";
import SolutionSection from "./SolutionSection";
import FeatureSection from "./FeatureSection";
import ConclusionSection from "./ConclusionSection";
import Navigation from "./Navigation";

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <main ref={containerRef} className="landing-v4 relative bg-black text-white selection:bg-yellow-500/30">
      <Navigation />

      {/* 1. Hero Section - Keeps Card Effect */}
      <CardWrapper zIndex={10}>
         <HeroSection onStart={onStart} />
      </CardWrapper>

      {/* 2. Target Audience - Multi-page scroll */}
      <div className="relative z-20">
         <TargetAudienceSection />
      </div>

      {/* 3. Early Stage Problem */}
      <div className="relative z-30">
         <EarlyStageProblemSection />
      </div>

      {/* 4. Operational Problem */}
      <div className="relative z-40">
         <OperationalProblemSection />
      </div>

      {/* 5. Solution Section */}
      <div className="relative z-50">
         <SolutionSection />
      </div>

      {/* Feature Section & Beyond (Normal Scroll) */}
      <div className="relative z-60 bg-black">
        <FeatureSection />
      </div>

      <div className="relative z-70 bg-black">
        <ConclusionSection onStart={onStart} />
      </div>

      {/* Premium Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03] mix-blend-overlay noise-bg" />
    </main>
  );
};

// Premium Stacking Wrapper with Spring Physics
const CardWrapper = ({ 
    children, 
    zIndex 
}: { 
    children: React.ReactNode; 
    zIndex: number;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    
    // We detect scroll progress relative to the section's position in the document.
    // Even if sticking, the 'ref' div's flow position moves towards and past the top.
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    // Spring physics for "Liquid" feel
    const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };

    // The scale-down happens as the section moves past the top.
    // We wait until 80% of the section is scrolled before starting the shrink.
    const scaleRaw = useTransform(scrollYProgress, [0.8, 1], [1, 0.94]);
    const scale = useSpring(scaleRaw, springConfig);

    const opacityRaw = useTransform(scrollYProgress, [0.8, 1], [1, 0.4]);
    const opacity = useSpring(opacityRaw, springConfig);

    const blurRaw = useTransform(scrollYProgress, [0.8, 1], ["blur(0px)", "blur(12px)"]);
    const blur = useSpring(blurRaw, springConfig);

    return (
        <div ref={ref} className="relative w-full" style={{ zIndex }}>
            {/* The Sticky Container - Height must be 100vh to fit screen during stick */}
            <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
                <motion.div 
                    className="w-full h-full will-change-transform"
                    style={{ 
                        scale, 
                        opacity, 
                        filter: blur 
                    }}
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
};

export default LandingPage;
