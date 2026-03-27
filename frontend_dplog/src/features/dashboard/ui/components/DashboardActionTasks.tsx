import React, { useState } from 'react';
import { ArrowRight, AlertCircle, CloudRain, Copy, Check, MessageSquareText } from 'lucide-react';

interface Props {
  data: any;
}

export const DashboardActionTasks = ({ data }: Props) => {
  const [copiedReview, setCopiedReview] = useState(false);
  const [copiedFeed, setCopiedFeed] = useState(false);

  const handleCopy = async (text: string, type: 'review' | 'feed') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'review') { setCopiedReview(true); setTimeout(() => setCopiedReview(false), 2000); }
      if (type === 'feed') { setCopiedFeed(true); setTimeout(() => setCopiedFeed(false), 2000); }
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <>
      <h2 className="text-[22px] font-bold tracking-tight text-[#191F28] pl-2">당장 해야 할 1분 숙제</h2>
      
      <div className="bg-white p-8 lg:p-10 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-8 border border-slate-100">
        <div className="flex flex-col gap-3">
          <span className="text-[14px] font-bold text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-full">노출 방어</span>
          <h3 className="text-[28px] md:text-[34px] leading-[1.3] font-bold tracking-tight text-[#191F28] whitespace-pre-line word-break-keep">
            {data.task1_title}
          </h3>
          <p className="text-[18px] font-medium text-[#8B95A1]">
            {data.task1_sub}
          </p>
        </div>
        <button className="w-full lg:w-fit bg-[#3182F6] hover:bg-[#1B64DA] text-white font-bold text-[18px] py-4 px-10 rounded-[20px] transition-colors flex items-center justify-center gap-2 mt-2">
          {data.task1_cta} <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white p-8 lg:p-10 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-6 border border-rose-100">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-bold text-rose-500 bg-rose-50 w-fit px-3 py-1 rounded-full flex items-center gap-1"><AlertCircle className="w-4 h-4"/> 악플 대응</span>
            <h3 className="text-[24px] leading-[1.3] font-bold tracking-tight text-[#191F28] whitespace-pre-line word-break-keep">
              {data.task2_title}
            </h3>
            <p className="text-[#4E5968] leading-[1.6] text-[17px] word-break-keep">
              {data.task2_sub}
            </p>
          </div>
        </div>
        
        <div className="bg-[#F2F4F6] p-5 rounded-[16px] border border-slate-200">
          <p className="text-[14px] text-[#8B95A1] font-bold mb-2">고객 리뷰:</p>
          <p className="text-[15px] text-[#4E5968] italic">"{data.task2_targetReview}"</p>
        </div>

        <div className="relative bg-[#EBFAFF] p-6 text-[16px] text-[#333D4B] rounded-[20px] leading-relaxed word-break-keep border border-blue-100">
          <span className="absolute top-4 right-4 text-[12px] font-bold text-blue-500 bg-white px-2 py-1 rounded-md border border-blue-200">AI 추천 답글</span>
          {data.task2_aiReply}
        </div>

        <div className="flex gap-3 mt-2">
          <button 
            onClick={() => handleCopy(data.task2_aiReply, 'review')}
            className="w-full lg:w-fit bg-[#F2F4F6] hover:bg-[#E5E8EB] active:bg-[#D1D6DB] text-[#4E5968] font-bold text-[16px] py-4 px-8 rounded-[16px] transition-colors flex items-center justify-center gap-2"
          >
            {copiedReview ? <Check className="w-5 h-5 text-blue-500" /> : <Copy className="w-5 h-5" />}
            {copiedReview ? '답글 복사됨' : 'AI 답글 복사하기'}
          </button>
        </div>
      </div>

      <div className="bg-white p-8 lg:p-10 rounded-[28px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-6 border border-slate-100">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-bold text-purple-600 bg-purple-50 w-fit px-3 py-1 rounded-full flex items-center gap-1"><CloudRain className="w-4 h-4"/> 날씨 마케팅</span>
            <h3 className="text-[22px] leading-[1.3] font-bold tracking-tight text-[#191F28] whitespace-pre-line word-break-keep">
              {data.task3_title}
            </h3>
          </div>
        </div>
        
        <div className="bg-[#F9FAFB] p-6 text-[16px] text-[#4E5968] rounded-[20px] leading-relaxed word-break-keep border border-slate-200">
          "{data.task3_feedText}"
        </div>

        <div className="flex gap-3 mt-2">
          <button 
            onClick={() => handleCopy(data.task3_feedText, 'feed')}
            className="w-full lg:w-fit bg-[#F2F4F6] hover:bg-[#E5E8EB] active:bg-[#D1D6DB] text-[#4E5968] font-bold text-[16px] py-4 px-8 rounded-[16px] transition-colors flex items-center justify-center gap-2"
          >
            {copiedFeed ? <Check className="w-5 h-5 text-purple-500" /> : <MessageSquareText className="w-5 h-5 ml-[-2px]" />}
            {copiedFeed ? '복사 완료!' : '당근마켓에 올리기'}
          </button>
        </div>
      </div>
    </>
  );
};
