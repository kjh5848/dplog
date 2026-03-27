'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface HeroSectionProps {
  onComplete?: () => void;
}

const TypingEffect = ({
  text,
  speed = 40,
  onComplete,
}: {
  text: string;
  speed?: number;
  onComplete?: () => void;
}) => {
  const [displayedCount, setDisplayedCount] = useState(0);
  const characters = Array.from(text);

  useEffect(() => {
    if (displayedCount < characters.length) {
      const timer = setTimeout(() => setDisplayedCount((p) => p + 1), speed);
      return () => clearTimeout(timer);
    } else {
      onComplete?.();
    }
  }, [displayedCount, characters.length, speed, onComplete]);

  return (
    <span>
      {characters.map((char, i) => (
        <span
          key={i}
          className={cn(
            'transition-opacity duration-75',
            i < displayedCount ? 'opacity-100' : 'opacity-0'
          )}
        >
          {char}
        </span>
      ))}
      {displayedCount < characters.length && (
        <span className="animate-pulse text-blue-500 font-light">|</span>
      )}
    </span>
  );
};

const HeadlineSequence = ({ onComplete }: { onComplete?: () => void }) => {
  const [stage, setStage] = useState(0);

  const line1 = '매장 노출,';
  const line2 = '감이 아닌 데이터로.';

  const handleLine1Complete = useCallback(() => setStage(1), []);
  const handleLine2Complete = useCallback(() => {
    setStage(2);
    onComplete?.();
  }, [onComplete]);

  return (
    <div className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
      <div className="min-h-[1.2em]">
        <TypingEffect text={line1} speed={60} onComplete={handleLine1Complete} />
      </div>
      <div className="min-h-[1.2em] text-blue-600 dark:text-blue-400 mt-1">
        {stage >= 1 && (
          <TypingEffect text={line2} speed={60} onComplete={handleLine2Complete} />
        )}
      </div>
    </div>
  );
};

export const HeroSection = ({ onComplete }: HeroSectionProps) => {
  const [showContent, setShowContent] = useState(false);

  const handleHeadlineComplete = useCallback(() => {
    setShowContent(true);
    setTimeout(() => onComplete?.(), 400);
  }, [onComplete]);

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/40 via-transparent to-transparent dark:from-blue-950/20 dark:via-transparent dark:to-transparent" />

      <div className="relative max-w-4xl mx-auto text-center">
        <HeadlineSequence onComplete={handleHeadlineComplete} />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={showContent ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={cn(!showContent && 'pointer-events-none')}
        >
          {/* Value proposition — PRD §1 */}
          <p className="mt-8 text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed break-keep">
            플레이스 URL 하나면, 10분 안에{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              근거 기반 진단 리포트
            </span>
            가 완성됩니다.
          </p>

          {/* Social proof hint */}
          <p className="mt-4 text-sm text-slate-400 dark:text-slate-500">
            외식업 사장님 2,200명이 선택한 진단 서비스
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-base transition-all shadow-lg shadow-blue-500/20"
            >
              무료로 진단 시작하기
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-8 py-4 rounded-2xl font-bold text-base hover:border-slate-300 dark:hover:border-slate-600 transition-all"
            >
              2분 소개 영상 보기
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
