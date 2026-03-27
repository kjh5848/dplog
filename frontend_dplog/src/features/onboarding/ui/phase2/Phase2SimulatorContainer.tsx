'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CapitalDistributorView } from './CapitalDistributorView';
import { MarginCalculatorView } from './MarginCalculatorView';
import { ROICalculatorView } from './ROICalculatorView';
import { Phase2ReportView } from './Phase2ReportView';
import { OnboardingProgressHeader } from '../components/OnboardingProgressHeader';

type Phase2Step = 'capital-distributor' | 'margin-calculator' | 'roi-calculator' | 'report';

export const Phase2SimulatorContainer = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Phase2Step>('capital-distributor');
  const [targetProfit, setTargetProfit] = useState<number>(5000000); // 500만원 기본 라우팅 시

  const handleNextFromCapital = () => {
    setCurrentStep('margin-calculator');
  };

  const handleNextFromMargin = (profit: number) => {
    setTargetProfit(profit);
    setCurrentStep('roi-calculator');
  };

  const handleNextFromROI = () => {
    setCurrentStep('report');
  };

  const handleNextFromReport = () => {
    router.push('/showcase'); 
  };

  const handleBackToCapital = () => {
    setCurrentStep('capital-distributor');
  };

  const handleBackToMargin = () => {
    setCurrentStep('margin-calculator');
  };

  const handleBackToROI = () => {
    setCurrentStep('roi-calculator');
  };

  const handleBack = () => {
    if (currentStep === 'margin-calculator') {
      setCurrentStep('capital-distributor');
    } else {
      router.push('/phase1-setup');
    }
  };

  const getProgressPhase = () => {
    switch (currentStep) {
      case 'capital-distributor': return 2;
      case 'margin-calculator': return 3;
      case 'roi-calculator': return 4;
      case 'report': return 5;
      default: return 2;
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col font-sans mb-12">
      <div className="w-full relative z-50 pt-6">
        <OnboardingProgressHeader currentPhase={getProgressPhase()} />
      </div>
      
      <div className="w-full max-w-4xl mx-auto flex flex-col pt-6 relative">
        {/* 팩트폭행 타이틀 영역 */}
      <div className="text-center py-6 mb-8 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-2">
          팩트폭행 생존 시뮬레이터
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
          사장님의 로망을 차가운 숫자로 검증하는 시간입니다.
        </p>
      </div>

      <div className="flex-1 relative w-full mt-4">
        <AnimatePresence mode="wait">
          {currentStep === 'capital-distributor' && (
            <motion.div
              key="capital-distributor"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <CapitalDistributorView onNext={handleNextFromCapital} onBack={handleBack} />
            </motion.div>
          )}

          {currentStep === 'margin-calculator' && (
            <motion.div
              key="margin-calculator"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <MarginCalculatorView onNext={handleNextFromMargin} onBack={handleBackToCapital} />
            </motion.div>
          )}

            {currentStep === 'roi-calculator' && (
              <motion.div
                key="roi-calculator"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <ROICalculatorView 
                  targetProfit={targetProfit} 
                  onNext={handleNextFromROI} 
                  onBack={handleBackToMargin}
                />
              </motion.div>
            )}

            {currentStep === 'report' && (
              <motion.div
                key="report"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full"
              >
                <Phase2ReportView 
                  onNext={handleNextFromReport} 
                  onBack={handleBackToROI}
                />
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
    </div>
  );
};
