import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown, ChevronUp, User, Store } from "lucide-react";
import NoiseOverlay from "./NoiseOverlay";

export default function TargetAudienceSection() {
  return (
    <div className="w-full bg-[#0b0f0c] text-white">
      <IntroSection />
      
      {/* 1. Early Founder Section - Expandable Card */}
      <ExpandableSection 
        imageSrc="https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070"
        title="예비 / 초기 창업자"
        desc='"첫 시작의 막막함, 데이터로 확신을 더해드립니다."'
      />

      {/* 2. Operator Section - Expandable Card */}
      <ExpandableSection 
        imageSrc="https://images.unsplash.com/photo-1556740758-90de374c12ad?q=80&w=2070"
        title="운영 중인 사장님"
        desc='"노력해도 제자리걸음, 원인을 찾아 돌파구를 열어드립니다."'
      />

      <SplitViewSection />
    </div>
  );
}

const IntroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const textOpacity = useTransform(scrollYProgress, [0.35, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.24], [28, 0]);
  const textLetterSpacing = useTransform(scrollYProgress, [0, 0.24], ["0.08em", "0.02em"]);

  return (
    <section ref={ref} className="relative w-full h-[100vh] bg-[#0b0f0c]">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-[#0b0f0c] to-[#0b0f0c] pointer-events-none"></div>
        <motion.div
          className="text-center w-full"
          style={{
            opacity: textOpacity,
            y: textY,
            letterSpacing: textLetterSpacing,
            willChange: "transform, opacity",
          }}
        >
          <h2 className="text-5xl md:text-7xl font-bold leading-none tracking-tighter serif">
            <TypewriterText text="D-PLOG!!" /> <br />
            누구를 위한 <span className="text-[#8fa18c]">서비스</span>인가요?
          </h2>
        </motion.div>
      </div>
    </section>
  );
};

// Animated Typewriter Component
const TypewriterText = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: 0.5 });

    useEffect(() => {
        if (!isInView) {
            setDisplayedText("");
            return;
        }

        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= text.length) {
                setDisplayedText(text.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 150); 
        return () => clearInterval(interval);
    }, [text, isInView]);

    return (
        <motion.span 
            ref={ref}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="inline-block origin-left"
        >
            {displayedText}
            <span className="animate-pulse text-[#8fa18c] ml-1">|</span>
        </motion.span>
    );
}


