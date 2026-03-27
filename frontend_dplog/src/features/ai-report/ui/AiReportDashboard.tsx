'use client';

import { Suspense } from 'react';
import { ImpressionCard } from './ImpressionCard';
import { ReviewGapCard } from './ReviewGapCard';
import { CompetitorMatchCard } from './CompetitorMatchCard';
import { CommunicationCard } from './CommunicationCard';
import { Sparkles, FileText } from 'lucide-react';

export const AiReportDashboard = () => {
  return (
    <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 pb-32 pt-4">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-2 animate-slide-in-up">
        <div className="flex items-center gap-2 text-toss-blue bg-blue-50/80 backdrop-blur-sm border border-blue-100/50 w-fit px-3.5 py-1.5 rounded-full font-bold text-[13px] shadow-sm">
          <Sparkles className="w-4 h-4 text-toss-blue" />
          <span className="text-korean">AI 주치의 종합 건강 검진표</span>
        </div>
        <div>
          <h1 className="text-[28px] md:text-[34px] font-extrabold tracking-tight toss-title text-toss-title dark:text-white leading-[1.3] word-break-keep text-korean">
            사장님, 이번 달 우리 가게<br className="md:hidden"/> 진단 리포트가 도착했어요.
          </h1>
          <p className="text-toss-body dark:text-slate-400 text-[16px] font-medium mt-2 word-break-keep text-korean">
            고객이 매장을 방문하기 전 마주치는 결정적 순간들을 AI가 분석했습니다.
          </p>
        </div>
      </div>

      {/* Grid Layout for sections */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column (Main Analysis) */}
        <div className="xl:col-span-8 flex flex-col gap-6 lg:gap-8">
          <Suspense fallback={<div className="h-64 bg-slate-100 animate-pulse rounded-[24px]" />}>
            <ImpressionCard />
          </Suspense>
          
          <Suspense fallback={<div className="h-64 bg-slate-100 animate-pulse rounded-[24px]" />}>
            <ReviewGapCard />
          </Suspense>

          <Suspense fallback={<div className="h-64 bg-slate-100 animate-pulse rounded-[24px]" />}>
            <CompetitorMatchCard />
          </Suspense>
        </div>

        {/* Right Column (Actions & Comm) */}
        <div className="xl:col-span-4 flex flex-col gap-6 lg:gap-8">
          <div className="sticky top-8 flex flex-col gap-6 lg:gap-8">
            <Suspense fallback={<div className="h-64 bg-slate-100 animate-pulse rounded-[24px]" />}>
              <CommunicationCard />
            </Suspense>
            
            {/* Download/Share Actions */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 rounded-[24px] flex flex-col gap-4 shadow-sm animate-slide-in-up stagger-5 enhanced-hover">
              <h3 className="font-bold text-toss-title dark:text-white text-[17px] tracking-tight text-korean">리포트 보관함</h3>
              <p className="text-[14px] text-toss-body mb-1 word-break-keep text-korean">
                직원들이나 동업자와 함께 리포트를 공유하고 개선 방안을 논의해보세요.
              </p>
              <button className="w-full py-4 bg-[#F2F4F6] hover:bg-slate-200 active:bg-slate-300 text-toss-body font-bold text-[15px] rounded-[14px] flex items-center justify-center gap-2 transition-colors text-korean">
                <FileText className="w-5 h-5" />
                PDF로 다운로드
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
