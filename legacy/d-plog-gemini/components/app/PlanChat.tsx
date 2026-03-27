import React, { useState } from 'react';

interface StepProps {
  onExit: () => void;
}

const PlanChat: React.FC<StepProps> = ({ onExit }) => {
  return (
    <div className="h-screen bg-black text-white font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-16 flex items-center justify-between border-b border-gray-800 bg-black px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
            <span className="font-black tracking-tighter text-xl">D-PLOG</span>
            <div className="h-4 w-px bg-gray-800 hidden md:block"></div>
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
                <span className="material-symbols-outlined text-lg">folder_open</span>
                <span className="font-medium">Project: My Cafe Business Plan</span>
            </div>
        </div>
        <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-lg">save</span>
                임시 저장
            </button>
            <button onClick={onExit} className="flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg text-sm font-bold shadow-sm hover:bg-gray-200 transition-colors">
                <span>나가기</span>
                <span className="material-symbols-outlined text-lg">logout</span>
            </button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden relative">
        {/* Left Panel: Chat */}
        <section className="flex flex-col w-full md:w-[50%] lg:w-[40%] bg-black border-r border-gray-800 h-full relative z-10">
            {/* Progress */}
            <div className="px-6 py-4 border-b border-gray-800 bg-black/90 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Progress</span>
                        <span className="text-sm font-bold text-white">47% Complete</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-1 overflow-hidden">
                        <div className="bg-white h-full rounded-full w-[47%]"></div>
                    </div>
                </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-gray-800">
                <div className="flex justify-center">
                    <span className="text-xs font-medium text-gray-600 bg-gray-900 px-3 py-1 rounded-full">Today, 10:23 AM</span>
                </div>

                {/* AI */}
                <div className="flex items-start gap-4 max-w-[90%]">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-gray-700">
                        <span className="material-symbols-outlined text-white">smart_toy</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-500 ml-1">AI Agent</span>
                        <div className="bg-neutral-900 border border-gray-800 rounded-2xl rounded-tl-none p-4">
                            <p className="text-sm leading-relaxed text-gray-300">
                                안녕하세요! 사업계획서 작성을 계속해볼까요? 지난번에 제품 전략에 대해 이야기 나누고 있었습니다.
                            </p>
                        </div>
                    </div>
                </div>

                 {/* AI Question */}
                 <div className="flex items-start gap-4 max-w-[90%]">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center border border-gray-700">
                        <span className="material-symbols-outlined text-white">smart_toy</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-gray-500 ml-1">AI Agent</span>
                        <div className="bg-neutral-900 border border-gray-800 rounded-2xl rounded-tl-none p-4">
                            <p className="text-sm leading-relaxed text-gray-300">
                                이 카페만의 <span className="text-white font-bold">시그니처 메뉴</span>는 무엇인가요? 독특한 재료나 제조 방식이 있다면 자세히 알려주세요.
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Answer */}
                <div className="flex items-start gap-4 max-w-[90%] self-end flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black font-bold">
                        ME
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-xs font-bold text-gray-500 mr-1">You</span>
                        <div className="bg-white text-black rounded-2xl rounded-tr-none p-4">
                            <p className="text-sm leading-relaxed font-medium">
                                로컬 꿀과 귀리 우유를 사용한 스페셜 라떼가 주력입니다. 꿀은 10km 이내 농장에서 직접 공수해요.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-6 pt-2 bg-black">
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                     <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-gray-800 hover:border-gray-600 text-xs font-medium text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                        <span className="material-symbols-outlined text-sm">lightbulb</span> 예시 보여줘
                     </button>
                     <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-gray-800 hover:border-gray-600 text-xs font-medium text-gray-400 hover:text-white transition-colors whitespace-nowrap">
                        <span className="material-symbols-outlined text-sm">school</span> 용어 설명해줘
                     </button>
                </div>

                <div className="relative flex items-end gap-2 bg-neutral-900 border border-gray-800 rounded-xl p-2 focus-within:border-white transition-colors">
                    <button className="p-2 text-gray-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                    <textarea className="flex-1 bg-transparent border-none focus:outline-none p-2 text-sm text-white placeholder-gray-600 resize-none max-h-32" placeholder="답변을 입력하세요..." rows={1}></textarea>
                    <button className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors">
                        <span className="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        </section>

        {/* Right Panel: Preview */}
        <section className="hidden md:flex flex-col flex-1 bg-neutral-950 p-6 overflow-hidden h-full">
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2 text-white">
                    <span className="material-symbols-outlined text-2xl">description</span>
                    <h2 className="text-lg font-bold">실시간 사업계획서 미리보기</h2>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">방금 저장됨</span>
                </div>
            </div>

            <div className="bg-white text-black rounded-xl shadow-2xl h-full overflow-y-auto p-12 max-w-3xl mx-auto w-full">
                <div className="border-b-2 border-black mb-8 pb-4">
                    <h1 className="text-3xl font-black mb-2">My Cafe Business Plan</h1>
                    <p className="text-gray-500 text-sm">2025년 5월 20일 초안</p>
                </div>

                <div className="mb-10">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span> 1. 사업 개요 (Executive Summary)
                    </h3>
                    <p className="text-sm leading-relaxed">
                        본 사업은 지역 커뮤니티 중심의 환경에서 고품질의 음료를 제공하는 스페셜티 커피숍을 목표로 합니다. 전략적 입지 선정과 프리미엄 소싱을 통해 첫해 지역 시장 점유율 15%를 달성할 계획입니다.
                    </p>
                </div>

                <div className="mb-10 relative">
                     <div className="absolute -left-8 top-1 animate-pulse text-blue-600">
                        <span className="material-symbols-outlined">edit_note</span>
                     </div>
                     <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
                        2. 제품 전략 및 차별화
                     </h3>
                     <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <h4 className="text-sm font-bold mb-2">핵심 제품군</h4>
                        <p className="text-sm leading-relaxed mb-4">
                            주력 제품 라인은 에스프레소 기반 음료에 집중합니다. 핵심 차별화 포인트는 <span className="border-b border-dashed border-gray-400">초근접 소싱(Hyper-local Sourcing)</span> 전략입니다.
                        </p>
                        <h4 className="text-sm font-bold mb-2">시그니처 아이템</h4>
                        <p className="text-sm leading-relaxed">
                            대표 메뉴인 <strong>"허니-오트 라떼"</strong>는 <span className="bg-yellow-100 px-1">반경 10km 이내 양봉장</span>에서 공수한 천연 꿀과 프리미엄 귀리 우유를 블렌딩하여 제공합니다. 이는 가치 소비를 중시하는 현대 소비자의 니즈를 충족시킵니다.
                        </p>
                     </div>
                </div>

                <div className="mb-10 opacity-40">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">radio_button_unchecked</span> 3. 시장 분석
                    </h3>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                </div>
            </div>
        </section>
      </main>
    </div>
  );
};

export default PlanChat;