// Reusable Card-to-Fullscreen Section
interface ExpandableSectionProps {
    imageSrc: string;
    title: string;
    desc: string;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({ imageSrc, title, desc }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start end", "end start"], // Track entry to exit
    });

    // Animation Logic:
    // 0.1 (Enter) -> 0.4 (Center) -> 0.9 (Exit)
    
    // Width: Starts SMALLER (50%), expands to 100%
    const scaleWidth = useTransform(scrollYProgress, [0.1, 0.4, 0.6, 0.9], ["50%", "100%", "100%", "100%"]);
    
    // Height: Starts SMALLER (50vh), expands to 100vh
    const height = useTransform(scrollYProgress, [0.1, 0.4], ["50vh", "100vh"]);
    
    // Border Radius: Starts at 40px, goes to 0px
    const borderRadius = useTransform(scrollYProgress, [0.1, 0.4, 0.6, 0.9], ["40px", "0px", "0px", "0px"]);

    // Opacity for Scroll Flow - STAY VISIBLE at the end to prevent whitespace
    const containerOpacity = useTransform(scrollYProgress, [0, 0.1, 0.8, 1], [0, 1, 1, 1]);

    return (
        <section ref={containerRef} className="relative w-full h-[200vh] flex items-start justify-center">
            <div className="sticky top-0 w-full h-screen flex items-center justify-center overflow-hidden">
                <motion.div
                    style={{ 
                        width: scaleWidth,
                        height: height,
                        borderRadius: borderRadius,
                        opacity: containerOpacity
                    }}
                    className="relative overflow-hidden shadow-2xl"
                >
                    {/* Background Image - Clean (No Filters as requested) */}
                    <img
                        src={imageSrc}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt={title}
                    />
                    
                    {/* Noise Overlay Added */}
                    <NoiseOverlay opacity={0.2} />

                    {/* Subtle Gradient for Text Readability - Minimal at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Content - Centered */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center p-8">
                         {/* Icon Removed */}
                         <h3 className="text-4xl md:text-7xl font-bold text-white mb-6 serif drop-shadow-lg tracking-tight">
                             {title}
                         </h3>
                         <p className="text-lg md:text-2xl text-white/90 font-light max-w-2xl drop-shadow-md leading-relaxed">
                            {desc}
                         </p>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}

const SplitViewSection = () => {
    // ... (Keep existing SplitViewSection implementation)
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
      target: ref,
      offset: ["start start", "end start"],
    });
  
    const splitOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
    const splitY = useTransform(scrollYProgress, [0.1, 0.25], [40, 0]);
  
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const toggleAccordion = (id: string) => setOpenAccordion(openAccordion === id ? null : id);
  
    const earlyIssues = [
      {
        id: "start-1",
        title: "상권 분석이 너무 어려워요",
        content: "유동인구가 많다고 무조건 좋은 게 아닙니다. 내 아이템과 맞는 소비층이 있는지가 중요합니다.",
      },
      {
        id: "start-2",
        title: "경쟁사는 어떻게 하고 있을까요?",
        content: "경쟁사의 노출 키워드, 리뷰 키워드를 분석하여 벤치마킹 포인트를 찾아드립니다.",
      },
      {
        id: "start-3",
        title: "예산 배분이 감이에요",
        content: "임대료, 인테리어, 마케팅 비용을 어디에 먼저 써야 할지 기준이 필요합니다.",
      },
      {
        id: "start-4",
        title: "아이템 검증이 부족해요",
        content: "메뉴·가격·콘셉트가 시장과 맞는지 수요 데이터로 확인해야 합니다.",
      },
      {
        id: "start-5",
        title: "오픈 이후가 더 두려워요",
        content: "오픈 직후에 필요한 실행 리스트와 운영 루틴을 미리 준비해야 합니다.",
      },
    ];
  
    const operatorIssues = [
      {
        id: "op-1",
        title: "매출이 왜 떨어지는지 모르겠어요",
        content: "방문자 리뷰와 키워드 순위 변화를 추적해 급락 원인을 진단합니다.",
      },
      {
        id: "op-2",
        title: "광고비 효율이 너무 낮아요",
        content: "노출은 되지만 클릭이 없는지, 클릭은 되지만 방문이 없는지 단계별로 분석합니다.",
      },
      {
        id: "op-3",
        title: "리뷰 관리를 놓치고 있어요",
        content: "리뷰 답변 속도와 평점 변화를 감지해 매출 하락을 사전에 막습니다.",
      },
      {
        id: "op-4",
        title: "신메뉴 반응이 안 좋아요",
        content: "메뉴별 전환율과 재구매 데이터를 기반으로 개선 포인트를 찾습니다.",
      },
      {
        id: "op-5",
        title: "운영 루틴이 계속 흔들려요",
        content: "매일 체크해야 할 KPI를 자동으로 정리해 실행을 표준화합니다.",
      },
    ];
  
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
      <section ref={ref} className="relative w-full h-[160vh] bg-[#0b0f0c]">
        <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
          <motion.div
            className="w-full h-full flex flex-col md:flex-row items-stretch pointer-events-auto transform-gpu"
            style={{
              opacity: splitOpacity,
              y: splitY,
              willChange: "transform, opacity",
            }}
          >
            <div className="w-full md:w-1/2 h-full bg-black text-white px-6 md:px-16 py-10 md:py-16 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-white/10 rounded-xl text-white"><User size={32} /></div>
                <h3 className="text-3xl md:text-5xl font-bold tracking-tight serif">예비 · 초기 창업</h3>
              </div>
  
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                {earlyIssues.map((item) => (
                  <motion.div key={item.id} variants={itemVariants}>
                    <AccordionItem
                        theme="dark"
                        title={item.title}
                        isOpen={openAccordion === item.id}
                        onClick={() => toggleAccordion(item.id)}
                        content={item.content}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </div>
  
            <div className="w-full md:w-1/2 h-full bg-white text-black px-6 md:px-16 py-10 md:py-16 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-black/5 rounded-xl text-black"><Store size={32} /></div>
                <h3 className="text-3xl md:text-5xl font-bold tracking-tight serif">운영 중인 매장</h3>
              </div>
  
              <motion.div 
                className="space-y-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                {operatorIssues.map((item) => (
                    <motion.div key={item.id} variants={itemVariants}>
                      <AccordionItem
                        theme="light"
                        title={item.title}
                        isOpen={openAccordion === item.id}
                        onClick={() => toggleAccordion(item.id)}
                        content={item.content}
                      />
                    </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
    );
};

function AccordionItem({
  title,
  isOpen,
  onClick,
  content,
  theme = "dark",
}: {
  title: string;
  isOpen: boolean;
  onClick: () => void;
  content: string;
  theme?: "dark" | "light";
}) {
  const isDark = theme === "dark";
  const borderClass = isDark ? "border-white/15" : "border-black/10";
  const titleClass = isDark ? "text-white" : "text-black";
  const bodyClass = isDark ? "text-white/70" : "text-black/60";
  const iconOpenClass = isDark ? "text-white" : "text-black";
  const iconClosedClass = isDark ? "text-white/40" : "text-black/40";
  const hoverClass = isDark ? "hover:text-white" : "hover:text-black";

  return (
    <div className={`border-b ${borderClass} last:border-0 pb-5`}>
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between text-left py-2 transition-colors ${hoverClass}`}
      >
        <span className={`text-xl md:text-2xl font-semibold ${titleClass}`}>{title}</span>
        {isOpen ? (
          <ChevronUp size={22} className={`${iconOpenClass} shrink-0`} />
        ) : (
          <ChevronDown size={22} className={`${iconClosedClass} shrink-0`} />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className={`pt-3 text-base md:text-lg leading-relaxed ${bodyClass}`}>{content}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
