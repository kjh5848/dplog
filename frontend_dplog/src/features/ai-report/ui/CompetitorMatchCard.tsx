import { Swords, Crown, ArrowDownRight, ArrowUpRight, Crosshair } from 'lucide-react';

export const CompetitorMatchCard = () => {
  return (
    <div className="bg-[#1C1D22] w-full rounded-[32px] p-8 md:p-10 flex flex-col gap-10 shadow-2xl relative overflow-hidden animate-slide-in-up stagger-3">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 relative z-10 w-full mb-2">
        <div className="inline-flex items-center gap-1.5 bg-[#3182F6]/10 text-[#3182F6] px-3.5 py-1.5 rounded-[8px] font-extrabold text-[13px] tracking-tight text-korean">
           <Crosshair className="w-4 h-4" />
           핵심 비교 분석
        </div>
        <h2 className="text-white text-[28px] md:text-[34px] font-black tracking-tight word-break-keep text-korean mt-1">
          우리 동네 1등 <span className="text-[#00E5FF]">미카도스시</span>
        </h2>
        <p className="text-[#8B95A1] text-[15px] md:text-[16px] word-break-keep text-korean">왜 저 가게는 항상 대기줄이 끊이지 않을까요?</p>
      </div>
      
      {/* VS Container */}
      <div className="flex flex-col md:flex-row relative w-full gap-6 md:gap-4 z-10">
        
        {/* Left: Our Store */}
        <div className="flex-1 bg-[#23252B] border border-[#2D3038] rounded-[24px] p-7 md:p-8 flex flex-col gap-6 relative">
           {/* Badge */}
           <div className="flex items-center gap-2 text-[#8B95A1] font-bold text-[13px] tracking-tight mb-2 text-korean">
             <div className="w-1.5 h-1.5 rounded-full bg-[#3182F6]"></div>
             현재 진단 상태
           </div>
           <h3 className="text-white text-[22px] md:text-[24px] font-extrabold mb-2 md:mb-4">우리 가게</h3>
           
           {/* Items list */}
           <div className="flex flex-col gap-6">
             {/* Item 1 */}
             <div className="flex gap-4 group/item">
               <div className="w-10 h-10 rounded-full bg-rose-900/30 border border-rose-900 flex items-center justify-center shrink-0">
                 <ArrowDownRight className="w-5 h-5 text-rose-500" />
               </div>
               <div className="flex flex-col gap-1.5 pt-0.5">
                 <span className="text-rose-400 font-bold text-[14px]">주차 정보</span>
                 <p className="text-[#A0A5B1] text-[14.5px] leading-relaxed word-break-keep text-korean">정보가 눈에 띄지 않아 체류 시간이 짧고 실제 전화 문의가 잦음</p>
               </div>
             </div>
             
             {/* Item 2 */}
             <div className="flex gap-4 group/item">
               <div className="w-10 h-10 rounded-full bg-rose-900/30 border border-rose-900 flex items-center justify-center shrink-0">
                 <ArrowDownRight className="w-5 h-5 text-rose-500" />
               </div>
               <div className="flex flex-col gap-1.5 pt-0.5">
                 <span className="text-rose-400 font-bold text-[14px]">리뷰 유입량</span>
                 <p className="text-[#A0A5B1] text-[14.5px] leading-relaxed word-break-keep text-korean">주간 신규 리뷰 유입량이 3~4건에 불과함</p>
               </div>
             </div>
           </div>
        </div>
        
        {/* VS Badge (Absolute Center for Desktop, static for Mobile) */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#18191C] border-[6px] border-[#1C1D22] items-center justify-center shadow-lg z-20">
          <span className="text-[#8B95A1] font-black text-lg md:text-xl italic">VS</span>
        </div>
        
        {/* Right: Top Competitor */}
        <div className="flex-1 bg-[#262444] border border-[#3B366A] rounded-[24px] p-7 md:p-8 flex flex-col gap-6 relative overflow-hidden shadow-[0_0_40px_rgba(99,102,241,0.05)]">
           {/* Top Neon Border Effect */}
           <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"></div>
           <div className="absolute top-0 left-0 right-0 h-[10px] bg-gradient-to-b from-cyan-400/20 to-transparent blur-md"></div>
           
           {/* Badge */}
           <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[13px] tracking-tight mb-2 text-korean">
             <Crown className="w-4 h-4 text-indigo-400" />
             벤치마킹 대상
           </div>
           <h3 className="text-white text-[22px] md:text-[24px] font-extrabold mb-2 md:mb-4 word-break-keep text-korean">1등 가게 (미카도스시)</h3>
           
           {/* Items list */}
           <div className="flex flex-col gap-4">
             {/* Item 1 */}
             <div className="bg-[#2C2859] border border-[#3B366A] rounded-[16px] p-5 flex gap-4 transition-transform hover:-translate-y-1">
               <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                 <ArrowUpRight className="w-5 h-5 text-indigo-300" />
               </div>
               <div className="flex flex-col pt-0.5 gap-2 w-full">
                 <span className="text-indigo-300 font-bold text-[13px] text-korean">영업 비밀 - 주차</span>
                 <p className="text-white text-[14.5px] leading-[1.6] font-semibold word-break-keep text-korean">
                   소개글 첫 줄에 <span className="text-[#00E5FF]">"넓은 전용 주차장 완비"</span> 를 적어 차량 접근성을 즉시 어필
                 </p>
               </div>
             </div>
             
             {/* Item 2 */}
             <div className="bg-[#2C2859] border border-[#3B366A] rounded-[16px] p-5 flex gap-4 transition-transform hover:-translate-y-1">
               <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                 <ArrowUpRight className="w-5 h-5 text-indigo-300" />
               </div>
               <div className="flex flex-col pt-0.5 gap-2 w-full">
                 <span className="text-indigo-300 font-bold text-[13px] text-korean">영업 비밀 - 리뷰</span>
                 <p className="text-white text-[14.5px] leading-[1.6] font-semibold word-break-keep text-korean">
                   리뷰 작성 시 '연어초밥 2피스' 제공 이벤트를 통해 <span className="text-[#00E5FF] border-b border-[#00E5FF]/40 pb-[1px]">주차별 리뷰 30건 이상</span> 꾸준히 확보
                 </p>
               </div>
             </div>
           </div>
        </div>
        
      </div>
    </div>
  );
};
