import { Users, BookOpen, AlertCircle, Sparkles, TrendingUp, ChevronRight, Zap } from 'lucide-react';

export const ReviewGapCard = () => {
  return (
    <div className="card-toss p-8 md:p-10 flex flex-col gap-8 animate-slide-in-up stagger-2 overflow-hidden group/card relative">
      {/* ReviewGapCard content strictly without AI slush gradients */}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex flex-shrink-0 items-center justify-center shadow-lg shadow-emerald-500/20 rotate-3 group-hover/card:rotate-0 transition-transform duration-500">
            <Users className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <h2 className="text-[24px] md:text-[28px] font-black text-toss-title dark:text-white tracking-tight leading-none">진짜 고객의 목소리</h2>
            <p className="text-[15px] text-toss-muted font-medium word-break-keep flex items-center gap-1.5">
              <span>블로거 마케팅</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-toss-body dark:text-slate-300 font-bold">실제 방문객 평가 갭(Gap)</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-[#F2F4F6] dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700 w-fit">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[14px] font-extrabold text-toss-body dark:text-slate-200">종합 평가 85점</span>
        </div>
      </div>

      {/* VS Comparison Area */}
      <div className="relative flex flex-col md:flex-row gap-6 items-stretch mt-2 z-10">
        
        {/* VS Badge (Absolute Center) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 items-center justify-center z-20 shadow-[0_8px_30px_rgba(0,0,0,0.12)] text-toss-title dark:text-white font-black italic text-[18px]">
          VS
        </div>

        {/* Blogger Perspective */}
        <div className="flex-1 bg-[#F2F4F6] dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-[24px] p-7 relative overflow-hidden group enhanced-hover">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <BookOpen className="w-32 h-32 text-toss-blue" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 text-toss-blue dark:text-blue-400">
              <span className="text-[12px] font-black tracking-widest uppercase bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded text-blue-700 dark:text-blue-300">Marketing</span>
              <h3 className="font-extrabold text-[17px] tracking-tight text-toss-title dark:text-white">블로거들은 주로 이렇게 말해요</h3>
            </div>
            
            <div className="flex flex-wrap gap-2.5 mb-6">
              <span className="bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-toss-blue dark:text-blue-300 px-3.5 py-1.5 rounded-full text-[14px] font-bold hover:scale-105 transition-transform cursor-default">#인스타감성 📸</span>
              <span className="bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-toss-blue dark:text-blue-300 px-3.5 py-1.5 rounded-full text-[14px] font-bold hover:scale-105 transition-transform cursor-default">#데이트코스 🥂</span>
              <span className="bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-toss-blue dark:text-blue-300 px-3.5 py-1.5 rounded-full text-[14px] font-bold hover:scale-105 transition-transform cursor-default">#플레이팅예술 ✨</span>
            </div>
            
            <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
              <p className="text-toss-body dark:text-slate-300 text-[14.5px] font-medium leading-[1.65] text-korean">
                협찬 리뷰에서는 주로 시각적인 요소와 매장 분위기를 강력하게 어필하고 있습니다. 젊은 층의 호기심을 자극하기 좋은 상태입니다.
              </p>
            </div>
          </div>
        </div>

        {/* Real Visitor Perspective */}
        <div className="flex-1 bg-[#F2F4F6] dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-[24px] p-7 relative overflow-hidden group enhanced-hover">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <TrendingUp className="w-32 h-32 text-emerald-600" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 text-emerald-600 dark:text-emerald-400">
              <span className="text-[12px] font-black tracking-widest uppercase bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded text-emerald-700 dark:text-emerald-300">Reality</span>
              <h3 className="font-extrabold text-[17px] tracking-tight text-toss-title dark:text-white">찐방문자들은 이렇게 평가합니다</h3>
            </div>
            
            <div className="flex flex-wrap gap-2.5 mb-6">
              <span className="bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-[14px] font-bold hover:scale-105 transition-transform cursor-default">#미친가성비 💸</span>
              <span className="bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 text-emerald-600 dark:text-emerald-400 px-3.5 py-1.5 rounded-full text-[14px] font-bold hover:scale-105 transition-transform cursor-default">#양이진짜많음 🍱</span>
              <span className="bg-rose-50 dark:bg-rose-900/40 shadow-sm border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded-full text-[14px] font-bold hover:scale-105 transition-transform cursor-default line-through decoration-rose-400/50">#알바생불친절</span>
            </div>
            
            <div className="bg-white dark:bg-slate-700 p-4 rounded-2xl border border-slate-100 dark:border-slate-600">
              <p className="text-toss-body dark:text-slate-300 text-[14.5px] font-medium leading-[1.65] text-korean">
                실제 내돈내산 고객은 분위기보다는 압도적인 <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-50 dark:bg-emerald-900/30 px-1 rounded">가성비와 푸짐한 양</strong>에 꽂혀 재방문을 결심합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insight Box (Clean Toss Style) */}
      <div className="bg-blue-50 dark:bg-slate-800/80 rounded-[16px] p-6 flex flex-col md:flex-row gap-5 w-full mt-4 items-start">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex flex-col gap-2 pt-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-blue-600 font-extrabold text-[15px] tracking-tight text-korean">핵심 인사이트</span>
            <span className="w-1 h-1 rounded-full bg-blue-200"></span>
            <h3 className="text-toss-title dark:text-white font-bold text-[17px] tracking-tight text-korean">마케팅 포인트와 민심의 치명적 불일치</h3>
          </div>
          <p className="text-toss-body dark:text-slate-300 text-[15px] leading-[1.65] word-break-keep text-korean mt-1">
            마케팅은 '데이트 코스'로 하는데, 실제 단골은 '가성비' 때문에 옵니다. 소개글 워딩을 <strong className="text-toss-title dark:text-white underline decoration-rose-400 underline-offset-4 font-bold">"양 많고 가성비 대박인 맛집"</strong>으로 수정하면 전환율이 폭발할 수 있습니다. 또한, 치명적인 <span className="text-rose-500 font-bold">직원 불친절 키워드</span>는 즉각적인 교육 매뉴얼 도입이 필요합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
