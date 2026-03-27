'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContractUploadView } from './ContractUploadView';
import { ContractScanningLoader } from './ContractScanningLoader';
import { ContractReportView } from './ContractReportView';
import { OnboardingProgressHeader } from '../components/OnboardingProgressHeader';

type Step = 'upload' | 'scanning' | 'report';

export function Phase4ContractContainer() {
  const [step, setStep] = useState<Step>('upload');

  const handleUpload = () => {
    setStep('scanning');
    
    // Simulate API/Loading time for scanning the contract
    setTimeout(() => {
      setStep('report');
    }, 4500); // 4.5 seconds of intense scanning UX
  };

  const handleRetake = () => {
    setStep('upload');
  };

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-white overflow-hidden font-sans flex flex-col">
      <div className="relative z-50">
        <OnboardingProgressHeader currentPhase={5} />
      </div>
      
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="h-full min-h-screen"
          >
            <ContractUploadView onUpload={handleUpload} />
          </motion.div>
        )}
        
        {step === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.5 }}
            className="h-full min-h-screen"
          >
            <ContractScanningLoader />
          </motion.div>
        )}
        
        {step === 'report' && (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, type: 'spring', bounce: 0.4 }}
            className="h-full min-h-screen"
          >
            <ContractReportView onRetake={handleRetake} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
