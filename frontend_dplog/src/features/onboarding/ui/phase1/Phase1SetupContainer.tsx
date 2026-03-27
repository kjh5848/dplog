'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useOnboardingStore } from '../../store/useOnboardingStore';

// We will import these views after creating them
import { CapitalSetupView } from './CapitalSetupView';
import { TargetAudienceView } from './TargetAudienceView';
import { MainItemView } from './MainItemView';
import { DDaySetupView } from './DDaySetupView';

const STEPS = [
  { id: 'capital', title: '초기 자본금' },
  { id: 'audience', title: '타겟 고객층' },
  { id: 'item', title: '판매 아이템' },
  { id: 'dday', title: '목표 오픈일' }
];

export const Phase1SetupContainer = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  
  const { totalCapital, targetAudience, mainItem, dDay } = useOnboardingStore();

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Navigate to Phase 2: Simulator
      router.push('/phase2-simulator');
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  // Determine if the current step is valid to proceed
  const canProceed = () => {
    switch (currentStep) {
      case 0: return totalCapital !== null && totalCapital > 0;
      case 1: return targetAudience !== null;
      case 2: return mainItem !== null;
      case 3: return dDay !== null;
      default: return false;
    }
  };

  return (
    <div className="flex flex-col min-h-[70vh] w-full max-w-4xl mx-auto px-6 py-12">
      {/* Progress Bar */}
      <div className="w-full mb-12">
        <div className="flex justify-between mb-2">
          {STEPS.map((step, idx) => (
             <div key={step.id} className="text-sm font-bold w-1/4 text-center">
               <span className={cn(
                 "transition-colors duration-300",
                 idx <= currentStep ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-600"
               )}>
                 {step.title}
               </span>
             </div>
          ))}
        </div>
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center w-full max-w-3xl mx-auto relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {currentStep === 0 && <CapitalSetupView />}
            {currentStep === 1 && <TargetAudienceView />}
            {currentStep === 2 && <MainItemView />}
            {currentStep === 3 && <DDaySetupView />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between w-full max-w-3xl mx-auto mt-12">
        <button
          onClick={handlePrev}
          className="flex items-center gap-2 px-6 py-4 rounded-full font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-5 h-5" />
          이전으로
        </button>
        
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={cn(
            "flex items-center gap-2 px-10 py-4 rounded-full font-bold text-lg transition-all",
            canProceed()
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
          )}
        >
          {currentStep === STEPS.length - 1 ? '시뮬레이터 가동' : '다음 단계로'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
