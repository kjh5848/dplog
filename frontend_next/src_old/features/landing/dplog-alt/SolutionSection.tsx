import React, { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Database, TrendingUp, Zap } from "lucide-react";
import NoiseOverlay from "./NoiseOverlay";

interface SolutionItem {
  title: string;
  description: string;
  icon: React.ElementType;
  image: string;
}

const solutions: SolutionItem[] = [
  {
    title: "AI 매출 진단",
    description: "POS 데이터와 카드 매출을 연동하여 실시간으로 분석합니다. 하락 원인을 핀 포인트로 찾아냅니다.",
    icon: TrendingUp,
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "상권 & 경쟁사 분석",
    description: "우리 동네 1등 가게의 비결은? 유동인구부터 경쟁사 리뷰까지 싹 다 분석해 드립니다.",
    icon: Database,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
  },
  {
    title: "자동화 마케팅",
    description: "클릭 한 번으로 인스타그램, 블로그 홍보 끝. AI가 생성하고 발행까지 알아서 처리합니다.",
    icon: Zap,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
  }
];

const StackCard = ({ 
  item, 
  index, 
  scrollYProgress 
}: { 
  item: SolutionItem; 
  index: number; 
  scrollYProgress: MotionValue<number>;
}) => {
  // Determine the range for this card's animation
  const start = index * 0.2;
  const end = (index + 1) * 0.3;
  
  // 첫번째 카드는 항상 보이고, 이후 카드들이 순차적으로 덮음
  const x = useTransform(scrollYProgress, [start, end], ["100%", "0%"]);
  const xMotion = index === 0 ? "0%" : x;

  return (
    <motion.div
        className="absolute inset-0 w-full h-full will-change-transform"
        style={{
            zIndex: 30 + index,
            x: xMotion
        }}
    >
        <div className="relative w-full h-full flex items-center justify-center bg-zinc-900 border-l border-white/10 shadow-2xl">
                {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
                <NoiseOverlay opacity={0.3} />
            </div>

            {/* Content */}
            <div className="relative z-10 w-full px-4 md:px-24 grid grid-cols-1 md:grid-cols-12 gap-12 items-center h-full">
                <div className="md:col-span-8 lg:col-span-6 space-y-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <span className="text-blue-400 font-mono text-xl tracking-widest uppercase opacity-80">Solution 0{index + 1}</span>
                    </div>
                    
                    <h2 className="text-5xl md:text-8xl font-black text-white leading-tight tracking-tighter">
                        {item.title}
                    </h2>
                    <p className="text-2xl md:text-3xl text-gray-300 leading-relaxed font-light break-keep">
                        {item.description}
                    </p>
                </div>
            </div>
        </div>
    </motion.div>
  );
};

export default function SolutionSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} className="relative w-full bg-zinc-950">
      <div className="h-[400vh] relative"> 
        <div className="sticky top-0 h-screen overflow-hidden">
            {solutions.map((item, index) => (
                <StackCard 
                  key={index} 
                  item={item} 
                  index={index} 
                  scrollYProgress={scrollYProgress} 
                />
            ))}
        </div>
      </div>
    </section>
  );
}
