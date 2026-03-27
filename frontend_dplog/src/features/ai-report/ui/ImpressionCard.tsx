import { Camera, MapPin, Store, MessageSquare, AlertOctagon, ArrowRight } from 'lucide-react';

export const ImpressionCard = () => {
  return (
    <div className="card-toss p-8 md:p-10 flex flex-col gap-8 animate-slide-in-up stagger-1 overflow-hidden group/card relative">
      {/* ImpressionCard content strictly without AI slush gradients */}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-toss-blue text-white flex flex-shrink-0 items-center justify-center shadow-lg shadow-toss-blue/20 group-hover/card:scale-105 transition-transform duration-500">
            <Store className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <h2 className="text-[24px] md:text-[28px] font-black text-toss-title dark:text-white tracking-tight leading-none">플레이스 첫인상 진단</h2>
            <p className="text-[15px] text-toss-muted font-medium word-break-keep flex items-center gap-1.5">
              <span>검색 후 3초</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="text-toss-body dark:text-slate-300 font-bold">고객 이탈을 막는 핵심 요소 평가</span>
            </p>
          </div>
        </div>
        
        {/* Alerts in Toss-style use Rose as the standard alert color */}
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-full border border-rose-200 dark:border-rose-500/20 w-fit drop-shadow-sm">
          <AlertOctagon className="w-4 h-4 text-rose-500 animate-pulse" />
          <span className="text-[14px] font-extrabold text-rose-600 dark:text-rose-400">집중 관리 필요 (50점)</span>
        </div>
      </div>

      {/* Grid Content with Fluid Spacing */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-6 relative z-10">
        
        {/* Item 1: Photo & Interior (Focus Area) */}
        <div className="md:col-span-7 bg-[#F2F4F6] dark:bg-slate-800/80 p-7 md:p-8 rounded-[24px] enhanced-hover flex flex-col justify-between overflow-hidden relative">
          
          <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:scale-110 transition-transform duration-700 pointer-events-none translate-x-1/4 translate-y-1/4">
            <Camera className="w-64 h-64 text-toss-blue" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-100 dark:border-slate-600">
                <Camera className="w-5 h-5 text-toss-blue dark:text-toss-blue group-hover:scale-110 transition-transform" />
              </div>
              <span className="font-extrabold text-toss-title dark:text-white text-[18px]">대표 사진 & 인테리어</span>
            </div>
            
            <p className="text-toss-body dark:text-slate-300 font-medium text-[16px] leading-[1.7] text-korean">
              현재 등록된 1~3번째 사진은 모두 <strong className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-toss-title dark:text-white border border-slate-200/60 shadow-sm border-b-2">접사 음식 사진</strong>입니다. 
              <br/><br/>
              고객은 음식을 먹을 <strong className="text-rose-500 dark:text-rose-400 underline decoration-rose-200 dark:decoration-rose-500/30 underline-offset-4">'장소 분위기'</strong>를 먼저 봅니다. 데이트 코스로 식당을 찾는 2030 이탈률이 매우 높게 나타납니다.
            </p>
          </div>

          <button className="relative z-10 mt-8 text-[15px] font-extrabold text-white bg-toss-blue hover:bg-toss-blue-hover dark:bg-toss-blue dark:hover:bg-toss-blue-hover px-6 py-3.5 rounded-full w-fit transition-all flex items-center gap-2 group/btn">
            매력적인 대표 사진 배치 방법
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Small Items Stack */}
        <div className="md:col-span-5 flex flex-col gap-5 md:gap-6">
          
          {/* Item 2: Menu Naming */}
          <div className="flex-1 bg-white dark:bg-slate-800/80 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 enhanced-hover">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-600">
                <MessageSquare className="w-4 h-4 text-toss-title dark:text-slate-200" />
              </div>
              <span className="font-bold text-toss-title dark:text-white text-[15px]">단조로운 메뉴판 구조</span>
            </div>
            <p className="text-toss-subtext dark:text-slate-400 font-medium text-[14px] leading-[1.6] text-korean">
              가장 상단에 <strong className="text-toss-title dark:text-white px-1 font-bold">추천/베스트 라벨</strong>이 부착된 시그니처 세트가 없습니다. 고객이 선택 장애를 겪다 창을 닫아버립니다. 
            </p>
          </div>

          {/* Item 3: Directions */}
          <div className="flex-1 bg-white dark:bg-slate-800/80 p-6 rounded-[24px] border border-slate-100 dark:border-slate-700 enhanced-hover">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-slate-50 dark:bg-slate-700/50 p-1.5 rounded-lg border border-slate-100 dark:border-slate-600">
                <MapPin className="w-4 h-4 text-toss-title dark:text-slate-200" />
              </div>
              <span className="font-bold text-toss-title dark:text-white text-[15px]">불친절한 찾아오는 길</span>
            </div>
            <p className="text-toss-subtext dark:text-slate-400 font-medium text-[14px] leading-[1.6] text-korean">
              <span className="line-through text-toss-muted">"가게 앞에 오시면 됩니다."</span><br/>
              도보는 N번 출구 기준 몇 분인지, <strong className="text-toss-title dark:text-white">주차장 지원/무료 여부</strong>를 첫 줄에 명확히 명시해야 전환율이 오릅니다.
            </p>
          </div>

        </div>
        
      </div>
    </div>
  );
};

