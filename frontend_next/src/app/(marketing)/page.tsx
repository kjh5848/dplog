'use client';

import React, { useState } from 'react';
import { HeroSectionV13 } from '@/features/landing/components/HeroSectionV13';
import { AgentFirstV13 } from '@/features/landing/components/AgentFirstV13';
import { DashboardSectionV1 } from '@/features/landing/dplog-v10/components/DashboardSectionV1';
import { PainPointsSectionV3 } from '@/features/landing/dplog-v11/components/PainPointsSectionV3';
import { SolutionSectionV2 } from '@/features/landing/dplog-v11/components/SolutionSectionV2';
import { FeatureExplorer } from '@/features/landing/dplog-v12/components/Features';
import { TestimonialsSection } from '@/features/landing/dplog-v10/components/TestimonialsSection';
import { UseCases, DownloadSection } from '@/features/landing/dplog-v12/components/Resources';
import { PricingSection } from '@/features/landing/dplog-v10/components/PricingSection';
import { FAQSection } from '@/features/landing/dplog-v10/components/FAQSection';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] } 
  },
};

const scaleUp = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } 
  },
};

export default function MarketingPage() {
  const [isHeadlineFinished, setIsHeadlineFinished] = useState(false);

  return (
    <main className="relative w-full overflow-hidden">
      <HeroSectionV13 onComplete={() => setIsHeadlineFinished(true)} />
      
      {isHeadlineFinished && (
        <div className="flex flex-col">
          <motion.div 
            className="-mt-32 md:-mt-48 relative z-20"
            variants={scaleUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <DashboardSectionV1 />
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <PainPointsSectionV3 />
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <SolutionSectionV2 />
          </motion.div>
          
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <AgentFirstV13 />
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
        </div>
      )}
    </main>
  );
}
