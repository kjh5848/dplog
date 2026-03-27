import React from 'react';
import { Store, ChevronDown, MapPin, Check } from 'lucide-react';

interface Props {
  data: any;
}

export const DashboardStoreProfile = ({ data }: Props) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/70 backdrop-blur-xl p-6 lg:p-8 rounded-[28px] border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-2 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
      
      <div className="flex gap-5 items-center z-10">
        <div className="w-16 h-16 bg-blue-600 rounded-[20px] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
          <Store className="w-8 h-8" />
        </div>
        
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity w-fit group/dropdown">
            <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-[#191F28]">
              {data.shopName}
            </h1>
            <div className="bg-slate-100 p-1.5 rounded-full group-hover/dropdown:bg-slate-200 transition-colors">
              <ChevronDown className="w-5 h-5 text-slate-600" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[15px] font-medium text-[#4E5968]">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#8B95A1]"/>{data.shopAddress}</span>
            <span className="hidden sm:block text-slate-300">|</span>
            <span className="flex items-center gap-2">
              <span className="text-[#4E5968] font-medium text-[15px]">대표 키워드:</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {data.targetKeywords.map((kw: string, idx: number) => (
                  <span key={idx} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[13px] font-bold">
                    {kw}
                  </span>
                ))}
              </div>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 md:mt-0 flex items-center gap-3 w-full md:w-auto z-10">
        <button className="flex-1 md:flex-none border border-slate-200 hover:bg-slate-50 text-[#4E5968] font-bold text-[15px] py-3 px-5 rounded-[14px] transition-colors">
          키워드 설정
        </button>
        <button className="flex-1 md:flex-none bg-[#191F28] hover:bg-[#333D4B] text-white font-bold text-[15px] py-3 px-5 rounded-[14px] transition-colors flex items-center justify-center gap-2">
          새 매장 추가하기 <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
