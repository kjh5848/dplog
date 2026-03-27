import { Megaphone, MessageCircle, AlertOctagon, CheckCircle2, ChevronRight, Zap } from 'lucide-react';

export const CommunicationCard = () => {
  return (
    <div className="card-toss p-8 md:p-10 flex flex-col gap-8 animate-slide-in-up stagger-4 overflow-hidden group/card relative">
      {/* CommunicationCard content strictly without AI slush gradients */}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 relative z-10">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-toss-blue text-white flex flex-shrink-0 items-center justify-center shadow-lg shadow-toss-blue/20 -rotate-3 group-hover/card:rotate-0 transition-transform duration-500">
            <Megaphone className="w-7 h-7" />
          </div>
          <div className="flex flex-col gap-1.5 pt-1">
            <h2 className="text-[24px] md:text-[28px] font-black text-toss-title dark:text-white tracking-tight leading-none">1분 처방전</h2>
            <p className="text-[15px] text-toss-blue dark:text-blue-400 font-extrabold flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-toss-blue dark:fill-blue-400" />
              <span className="text-korean">사장님, 오늘 당장 이것부터 실행하세요!</span>
            </p>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="flex flex-col gap-5 mt-2 relative z-10 w-full">
        
        {/* Task 1 */}
        <div className="bg-white rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 p-6 md:p-7 flex flex-col gap-4 w-full">
            {/* Header & Icon */}
            <div className="flex gap-4">
              <div className="w-[42px] h-[42px] rounded-[16px] bg-[#3182F6] text-white font-bold text-[18px] flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                1
              </div>
              <div className="flex flex-col gap-2.5 pt-1">
                <h3 className="text-[#191F28] font-bold text-[20px] leading-tight text-korean word-break-keep">방치된 악성 리뷰에 AI 해명 답글 달기</h3>
                
                {/* Badge */}
                <div className="flex items-center gap-1.5 bg-rose-50 text-rose-500 border border-rose-100 px-2.5 py-1 rounded-[6px] w-fit text-[12px] font-bold text-korean">
                   <AlertOctagon className="w-3.5 h-3.5" />
                   시급
                </div>
              </div>
            </div>
            
            {/* Body */}
            <p className="text-[#4E5968] text-[16px] leading-[1.6] mt-2 word-break-keep text-korean">
              2일 전 올라온 <span className="bg-slate-100 text-[#191F28] font-semibold px-1.5 py-0.5 rounded-[4px] mx-0.5">2점짜리 위생 관련 리뷰</span>에 아직 답글이 없습니다. 이것 하나 때문에 주말 단체 예약이 취소될 수 있습니다!
            </p>
            
            {/* Button */}
            <button className="mt-2 w-full bg-[#3182F6] hover:bg-[#1B64DA] active:bg-[#1552B3] text-white font-bold text-[16px] py-4 rounded-[14px] flex items-center justify-center gap-2 transition-colors text-korean">
              <MessageCircle className="w-5 h-5" />
              AI 사과문 초안 생성 및 복사
            </button>
        </div>

        {/* Task 2 */}
        <div className="bg-white rounded-[24px] shadow-sm border border-slate-100 p-6 md:p-7 flex flex-col gap-3 w-full group hover:border-slate-300 hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="flex gap-4">
              <div className="w-[42px] h-[42px] rounded-[16px] bg-slate-100 text-[#4E5968] font-bold text-[18px] flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div className="flex flex-col gap-1 w-full justify-center">
                <div className="flex items-center justify-between w-full">
                  <h3 className="text-[#191F28] font-bold text-[18px] leading-tight text-korean word-break-keep">가게 '상세 정보' 첫 줄에 주차 안내 추가</h3>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#191F28] transition-colors" />
                </div>
                <p className="text-[#4E5968] text-[15px] leading-[1.6] mt-1 word-break-keep text-korean">
                  1등 경쟁점 대비 가장 취약한 정보입니다. 지금 바로 연결을 통해 수정하세요.
                </p>
              </div>
            </div>
        </div>

        {/* Task 3 (Completed) */}
        <div className="bg-[#F9FAFB] rounded-[24px] border border-slate-100 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full opacity-70 hover:opacity-100 transition-opacity duration-300 cursor-default">
            <div className="w-[42px] h-[42px] rounded-[16px] bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h3 className="text-[#8B95A1] font-bold text-[16px] leading-tight text-korean word-break-keep line-through decoration-slate-300">대표 메뉴 썸네일 밝기 교체하기</h3>
              <p className="text-emerald-500 text-[14px] font-bold text-korean">
                오늘 오전 10:24 완료됨
              </p>
            </div>
        </div>

      </div>
    </div>
  );
};
