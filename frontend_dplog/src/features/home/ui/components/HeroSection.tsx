'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Rocket } from 'lucide-react';
import Link from 'next/link';

import { ShinyButton, GradientButton } from '@/shared/ui/custom-buttons';


interface HeroSectionV13Props {
  onComplete?: () => void;
}

import { useRouter } from 'next/navigation';

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
    <div className="text-3xl md:text-4xl lg:text-6xl font-black mb-6 tracking-tighter leading-tight break-keep [text-wrap:balance]">
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

export const HeroSection = ({ onComplete }: HeroSectionV13Props) => {
  const [showOthers, setShowOthers] = useState(false);

  const router = useRouter();

  const handleHeadlineComplete = useCallback(() => {
    setShowOthers(true);
    setTimeout(() => {
      onComplete?.();
    }, 300);
  }, [onComplete]);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-start pt-[12vh] md:pt-[22vh] overflow-visible">
      {/* Container for Texts and Buttons */}
      <div className="container relative z-10 max-w-6xl mx-auto px-4 flex flex-col items-center text-center">
        <HeadlineSequence onComplete={handleHeadlineComplete} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={showOthers ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className={cn('flex flex-col items-center', !showOthers && 'pointer-events-none')}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
            외식업 사장님 2,200명이 선택한 솔루션
          </div>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-3xl mx-auto leading-relaxed break-keep [text-wrap:balance]">
            낭비되는 광고비를 90% 이상 절감하고, AI 에이전트가 생성한 고효율 콘텐츠와
            주간 미션으로 사장님이 직접 매장을 성장시키는{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              &apos;화이트박스&apos; 경영
            </span>
            을 시작하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-end">
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                창업 운영중
              </span>
              <ShinyButton 
                className="w-72 h-16"
                onClick={() => {
                  router.push('/phase1-setup?type=operating');
                }}
              >
                <Rocket className="w-5 h-5" />
                무료로 진단 시작하기
              </ShinyButton>
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                창업 초기 (예비 창업자)
              </span>
              <GradientButton 
                className="w-72 h-16"
                onClick={() => {
                  router.push('/phase1-setup?type=startup');
                }}
              >
                창업성공 전자책 받기
              </GradientButton>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
