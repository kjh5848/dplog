import React from 'react';
import { ChevronRight } from 'lucide-react';

export const DashboardCurationReport = () => {
  return (
    <>
      <h2 className="text-[22px] font-bold tracking-tight text-[#191F28] pl-2">돈이 되는 리포트</h2>
      
      <div className="flex flex-col gap-4">
        
        <div className="bg-white p-6 lg:p-7 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all flex flex-col gap-3 group">
          <span className="text-[13px] font-bold text-orange-500 bg-orange-50 w-fit px-2.5 py-1 rounded-md">경쟁점 동향</span>
          <span className="text-[16px] leading-[1.5] font-bold text-[#191F28] word-break-keep group-hover:text-orange-600 transition-colors">
            근처 '아비꼬 연산점'이 어제부터 플레이스에 <span className="text-orange-500">새 광고 뱃지</span>를 달기 시작했어요. 클릭을 뺏길 수 있습니다.
          </span>
          <span className="text-[14px] text-[#8B95A1] flex items-center gap-1 mt-2">대응 전략 보기 <ChevronRight className="w-4 h-4" /></span>
        </div>

        <div className="bg-white p-6 lg:p-7 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all flex flex-col gap-3 group">
          <span className="text-[13px] font-bold text-blue-500 bg-blue-50 w-fit px-2.5 py-1 rounded-md">급상승 키워드</span>
          <span className="text-[16px] leading-[1.5] font-bold text-[#191F28] word-break-keep group-hover:text-blue-600 transition-colors">
            요즘 동네 사람들이 <span className="text-blue-600 font-extrabold">'스프카레'</span>를 많이 검색해요. 메뉴판에 추가해 볼까요?
          </span>
          <span className="text-[14px] text-[#8B95A1] flex items-center gap-1 mt-2">검색량 분석 보기 <ChevronRight className="w-4 h-4" /></span>
        </div>

        <div className="bg-white p-6 lg:p-7 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-slate-100 cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all flex flex-col gap-3 group">
          <span className="text-[13px] font-bold text-rose-500 bg-rose-50 w-fit px-2.5 py-1 rounded-md">세무 캘린더</span>
          <span className="text-[16px] leading-[1.5] font-bold text-[#191F28] word-break-keep group-hover:text-rose-600 transition-colors">
            부가가치세 1기 예정 고지 기간입니다. 국세청에서 날아온 우편물을 꼭 확인하세요.
          </span>
          <span className="text-[14px] text-[#8B95A1] flex items-center gap-1 mt-2">내역 확인하기 <ChevronRight className="w-4 h-4" /></span>
        </div>

        <div className="bg-emerald-50 p-6 lg:p-7 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-emerald-100 cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all flex flex-col gap-3 group">
          <span className="text-[13px] font-bold text-emerald-600 bg-emerald-100 w-fit px-2.5 py-1 rounded-md">지원금 리마인드</span>
          <span className="text-[16px] leading-[1.5] font-bold text-emerald-900 word-break-keep group-hover:text-emerald-700 transition-colors">
            서초구 테이블오더 도입 500만 원 지원사업 신청 마감이 <strong>내일</strong>입니다!
          </span>
          <span className="text-[14px] text-emerald-700 flex items-center gap-1 mt-2">지금 바로 온라인 신청 <ChevronRight className="w-4 h-4" /></span>
        </div>
        
      </div>
    </>
  );
};
