import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { TrendingUp, Search, CheckSquare, Zap, BarChart3, ArrowUpRight } from "lucide-react";

const features = [
  {
    id: 1,
    title: "실시간 순위 추적",
    desc: "매일 아침 9시, 내 가게 순위 알림",
    icon: <TrendingUp className="text-brand-secondary" size={24} />,
    color: "from-brand-secondary/20 to-brand-secondary/5",
    border: "group-hover:border-brand-secondary/50",
    content: (
        <div className="relative h-full flex flex-col justify-end pb-4 px-4">
             <div className="absolute top-4 right-4 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                 <ArrowUpRight size={12} /> 3위 상승
             </div>
             <div className="flex items-end gap-2 h-24 w-full">
                 {[40, 65, 50, 80, 60, 95].map((h, i) => (
                     <div key={i} className="flex-1 bg-white/10 rounded-t-sm relative overflow-hidden">
                         <div className="absolute bottom-0 w-full bg-brand-secondary" style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.5 }}></div>
                     </div>
                 ))}
             </div>
             <div className="flex justify-between mt-3 text-xs text-text-secondary font-mono">
                 <span>MON</span>
                 <span>TODAY</span>
             </div>
        </div>
    )
  },
  {
    id: 2,
    title: "AI 정밀 진단",
    desc: "10초 만에 플레이스 문제점 발견",
    icon: <Zap className="text-yellow-400" size={24} />,
    color: "from-yellow-500/20 to-yellow-600/5",
    border: "group-hover:border-yellow-500/50",
    content: (
        <div className="relative h-full flex flex-col items-center justify-center">
            <div className="relative w-28 h-28">
                 <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="50" stroke="#333" strokeWidth="8" fill="transparent" />
                    <circle cx="56" cy="56" r="50" stroke="#FACC15" strokeWidth="8" fill="transparent" strokeDasharray="314" strokeDashoffset="80" strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-text-primary">
                    <span className="text-3xl font-bold">78</span>
                    <span className="text-[10px] text-text-secondary">점수</span>
                </div>
            </div>
            <div className="mt-4 flex gap-2">
                 <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded">사진 부족</span>
                 <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded">키워드 좋음</span>
            </div>
        </div>
    )
  },
  {
    id: 3,
    title: "경쟁사 갭 분석",
    desc: "1등 가게와 내 가게 비교 분석",
    icon: <BarChart3 className="text-purple-400" size={24} />,
    color: "from-purple-500/20 to-purple-600/5",
    border: "group-hover:border-purple-500/50",
    content: (
        <div className="relative h-full pt-6 px-4">
             <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-gray-300">Target</div>
                 <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full w-[90%] bg-purple-500"></div>
                 </div>
                 <span className="text-xs text-purple-400 font-bold">98점</span>
             </div>
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-gray-300">Me</div>
                 <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full w-[60%] bg-gray-500"></div>
                 </div>
                 <span className="text-xs text-text-secondary font-bold">65점</span>
             </div>
             <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-xs text-purple-300">
                 💡 경쟁사 대비 리뷰 키워드가 <b>5개</b> 부족합니다.
             </div>
        </div>
    )
  },
  {
    id: 4,
    title: "실행 가이드",
    desc: "오늘 당장 해야 할 마케팅 처방",
    icon: <CheckSquare className="text-green-400" size={24} />,
    color: "from-green-500/20 to-green-600/5",
    border: "group-hover:border-green-500/50",
    content: (
        <div className="relative h-full px-4 pt-4 flex flex-col gap-3">
             <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                 <div className="w-5 h-5 bg-green-500/20 rounded flex items-center justify-center text-green-500">✓</div>
                 <span className="text-xs text-text-secondary line-through decoration-gray-500">영수증 리뷰 답글 달기</span>
             </div>
             <div className="flex items-center gap-3 bg-white/10 p-3 rounded-lg border border-white/20 shadow-lg shadow-green-900/10">
                 <div className="w-5 h-5 border border-white/30 rounded"></div>
                 <span className="text-sm text-text-primary font-bold">대표 사진 교체하기</span>
                 <span className="ml-auto text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded">긴급</span>
             </div>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5 opacity-50">
                 <div className="w-5 h-5 border border-white/30 rounded"></div>
                 <span className="text-xs text-text-secondary">플레이스 소식 업데이트</span>
             </div>
        </div>
    )
  },
   {
    id: 5,
    title: "키워드 발굴",
    desc: "우리 동네 '진짜' 검색어 찾기",
    icon: <Search className="text-brand-accent" size={24} />,
    color: "from-brand-accent/20 to-brand-accent/5",
    border: "group-hover:border-brand-accent/50",
    content: (
        <div className="relative h-full p-4 flex flex-wrap content-start gap-2">
            {["강남역 맛집", "데이트", "가성비", "회식장소", "숨은맛집"].map((k, i) => (
                <span key={i} className={`text-xs px-2.5 py-1.5 rounded-md border ${i === 0 ? 'bg-brand-accent text-white border-brand-accent font-bold' : 'bg-white/5 text-text-secondary border-white/10'}`}>
                    #{k}
                </span>
            ))}
             <div className="w-full mt-4 h-20 bg-gradient-to-t from-brand-accent/10 to-transparent rounded-lg flex items-end justify-center pb-2">
                 <span className="text-[10px] text-brand-accent">🔥 검색량 급상승 중</span>
             </div>
        </div>
    )
  },
];

// Infinite loop by duplicating the array
const duplicatedFeatures = [...features, ...features];

export default function FeatureSlideshow() {
  const controls = useAnimation();
  
  // Auto-scroll animation
  useEffect(() => {
    controls.start({
      x: "-50%",
      transition: {
        duration: 30,
        ease: "linear",
        repeat: Infinity,
      },
    });
  }, [controls]);

  return (
    <div className="w-full overflow-hidden py-10 fade-mask-x relative z-20">
        <style jsx>{`
            .fade-mask-x {
                mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
            }
        `}</style>
        
      <motion.div
        className="flex gap-6 w-max"
        animate={controls}
        onHoverStart={() => controls.stop()}
        onHoverEnd={() => controls.start({ x: "-50%", transition: { duration: 30, ease: "linear", repeat: Infinity } })}
      >
        {duplicatedFeatures.map((feature, index) => (
          <div
            key={`${feature.id}-${index}`}
            className={`
                group
                w-[280px] h-[320px] 
                bg-surface-base 
                backdrop-blur-md 
                border-t border-l border-white/10 border-b border-r border-black/50
                rounded-3xl 
                flex flex-col 
                hover:scale-105 transition-transform duration-300
                overflow-hidden
                shadow-2xl
                ${feature.border}
            `}
          >
              {/* Card Header */}
            <div className={`p-6 bg-gradient-to-b ${feature.color}`}>
                <div className="bg-black/30 w-10 h-10 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm shadow-inner border border-white/5">
                    {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-text-primary mb-1 font-display">{feature.title}</h4>
                <p className="text-xs text-text-secondary font-medium">{feature.desc}</p>
            </div>

            {/* Card Content Area (Mockup) */}
            <div className="flex-1 bg-surface-base p-2 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-surface-base to-brand-primary"></div>
                <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:16px_16px] opacity-50"></div>
                <div className="relative h-full w-full rounded-xl border border-white/5 overflow-hidden">
                    {feature.content}
                </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
