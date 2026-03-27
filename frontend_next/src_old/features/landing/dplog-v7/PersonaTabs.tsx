import React, { useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { FileWarning, TrendingDown, CheckSquare, Search, ArrowRight } from "lucide-react";

type Persona = "founder" | "owner";

export default function PersonaTabs() {
  const [activeTab, setActiveTab] = useState<Persona>("founder");

  const tabs = [
    { id: "founder", label: "예비 창업자" },
    { id: "owner", label: "운영 중인 사장님" },
  ];

  return (
    <section className="py-24 bg-brand-primary relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"></div>
      
      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
        >
           <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight text-text-primary font-display">
             지금 어떤 단계에 계신가요?
           </h2>
           <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
             창업 준비부터 매장 운영까지, 사장님의 상황에 딱 맞는 <br/>
             <span className="text-text-primary font-bold">맞춤형 성장 전략</span>을 제안합니다.
           </p>
        </motion.div>

        {/* Custom Tab Switcher */}
        <div className="flex justify-center mb-16">
            <LayoutGroup>
                <div className="p-1.5 bg-white/5 border border-white/10 rounded-full inline-flex relative shadow-inner backdrop-blur-md">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Persona)}
                            className={`relative px-8 py-3 rounded-full text-base font-bold transition-colors duration-300 z-10 ${
                                activeTab === tab.id ? "text-brand-primary" : "text-text-secondary hover:text-text-primary"
                            }`}
                        >
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-white rounded-full shadow-lg"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </LayoutGroup>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
                {activeTab === "founder" ? (
                    <motion.div
                        key="founder"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                    >
                         <div className="space-y-8 order-2 md:order-1">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-accent/10 text-brand-accent border border-brand-accent/20 text-sm font-semibold mb-2"
                            >
                                <FileWarning size={16} /> 오픈 전 체크리스트
                            </motion.div>
                            
                            <div className="space-y-4">
                                <h3 className="text-4xl font-bold text-text-primary leading-[1.15] tracking-tight font-display">
                                    "오픈만 하면 손님이 올까요?"<br/>
                                    <span className="text-text-secondary">준비 없는 창업은 도박입니다.</span>
                                </h3>
                                <p className="text-text-secondary text-lg leading-relaxed">
                                    우리 동네에서 가장 경쟁이 치열한 키워드는 무엇일까요? <br/>
                                    <strong>상권 분석부터 경쟁사 벤치마킹까지</strong>,<br/>
                                    오픈 전부터 이기는 전략을 세팅해 드립니다.
                                </p>
                            </div>

                            <ul className="space-y-4 pt-2">
                                <li className="flex items-center gap-4 text-text-primary font-medium group cursor-pointer hover:bg-white/5 hover:shadow-sm p-3 rounded-xl transition-all border border-transparent hover:border-white/10">
                                    <div className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary group-hover:bg-brand-secondary group-hover:text-white transition-colors">
                                        <Search size={20} />
                                    </div>
                                    <span className="text-lg">경쟁 업체 상위노출 키워드 분석</span>
                                    <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-brand-secondary" size={18} />
                                </li>
                                <li className="flex items-center gap-4 text-text-primary font-medium group cursor-pointer hover:bg-white/5 hover:shadow-sm p-3 rounded-xl transition-all border border-transparent hover:border-white/10">
                                    <div className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary group-hover:bg-brand-secondary group-hover:text-white transition-colors">
                                        <TrendingDown size={20} className="rotate-180" />
                                    </div>
                                    <span className="text-lg">우리 동네 예상 트래픽 확인</span>
                                     <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-brand-secondary" size={18} />
                                </li>
                            </ul>
                        </div>
                        
                        <div className="order-1 md:order-2 bg-surface-base rounded-[40px] p-8 hover:shadow-2xl hover:shadow-brand-accent/10 transition-all duration-500 border border-white/10 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-accent/10 transition-colors"></div>
                             
                             <div className="absolute top-6 right-6 bg-gradient-to-r from-brand-accent to-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-brand-accent/20">BETA FEATURE</div>
                             
                             {/* Mock Visual */}
                             <div className="space-y-5 relative z-10 pt-4">
                                 {[
                                     { k: "강남역 맛집", s: "매우 치열", c: "bg-red-500/10 text-red-400 border-red-500/20" },
                                     { k: "강남역 브런치", s: "진입 추천", c: "bg-green-500/10 text-green-400 border-green-500/20" },
                                     { k: "강남역 데이트", s: "경쟁 보통", c: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" }
                                 ].map((item, i) => (
                                     <div key={i} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 group-hover:border-white/10 transition-all duration-300">
                                         <div className="flex items-center gap-3">
                                             <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                                             <span className="text-base font-bold text-text-primary">{item.k}</span>
                                         </div>
                                         <span className={`text-xs px-3 py-1.5 rounded-lg font-bold border ${item.c}`}>{item.s}</span>
                                     </div>
                                 ))}
                                 
                                 {/* Decorative Graph */}
                                 <div className="mt-8 pt-6 border-t border-white/10">
                                     <div className="flex justify-between items-end h-24 gap-2">
                                         {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                             <div key={i} className="flex-1 bg-white/5 rounded-lg overflow-hidden relative">
                                                 <div className="absolute bottom-0 w-full bg-brand-accent opacity-20 group-hover:opacity-100 transition-opacity duration-700" style={{ height: `${h}%` }}></div>
                                             </div>
                                         ))}
                                     </div>
                                      <div className="text-center mt-3 text-xs text-text-secondary font-medium">지난 7일간 검색량 추이</div>
                                 </div>
                             </div>
                        </div>
                    </motion.div>
                ) : (
                     <motion.div
                        key="owner"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                    >
                         <div className="space-y-8 order-2 md:order-1">
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-secondary/10 text-brand-secondary border border-brand-secondary/20 text-sm font-semibold mb-2"
                            >
                                <TrendingDown size={16} /> 매출 하락 긴급 진단
                            </motion.div>

                            <div className="space-y-4">
                                <h3 className="text-4xl font-bold text-text-primary leading-[1.15] tracking-tight font-display">
                                    "갑자기 매출이 줄었나요?"<br/>
                                    <span className="text-text-secondary">순위 하락이 원인일 수 있습니다.</span>
                                </h3>
                                <p className="text-text-secondary text-lg leading-relaxed">
                                    매일 변동되는 플레이스 순위를 실시간으로 추적하고,<br/>
                                    <strong>떨어진 원인을 AI가 정밀 분석</strong>해 즉각적인 대응책을 드립니다.<br/>
                                    리뷰 관리부터 사진 최적화까지 한 번에 해결하세요.
                                </p>
                            </div>
                            
                             <ul className="space-y-4 pt-2">
                                <li className="flex items-center gap-4 text-text-primary font-medium group cursor-pointer hover:bg-white/5 hover:shadow-sm p-3 rounded-xl transition-all border border-transparent hover:border-white/10">
                                    <div className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary group-hover:bg-brand-secondary group-hover:text-white transition-colors">
                                        <Search size={20} />
                                    </div>
                                    <span className="text-lg">실시간 내 가게 순위 진단</span>
                                    <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-brand-secondary" size={18} />
                                </li>
                                <li className="flex items-center gap-4 text-text-primary font-medium group cursor-pointer hover:bg-white/5 hover:shadow-sm p-3 rounded-xl transition-all border border-transparent hover:border-white/10">
                                    <div className="w-10 h-10 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary group-hover:bg-brand-secondary group-hover:text-white transition-colors">
                                        <TrendingDown size={20} />
                                    </div>
                                    <span className="text-lg">경쟁사 순위 변동 추적</span>
                                    <ArrowRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-brand-secondary" size={18} />
                                </li>
                            </ul>
                        </div>
                         <div className="order-1 md:order-2 bg-surface-base rounded-[40px] p-8 border border-white/10 hover:shadow-2xl hover:shadow-brand-secondary/10 transition-all duration-500 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-brand-secondary/10 transition-colors"></div>
                              
                              {/* Mock Visual */}
                             <div className="space-y-6 relative z-10 pt-4">
                                 <div className="flex items-center gap-4">
                                     <div className="w-14 h-14 rounded-2xl bg-brand-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-secondary/30">1</div>
                                     <div className="flex-1 bg-white/5 p-5 rounded-2xl shadow-sm border border-white/10 group-hover:border-brand-secondary/30 transition-colors">
                                         <div className="flex justify-between mb-2">
                                             <span className="font-bold text-text-primary">내 가게</span>
                                             <span className="text-red-400 font-bold text-sm bg-red-500/10 px-2 py-0.5 rounded">▼ 3위 하락</span>
                                         </div>
                                         <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                             <div className="h-full w-[40%] bg-brand-secondary rounded-full"></div>
                                         </div>
                                     </div>
                                 </div>
                                  <div className="flex items-center gap-4 opacity-60">
                                     <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-text-secondary font-bold text-xl">2</div>
                                     <div className="flex-1 bg-white/5 p-5 rounded-2xl shadow-sm border border-white/10">
                                         <div className="flex justify-between mb-2">
                                             <span className="font-bold text-text-primary">경쟁사 A</span>
                                             <span className="text-text-secondary font-bold text-sm">- 변동 없음</span>
                                         </div>
                                         <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                                             <div className="h-full w-[60%] bg-white/30 rounded-full"></div>
                                         </div>
                                     </div>
                                 </div>
                
                                 {/* Alerts */}
                                 <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3 mt-4">
                                     <div className="w-5 h-5 bg-red-500/20 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                                         <div className="w-2 h-2 bg-red-500 rounded-full animate-blink"></div>
                                     </div>
                                     <div>
                                         <div className="text-sm font-bold text-red-400">순위 하락 감지</div>
                                         <div className="text-xs text-red-300 mt-1">경쟁사가 최근 리뷰 이벤트를 시작했습니다. 대응이 필요합니다.</div>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
