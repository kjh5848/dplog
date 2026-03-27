import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Map, SearchX, AlertOctagon } from "lucide-react";
import NoiseOverlay from "./NoiseOverlay";

export default function EarlyStageProblemSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // --- Animation Ranges ---
  // 0.0 - 0.3: Text Zoom In (1 -> 1.2) + Typing Effect (Handled by component)
  // 0.3 - 0.4: Text Zoom Out & Fix to Top (1.2 -> 0.8)
  // 0.4 - 0.8: Cards Fly In
  // 0.8 - 1.0: Static Buffer (Reading time)
  
  const textScale = useTransform(scrollYProgress, [0, 0.3, 0.4], [1, 1.2, 0.8]);
  const textY = useTransform(scrollYProgress, [0.3, 0.4], ["30vh", "10vh"]); // Moves to top
  // Removed exit opacity to keep text visible during buffer time
  
  // Cards Entrance
  const card1Y = useTransform(scrollYProgress, [0.4, 0.6], [500, 0]);
  const card1Opacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);
  
  const card2Y = useTransform(scrollYProgress, [0.5, 0.7], [500, 0]);
  const card2Opacity = useTransform(scrollYProgress, [0.5, 0.6], [0, 1]);
  
  // Finish slightly earlier to ensure full visibility buffer
  const card3Y = useTransform(scrollYProgress, [0.6, 0.75], [500, 0]);
  const card3Opacity = useTransform(scrollYProgress, [0.6, 0.7], [0, 1]);

  // Typing Effect Trigger (Start immediately or when in view? In view is better)
  // Since we are sticky, "start start" means we are looking at it.
  
  return (
    <section ref={containerRef} className="relative w-full h-[300vh] bg-[#151515] text-white">
        <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center">
            
            {/* Foggy Background */}
            <motion.div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#2a2a2a_0%,#000000_100%)]"></div>
                <NoiseOverlay opacity={0.6} />
            </motion.div>

            {/* --- Main Text Sequence --- */}
            <motion.div
                style={{ scale: textScale, y: textY }}
                className="relative z-10 text-center mt-20 md:mt-0"
            >
                <div className="inline-block px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-500 text-sm font-bold tracking-wider mb-8">
                    ⚠️ FOUNDER&apos;S RISK
                </div>
                
                <h2 className="text-4xl md:text-7xl font-bold mb-8 leading-tight min-h-[160px] serif">
                   <TypewriterText text={`감에 의존한 창업은
도박과 같습니다`} />
                </h2>
                
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="text-xl md:text-2xl text-zinc-300 max-w-2xl mx-auto leading-relaxed break-keep"
                >
                    상권은 어디가 좋은지, 경쟁사는 뭘 잘하는지... <br/>
                    정확한 데이터 없이 <strong className="text-white">&quot;잘 되겠지&quot;</strong>라는 막연한 기대로 시작하시겠습니까?
                </motion.p>
            </motion.div>

            {/* --- Flying Risk Cards --- */}
            <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <div className="relative w-full max-w-6xl h-full">
                    
                    {/* Card 1: Map/Location - Top Left */}
                    <motion.div 
                        style={{ y: card1Y, opacity: card1Opacity, rotate: -5 }}
                        className="absolute left-[5%] md:left-[15%] top-[50%] p-8 bg-[#1a1a1a] border border-zinc-700/50 rounded-2xl shadow-2xl w-[280px] md:w-[320px] backdrop-blur-md"
                    >
                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 text-zinc-300">
                            <Map size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 serif">상권 분석의 어려움</h3>
                        <p className="text-zinc-400 leading-relaxed">&quot;유동인구가 많다고 다 장사가 잘 될까요? 내 업종에 맞는 상권인지 확신이 없습니다.&quot;</p>
                    </motion.div>

                    {/* Card 2: Competitor - Top Right */}
                    <motion.div 
                        style={{ y: card2Y, opacity: card2Opacity, rotate: 5 }}
                        className="absolute right-[5%] md:right-[15%] top-[55%] p-8 bg-[#1a1a1a] border border-zinc-700/50 rounded-2xl shadow-2xl w-[280px] md:w-[320px] backdrop-blur-md"
                    >
                        <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4 text-zinc-300">
                            <SearchX size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2 serif">깜깜이 경쟁</h3>
                        <p className="text-zinc-400 leading-relaxed">&quot;경쟁사가 하루에 얼마를 파는지, 어떤 메뉴가 잘 나가는지 전혀 알 수가 없습니다.&quot;</p>
                    </motion.div>

                    {/* Card 3: Priority - Center Bottom */}
                    <motion.div 
                        style={{ y: card3Y, opacity: card3Opacity, rotate: 0 }}
                        className="absolute left-[50%] -translate-x-1/2 top-[65%] p-8 bg-[#2a1212] border border-red-500/30 rounded-2xl shadow-2xl w-[300px] md:w-[420px] backdrop-blur-md"
                    >
                        <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4 text-red-500">
                            <AlertOctagon size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-red-500 mb-2 serif">폐업 확률 87%</h3>
                        <p className="text-red-100/80 leading-relaxed text-lg">준비되지 않은 창업은<br/>결국 폐업으로 이어집니다.</p>
                    </motion.div>

                </div>
            </div>
        </div>
    </section>
  );
}

// Robust Typewriter Component
const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    
    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= text.length) {
                setDisplayedText(text.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 80); // Slightly faster for long text
        return () => clearInterval(interval);
    }, [text]);

    return <span className="whitespace-pre-wrap">{displayedText}<span className="animate-pulse text-yellow-500 ml-1">|</span></span>;
}
