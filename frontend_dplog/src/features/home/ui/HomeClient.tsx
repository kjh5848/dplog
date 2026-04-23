'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

/* Components */
import { HeroSection } from './components/HeroSection';
import { AgentFirst } from './components/AgentFirst';
import { DashboardSection } from './components/DashboardSection';
import { PainPointsSection } from './components/PainPointsSection';
import { SolutionSection } from './components/SolutionSection';
import { FeatureExplorer } from './components/FeatureExplorer';
import { TestimonialsSection } from './components/TestimonialsSection';
import { UseCases, DownloadSection } from './components/Resources';
import { PricingSection } from './components/PricingSection';
import { FAQSection } from './components/FAQSection';

/* Animation Variants */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] as const } 
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

export const HomeClient = () => {
  const [isHeadlineFinished, setIsHeadlineFinished] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 로컬 모드일 경우 마케팅 랜딩 페이지를 건너뛰고 대시보드로 직행 (Feature Toggle)
    if (process.env.NEXT_PUBLIC_APP_MODE === 'local') {
      router.replace('/dashboard');
    }
  }, [router]);

  // 로컬 모드일 경우 렌더링을 완전히 막음 (화면 깜박임 방지)
  if (process.env.NEXT_PUBLIC_APP_MODE === 'local') {
    return null;
  }

  return (
    <div className="flex flex-col">
      <HeroSection onComplete={() => setIsHeadlineFinished(true)} />
      
      {isHeadlineFinished && (
        <div className="flex flex-col animate-in fade-in duration-1000">
          <motion.div 
            className="-mt-32 md:-mt-48 relative z-20"
            variants={scaleUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <DashboardSection />
          </motion.div>

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
        </div>
      )}
    </div>
  );
};
