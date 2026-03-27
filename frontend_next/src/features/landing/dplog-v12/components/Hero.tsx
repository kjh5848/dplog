'use client';

import React from 'react';
import { ParticleCanvas, SectionContainer, TypedText, Button } from './ui/Common';
import { Rocket, ArrowRight } from 'lucide-react';

interface HeroProps {
  onStartPathfinder?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartPathfinder }) => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 z-0 opacity-50">
        <ParticleCanvas theme="light" />
      </div>

      <SectionContainer className="relative z-10 text-center flex flex-col items-center">
        {/* Logo / Badge */}
        <div className="mb-8 animate-fade-in-up">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium text-gray-600">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
             AI·RAG 기반 외식업 솔루션
           </div>
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-6 max-w-5xl mx-auto leading-tight">
          <span className="block mb-2">조회가 아닌,</span>
          <span className="text-blue-600">
            <TypedText text="실행 중심의 AI 경영" startDelay={100} />
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
          100만 폐업 시대, 소상공인의 생존을 위한 필수 솔루션.<br className="hidden md:block" />
          D-PLOG는 원인 분석부터 마케팅 실행, 정부 지원사업 매칭까지 원스톱으로 해결합니다.
        </p>

        {/* CTA Buttons - Single Button for Pathfinder */}
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up delay-300">
          <Button 
            variant="primary" 
            icon={<Rocket className="w-5 h-5"/>} 
            onClick={onStartPathfinder}
            className="pl-8 pr-8 py-4 text-lg shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-1"
          >
            무료 진단 시작하기 (창업 초기)
          </Button>
        </div>
        <p className="mt-4 text-sm text-gray-400 animate-fade-in delay-500">
            내 가게 진단 · AI 마케팅 · 사업계획서 자동 완성
        </p>
      </SectionContainer>
    </section>
  );
};
