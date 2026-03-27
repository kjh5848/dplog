'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';

interface HeroSectionProps {
  onComplete?: () => void;
}

/**
 * 한 글자씩 나타나는 타이핑 효과 컴포넌트
 * - useEffect + setTimeout 기반으로 안정적인 시퀀스 보장
 */
const TypingEffect = ({
  text,
  speed = 50,
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
      const timer = setTimeout(() => {
        setDisplayedCount((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      // 타이핑 완료
      onComplete?.();
    }
  }, [displayedCount, characters.length, speed, onComplete]);

  return (
    <span>
      {characters.map((char, index) => (
        <span
          key={index}
          className={cn(
            'transition-opacity duration-100',
            index < displayedCount ? 'opacity-100' : 'opacity-0'
          )}
        >
          {char}
        </span>
      ))}
      {/* 깜빡이는 커서 */}
      {displayedCount < characters.length && (
        <span className="animate-pulse text-blue-500">|</span>
      )}
    </span>
  );
};

const HeadlineSequence = ({ onComplete }: { onComplete?: () => void }) => {
  const [stage, setStage] = useState(0);

  const line1 = '비싼 월 대행료 없이도 매출이 오르는 법,';
  const line2 = "사장님의 '데이터 자생력'에 있습니다.";

  const handleLine1Complete = useCallback(() => {
    setStage(1);
  }, []);

  const handleLine2Complete = useCallback(() => {
    setStage(2);
    onComplete?.();
  }, [onComplete]);

  return (
    <div className="text-3xl md:text-5xl font-extrabold mb-8 tracking-tighter leading-tight break-keep">
      <div className="min-h-[1.4em]">
        <TypingEffect text={line1} speed={30} onComplete={handleLine1Complete} />
      </div>
      <div className="min-h-[1.4em] text-blue-600 dark:text-blue-400 mt-2">
        {stage >= 1 && (
          <TypingEffect text={line2} speed={30} onComplete={handleLine2Complete} />
        )}
      </div>
    </div>
  );
};

export const HeroSection = ({ onComplete }: HeroSectionProps) => {
  const [showOthers, setShowOthers] = useState(false);

  const handleHeadlineComplete = useCallback(() => {
    setShowOthers(true);
    setTimeout(() => {
      onComplete?.();
    }, 300);
  }, [onComplete]);

  return (
    <section className="pt-32 pb-12 px-4 text-center overflow-hidden min-h-[70vh] flex items-center justify-center">
      <div className="max-w-4xl mx-auto">
        <HeadlineSequence onComplete={handleHeadlineComplete} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showOthers ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className={cn(!showOthers && 'pointer-events-none')}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-primary text-xs font-bold mb-8">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            외식업 사장님 2,200명이 선택한 솔루션
          </div>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed break-keep">
            낭비되는 광고비를 90% 이상 절감하고, AI 에이전트가 생성한 고효율 콘텐츠와
            주간 미션으로 사장님이 직접 매장을 성장시키는{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              &apos;화이트박스&apos; 경영
            </span>
            을 시작하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-500/20"
            >
              <span className="material-icons-round">rocket_launch</span>
              무료로 진단 시작하기
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(241, 245, 249, 1)' }}
              whileTap={{ scale: 0.95 }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-200"
            >
              서비스 소개서 다운로드
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
