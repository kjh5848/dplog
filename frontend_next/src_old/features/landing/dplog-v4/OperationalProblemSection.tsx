import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { TrendingDown, DollarSign } from "lucide-react";
import NoiseOverlay from "./NoiseOverlay";

export default function OperationalProblemSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // --- Animation Strategy: Sequential Storytelling (Center Swap) ---
  
  // 1. Headline Animation (Moves UP and Fades OUT)
  // Range: 0.3 - 0.6
  const textScale = useTransform(scrollYProgress, [0.3, 0.6], [1, 0.8]);
  const textY = useTransform(scrollYProgress, [0.3, 0.6], ["0vh", "-50vh"]); // Move completely out
  const textOpacity = useTransform(scrollYProgress, [0.5, 0.6], [1, 0]);

  // 2. Cards Animation (Slide UP to Center and Fade IN)
  // Range: 0.4 - 0.7
  const cardY = useTransform(scrollYProgress, [0.4, 0.7], ["50vh", "0vh"]); // Enters to logical center
  const cardOpacity = useTransform(scrollYProgress, [0.4, 0.6], [0, 1]);

  return (
    <section ref={containerRef} className="relative w-full h-[400vh] bg-[#0b0f0c] text-white font-sans">
      <div className="sticky top-0 w-full h-screen overflow-hidden">
          
          {/* Background: System Alert Style */}
          <div className="absolute inset-0 z-0 pointer-events-none">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(50,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(50,20,20,0.5)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20"></div>
               {/* Scanning Line Animation */}
               <motion.div 
                className="absolute inset-x-0 h-[2px] bg-red-500/30 shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <NoiseOverlay opacity={0.5} />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0b0f0c_90%)]"></div>
          </div>

          {/* Background Visual (Infinite Wave Graph) */}
          <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none opacity-40">
                <div className="w-full h-full relative flex items-end justify-center overflow-hidden">
                    <svg 
                        className="absolute inset-x-0 bottom-0 w-[200%] h-full overflow-visible" 
                        viewBox="0 0 2000 1000" 
                        preserveAspectRatio="none"
                    >
                        <defs>
                            <linearGradient id="gradientWave" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {/* Wave Path: 4 Cycles (4000 units), Shift 2 Cycles (2000 units / 50%) for Loop */}
                        <motion.path
                            d="M0,500 Q250,300 500,500 T1000,500 T1500,500 T2000,500 T2500,500 T3000,500 T3500,500 T4000,500 V1000 H0 Z"
                            fill="url(#gradientWave)"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                         <motion.path
                             d="M0,500 Q250,300 500,500 T1000,500 T1500,500 T2000,500 T2500,500 T3000,500 T3500,500 T4000,500"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="4"
                            animate={{ x: ["0%", "-50%"] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        />
                    </svg>
                </div>
            </div>

          {/* Centered Content Container */}
          <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
            
            {/* Headline Section - Absolutely Centered */}
            <motion.div 
                style={{ scale: textScale, y: textY, opacity: textOpacity }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-20"
            >
                <div className="inline-flex items-center gap-3 px-3 py-1 rounded-sm bg-red-950/30 border border-red-900/50 mb-8">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-red-400 text-xs font-mono tracking-[0.2em] uppercase">SYSTEM ALERT: CRITICAL</span>
                </div>
                
                <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight serif drop-shadow-2xl">
                  이유 없는 <span className="text-red-500">매출하락</span>은<br/>
                  없습니다.
                </h2>
                <p className="text-xl md:text-3xl text-zinc-300 leading-relaxed break-keep max-w-3xl drop-shadow-lg font-light">
                    매출은 떨어지는데 원인은 모른 채,<br/>
                    효과 없는 <strong>광고비만 계속 태우고</strong> 계신가요?
                </p>
            </motion.div>

            {/* News Cards Section - Absolutely Centered (Starts Lower) */}
            <motion.div 
                style={{ y: cardY, opacity: cardOpacity }}
                className="absolute inset-0 flex flex-col items-center justify-center p-4 z-30 pointer-events-auto"
            >
                <div className="w-full max-w-3xl flex flex-col gap-6">
                    <AlertItem 
                        icon={TrendingDown}
                        title="매출 하락 원인 불명"
                        desc="방문자가 줄어드는데 이유를 찾을 수 없습니다."
                    />
                    <AlertItem 
                        icon={DollarSign}
                        title="광고비 낭비"
                        desc="효과는 없는데 비용만 계속 나가고 있습니다."
                    />
                </div>
            </motion.div>
          </div>
      </div>
    </section>
  );
}

function AlertItem({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
    return (
        <div className="w-full flex items-center gap-6 p-8 rounded-xl bg-black/80 border border-red-900/40 backdrop-blur-md shadow-2xl hover:border-red-500/50 transition-colors text-left group">
            <div className="p-4 bg-red-900/20 rounded-xl text-red-500 shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Icon size={32} />
            </div>
            <div className="flex-1">
                <h4 className="text-red-100 text-2xl font-bold mb-2 group-hover:text-red-400 transition-colors">{title}</h4>
                <p className="text-red-200/70 text-lg leading-relaxed">{desc}</p>
            </div>
            <div className="hidden md:block w-px h-12 bg-red-900/30 mx-4"></div>
            <div className="hidden md:block text-red-500/50 text-sm font-mono tracking-widest uppercase rotate-90 origin-center whitespace-nowrap">
                BREAKING NEWS
            </div>
        </div>
    )
}
