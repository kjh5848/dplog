import React from 'react';
import { Search, TrendingUp, TrendingDown, Minus, ChevronRight, Star } from 'lucide-react';

interface Props {
  data: any;
}

export const DashboardBriefing = ({ data }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      <div className="bg-white p-6 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col min-h-[220px]">
        <span className="text-[14px] font-bold text-[#8B95A1] flex items-center gap-1.5"><Search className="w-4 h-4"/> 플레이스 노출 순위 (Top 4)</span>
        
        <div className="flex flex-col gap-2 my-4">
          {data.keywords.map((kw: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center">
              <span className="text-[15px] font-semibold text-[#333D4B]">{kw.name}</span>
              <div className="flex items-center gap-1.5 w-[65px] justify-end">
                <span className="text-[15px] font-bold text-[#191F28]">{kw.rank}위</span>
                {kw.status === 'up' && <span className="text-[12px] font-bold text-emerald-500 flex items-center"><TrendingUp className="w-3 h-3"/>{kw.diff}</span>}
                {kw.status === 'down' && <span className="text-[12px] font-bold text-rose-500 flex items-center"><TrendingDown className="w-3 h-3"/>{Math.abs(kw.diff)}</span>}
                {kw.status === 'same' && <span className="text-[12px] font-bold text-slate-400 flex items-center"><Minus className="w-3 h-3"/></span>}
              </div>
            </div>
          ))}
        </div>
        
        <button className="w-full mt-auto bg-[#F2F4F6] hover:bg-[#E5E8EB] active:bg-[#D1D6DB] text-[#4E5968] font-bold text-[14px] py-3 rounded-[12px] transition-colors flex items-center justify-center gap-1">
          전체 순위 조회기 가기 <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col min-h-[220px]">
        <span className="text-[14px] font-bold text-[#8B95A1] flex items-center gap-1.5"><TrendingUp className="w-4 h-4"/> 주간 검색 조회수</span>
        
        <div className="flex flex-col gap-1 mt-5">
          <span className="text-[32px] font-bold text-[#191F28] tracking-tight">{data.searchWeekly}<span className="text-[20px] font-semibold text-[#8B95A1] ml-1">명</span></span>
          <span className="text-[15px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-md w-fit flex items-center gap-1"><TrendingUp className="w-4 h-4"/> 전주 대비 {data.searchDiff} 유입</span>
          <p className="text-[14px] text-[#8B95A1] mt-3 word-break-keep leading-relaxed">평일 저녁 시간대 유입이 큰 폭으로 증가했습니다.</p>
        </div>

        <button className="w-full mt-auto bg-[#F2F4F6] hover:bg-[#E5E8EB] active:bg-[#D1D6DB] text-[#4E5968] font-bold text-[14px] py-3 rounded-[12px] transition-colors flex items-center justify-center gap-1">
          상세 유입 경로 보기 <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white p-6 rounded-[24px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-rose-100 flex flex-col min-h-[220px]">
        <span className="text-[14px] font-bold text-rose-500 flex items-center gap-1.5"><Star className="w-4 h-4"/> 신규 리뷰 동향</span>
        
        <div className="flex flex-col gap-2 mt-5">
          <span className="text-[22px] font-bold text-[#191F28] leading-[1.3] word-break-keep">부정 평가 <span className="text-rose-500">{data.badReviewCount}건</span> 발견</span>
          <p className="text-[15px] font-medium text-[#4E5968] mt-1">이번 주 신규 리뷰 총 5건 달림</p>
          
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-slate-100 text-slate-500 text-[12px] font-bold px-2 py-1 rounded-md">맛 4.8</span>
            <span className="bg-slate-100 text-slate-500 text-[12px] font-bold px-2 py-1 rounded-md">친절도 2.1</span>
          </div>
        </div>

        <button className="w-full mt-auto bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-600 font-bold text-[14px] py-3 rounded-[12px] transition-colors flex items-center justify-center gap-1">
          리뷰 관리 바로가기 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
