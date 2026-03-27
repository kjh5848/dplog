'use client';

import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Check } from 'lucide-react';

interface Props {
  currentPhase: number;
}

const PHASES = [
  { id: 1, name: '조건 설정' },
  { id: 2, name: '자본 분배' },
  { id: 3, name: '마진 분석' },
  { id: 4, name: '투자 회수' },
  { id: 5, name: '종합 진단' },
];

export function OnboardingProgressHeader({ currentPhase }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 pt-6 pb-2 mb-4">
      <div className="flex items-center justify-between relative">
        
        {/* Background Line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-neutral-800 rounded-full z-0" />
        
        {/* Active Progress Line */}
        <motion.div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 rounded-full z-0 pointer-events-none"
          initial={{ width: 0 }}
          animate={{ width: `${((currentPhase - 1) / (PHASES.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* Dots & Labels */}
        {PHASES.map((phase, index) => {
          const isActive = currentPhase === phase.id;
          const isCompleted = currentPhase > phase.id;

          return (
            <div key={phase.id} className="relative z-10 flex flex-col items-center">
              {/* Dot */}
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.2 : 1,
                }}
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  isActive || isCompleted 
                    ? "bg-indigo-500 text-white border-indigo-500" 
                    : "bg-white dark:bg-[#111111] text-slate-400 dark:text-neutral-500 border-slate-300 dark:border-neutral-700",
                  isActive && "border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                )}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-bold">{phase.id}</span>
                )}
              </motion.div>

              {/* Label */}
              <motion.span
                initial={false}
                animate={{
                  y: isActive ? 0 : 2
                }}
                className={cn(
                  "absolute top-8 text-[10px] sm:text-xs font-semibold whitespace-nowrap transition-colors duration-300",
                  isActive 
                    ? "text-slate-900 dark:text-white opacity-100" 
                    : isCompleted 
                      ? "text-slate-500 dark:text-neutral-400 opacity-70" 
                      : "text-slate-400 dark:text-neutral-600 opacity-70"
                )}
              >
                {phase.name}
              </motion.span>
            </div>
          );
        })}

      </div>
    </div>
  );
}
