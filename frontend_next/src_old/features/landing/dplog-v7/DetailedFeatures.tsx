import React from "react";
import { Search, FileBarChart, CheckSquare, ArrowRight, Zap, Trophy, AlertTriangle } from "lucide-react";

export default function DetailedFeatures() {
  return (
    <section className="py-32 bg-brand-primary overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
            {/* Feature 1: Diagnosis - Radial Progress & Score */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-32 group">
                <div className="flex-1 order-2 md:order-1">
                    <div className="w-14 h-14 bg-brand-secondary/10 rounded-2xl mb-8 flex items-center justify-center text-brand-secondary shadow-lg shadow-brand-secondary/20">
                        <Search size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight leading-tight font-display">
                        건강검진 하듯이,<br/>
                        가게의 상태를 <span className="text-brand-secondary">정밀 진단</span>합니다.
                    </h3>
                    <p className="text-xl text-text-secondary leading-relaxed mb-8">
                        사람이 아프면 병원에 가듯, 가게 매출이 아프면 원인을 찾아야 합니다.
                        D-PLOG는 네이버 플레이스 순위 로직을 24시간 분석하여
                        어떤 점이 부족한지 10초 만에 알려드립니다.
                    </p>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 p-5 bg-surface-base rounded-2xl shadow-sm border border-white/10 group-hover:border-brand-secondary/50 transition-colors">
                             <div className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary font-bold">1</div>
                             <span className="font-bold text-text-primary text-lg">주요 키워드 노출 순위</span>
                             <span className="ml-auto text-brand-secondary font-bold bg-brand-secondary/10 px-3 py-1 rounded-full text-sm">실시간 분석</span>
                        </div>
                         <div className="flex items-center gap-4 p-5 bg-surface-base rounded-2xl shadow-sm border border-white/10 group-hover:border-green-500/50 transition-colors">
                             <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 font-bold">2</div>
                             <span className="font-bold text-text-primary text-lg">플레이스 최적화 점수</span>
                             <span className="ml-auto text-green-500 font-bold bg-green-500/10 px-3 py-1 rounded-full text-sm">100점 만점</span>
                        </div>
                    </div>
                </div>
                <div className="flex-1 order-1 md:order-2">
                     <div className="aspect-square bg-surface-base rounded-[48px] shadow-2xl shadow-brand-secondary/10 border border-white/10 p-10 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-secondary/10 via-transparent to-transparent" />
                        
                        {/* High Fidelity Diagnosis Card */}
                        <div className="relative z-10 h-full flex flex-col items-center text-center justify-center">
                            <div className="relative w-64 h-64 mb-8">
                                {/* SVG Radial Progress */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="128" cy="128" r="120" stroke="#333" strokeWidth="24" fill="transparent" />
                                    <circle cx="128" cy="128" r="120" stroke="#3B82F6" strokeWidth="24" fill="transparent" strokeDasharray="753" strokeDashoffset="188" strokeLinecap="round" className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-7xl font-black text-white tracking-tighter">72<span className="text-4xl text-gray-500 font-medium">점</span></span>
                                    <span className="text-sm font-bold text-brand-secondary mt-2 bg-brand-secondary/10 px-3 py-1 rounded-full border border-brand-secondary/20">개선 필요</span>
                                </div>
                            </div>
                            
                            <div className="w-full bg-white/5 rounded-2xl p-6 border border-white/10">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-400 font-medium">상위 10% 진입까지</span>
                                    <span className="text-white font-bold">+28점</span>
                                </div>
                                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-[72%] bg-brand-secondary rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                </div>
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* Feature 2: Analysis - Competitor Gap */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 mb-32 group">
                <div className="flex-1">
                     <div className="aspect-square bg-[#0A0A0A] rounded-[48px] shadow-2xl shadow-purple-900/20 border border-white/10 p-8 relative overflow-hidden text-white group-hover:scale-[1.02] transition-transform duration-500">
                         {/* Abstract Grid background */}
                         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                         
                         <div className="relative z-10 flex flex-col h-full justify-center">
                             <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl mb-4 text-left">
                                 <div className="flex justify-between items-center mb-6">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                            <Trophy size={20} className="text-yellow-400" />
                                         </div>
                                         <div className="text-left">
                                             <div className="text-sm text-gray-400">1위 경쟁사</div>
                                             <div className="font-bold">맛있는 녀석들</div>
                                         </div>
                                     </div>
                                     <div className="text-2xl font-bold text-white">98점</div>
                                 </div>
                                 <div className="space-y-3">
                                     <div className="flex justify-between text-sm">
                                         <span className="text-gray-400">리뷰 수</span>
                                         <span className="text-green-400 font-bold">1,240개 (+120)</span>
                                     </div>
                                     <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                         <div className="bg-green-500 h-full w-[90%] shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                     </div>
                                 </div>
                             </div>

                              <div className="bg-white/5 backdrop-blur-xl border border-white/5 p-6 rounded-3xl relative text-left">
                                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg shadow-red-500/50">VS</div>
                                 <div className="flex justify-between items-center mb-6">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
                                         </div>
                                         <div className="text-left">
                                             <div className="text-sm text-gray-400">내 가게</div>
                                             <div className="font-bold text-gray-300">우리집 식당</div>
                                         </div>
                                     </div>
                                     <div className="text-2xl font-bold text-gray-300">72점</div>
                                 </div>
                                 <div className="space-y-3">
                                     <div className="flex justify-between text-sm">
                                         <span className="text-gray-500">리뷰 수</span>
                                         <span className="text-red-400 font-bold">340개 (부족)</span>
                                     </div>
                                     <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                                         <div className="bg-red-500 h-full w-[30%] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>
                </div>
                <div className="flex-1">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl mb-8 flex items-center justify-center text-purple-500 shadow-lg shadow-purple-500/20">
                        <FileBarChart size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight leading-tight font-display">
                        경쟁사는 왜 1등일까?<br/>
                        비밀을 <span className="text-purple-500">엑스레이처럼</span> 보여줍니다.
                    </h3>
                    <p className="text-xl text-text-secondary leading-relaxed mb-8">
                        잘 되는 집은 이유가 있습니다. <br/>
                        1위 업체와 내 가게의 데이터를 비교 분석하여,
                        우리가 놓치고 있는 키워드와 마케팅 포인트를 명확한 수치로 제시합니다.
                    </p>
                    <ul className="space-y-4">
                         <li className="flex items-start gap-4">
                             <div className="w-6 h-6 bg-purple-500/10 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                                 <ArrowRight size={14} className="text-purple-500" />
                             </div>
                             <span className="text-xl text-text-primary font-medium">리뷰 키워드 분석 (맛있다 vs 친절하다)</span>
                         </li>
                         <li className="flex items-start gap-4">
                             <div className="w-6 h-6 bg-purple-500/10 rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                                 <ArrowRight size={14} className="text-purple-500" />
                             </div>
                             <span className="text-xl text-text-primary font-medium">방문자 트래픽 비교 및 갭(Gap) 분석</span>
                         </li>
                    </ul>
                </div>
            </div>

            {/* Feature 3: Action - To-Do List */}
            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24 group">
                <div className="flex-1 order-2 md:order-1">
                    <div className="w-14 h-14 bg-green-500/10 rounded-2xl mb-8 flex items-center justify-center text-green-500 shadow-lg shadow-green-500/20">
                        <CheckSquare size={28} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-3xl md:text-5xl font-bold text-text-primary mb-6 tracking-tight leading-tight font-display">
                        막막한 마케팅,<br/>
                        <span className="text-green-500">오늘 할 일</span>만 딱 정해드립니다.
                    </h3>
                    <p className="text-xl text-text-secondary leading-relaxed mb-8">
                        "블로그 체험단을 써야 하나? 인스타 광고를 해야 하나?"<br/>
                        고민하지 마세요. 가장 시급하고 효과적인 개선 작업부터
                        우선순위대로 처방해 드립니다.
                    </p>
                    <button className="btn-primary">
                        내 가게 처방전 받기 <ArrowRight size={20} />
                    </button>
                </div>
                <div className="flex-1 order-1 md:order-2">
                     <div className="aspect-square bg-surface-base rounded-[48px] shadow-2xl shadow-green-900/10 border border-white/10 p-8 relative overflow-hidden flex flex-col group-hover:scale-[1.02] transition-transform duration-500">
                        <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent z-10"></div>
                        
                        <div className="flex items-center justify-between mb-8 relative z-20">
                             <h4 className="text-2xl font-bold text-text-primary">Today's Action</h4>
                             <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full">3건 남음</span>
                        </div>

                        <div className="space-y-4 flex-1 relative z-20">
                             {/* High Priority Item */}
                             <div className="flex items-start gap-4 p-5 bg-surface-glass rounded-2xl border border-red-500/30 shadow-lg shadow-red-500/10 transform translate-x-4 backdrop-blur-md">
                                 <div className="mt-1">
                                    <div className="w-6 h-6 border-2 border-red-500/50 rounded-lg flex items-center justify-center">
                                        <AlertTriangle size={12} className="text-red-400" />
                                    </div>
                                 </div>
                                 <div className="text-left">
                                     <div className="flex items-center gap-2 mb-1">
                                         <span className="font-bold text-text-primary text-lg">대표 사진 고화질 교체</span>
                                         <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/20">긴급</span>
                                     </div>
                                     <p className="text-sm text-text-secondary">고객 이탈률이 15% 증가했습니다.</p>
                                 </div>
                             </div>

                              {/* Completed Item */}
                             <div className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-transparent opacity-60">
                                 <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center text-white text-xs shadow-sm">✓</div>
                                 <span className="font-bold text-gray-500 line-through text-lg">영수증 리뷰 답글 달기</span>
                             </div>

                             {/* Normal Item */}
                              <div className="flex items-center gap-4 p-5 bg-surface-glass rounded-2xl border border-white/10 shadow-sm backdrop-blur-md">
                                 <div className="w-6 h-6 border-2 border-white/20 rounded-lg"></div>
                                 <div className="text-left">
                                      <div className="flex items-center gap-2 mb-1">
                                         <span className="font-bold text-gray-300 text-lg">네이버 톡톡 배너 설정</span>
                                         <span className="text-[10px] font-bold bg-white/10 text-gray-400 px-2 py-0.5 rounded">보통</span>
                                     </div>
                                     <p className="text-sm text-gray-500">문의 전환율을 높일 수 있습니다.</p>
                                 </div>
                             </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    </section>
  );
}
