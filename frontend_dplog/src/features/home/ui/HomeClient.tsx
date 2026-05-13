'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

/* Components */
/* Components */
import { HeroSection } from './components/HeroSection';
import { DashboardSection } from './components/DashboardSection';
import { FeatureWalkthroughSection } from './components/FeatureWalkthroughSection';
import { MvpSections } from './components/MvpSections';

/*
 * 기존 하단 랜딩 섹션은 현재 제공 범위 메시지로 교체하기 위해 남겨두고 비활성화합니다.
 * import { AgentFirst } from './components/AgentFirst';
 * import { PainPointsSection } from './components/PainPointsSection';
 * import { SolutionSection } from './components/SolutionSection';
 * import { FeatureExplorer } from './components/FeatureExplorer';
 * import { TestimonialsSection } from './components/TestimonialsSection';
 * import { UseCases, DownloadSection } from './components/Resources';
 * import { PricingSection } from './components/PricingSection';
 * import { FAQSection } from './components/FAQSection';
 */

/* Animation Variants */
// 기존 하단 섹션용 애니메이션. 현재 제공 섹션으로 교체하면서 보존만 합니다.
// const fadeUp = {
//   hidden: { opacity: 0, y: 40 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const }
//   },
// };

const scaleUp = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] as const } 
  },
};

export const HomeClient = () => {
  const [isHeadlineFinished, setIsHeadlineFinished] = useState(false);

  return (
    <div className="flex flex-col">
      <HeroSection onComplete={() => setIsHeadlineFinished(true)} />
      
      {isHeadlineFinished && (
        <div className="relative flex flex-col overflow-x-clip animate-in fade-in duration-1000">
          <motion.div 
            className="relative z-20 -mt-20 sm:-mt-28 md:-mt-40 lg:-mt-48"
            variants={scaleUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <DashboardSection />
          </motion.div>

          <FeatureWalkthroughSection />

          {/*
            기존 하단 랜딩 섹션은 현재 제공 범위 메시지와 맞지 않아 주석 처리합니다.

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <PainPointsSection />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <SolutionSection />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <AgentFirst />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <FeatureExplorer />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <TestimonialsSection />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <UseCases />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <PricingSection />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <FAQSection />
            </motion.div>

            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <DownloadSection />
            </motion.div>
          */}

          <MvpSections />
        </div>
      )}
    </div>
  );
};
