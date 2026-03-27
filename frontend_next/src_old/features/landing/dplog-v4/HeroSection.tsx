import React, { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { FileText, ClipboardCheck, Map, Share2, PenTool, LayoutTemplate } from "lucide-react";
import NoiseOverlay from "./NoiseOverlay";

interface HeroSectionProps {
  onStart: () => void;
}

const ThinkingDots = () => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCount((prev) => (prev + 1) % 4);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <span className="inline-block w-8 text-left">{".".repeat(count)}</span>;
};

const HeroSection: React.FC<HeroSectionProps> = ({ onStart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Mouse Interaction State
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        // Normalize mouse coordinates (-0.5 to 0.5)
        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Smooth springs for 3D effect
  const springConfig = { damping: 25, stiffness: 100 };
  const cardRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), springConfig);
  const cardRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), springConfig);
  
  // Parallax for Background Elements
  const blobX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-50, 50]), springConfig);
  const blobY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-50, 50]), springConfig);
  
  const gridX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-20, 20]), springConfig);
  const gridY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-20, 20]), springConfig);

  return (
    <div ref={containerRef} className="relative h-screen w-full bg-[#1a231c] text-white overflow-hidden font-sans perspective-1000">
      {/* Background Elements - Wavy Motion with 3D Parallax */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{
            x: gridX,
            y: gridY,
            rotateX: cardRotateX,
            rotateY: cardRotateY,
            scale: 1.1 // Avoid edges showing
        }}
      >
         {/* Base Gradient - Deep Green/Navy from V2 */}
         <div className="absolute inset-0 bg-gradient-to-b from-[#1a231c] via-[#0f1412] to-black"></div>

         {/* Moving Blobs - Adjusted for Deep Green/Navy Theme + Mouse Parallax */}
         <motion.div 
            style={{ x: blobX, y: blobY }}
            animate={{ 
                x: [-30, 30, -30],
                y: [0, -50, 0],
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.6, 0.4]
            }}
            transition={{
                duration: 12,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut"
            }}
            className="absolute bottom-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-[#3c4e3d] blur-[100px] rounded-full mix-blend-screen opacity-40"
         ></motion.div>

         <motion.div 
            style={{ x: useTransform(blobX, (v) => v * -1.5), y: useTransform(blobY, (v) => v * -1.5) }}
            animate={{ 
                x: [20, -20, 20],
                y: [0, 60, 0],
                scale: [1.1, 0.9, 1.1],
                opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
                duration: 18,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: 2
            }}
            className="absolute bottom-[-20%] right-[10%] w-[60vw] h-[60vw] bg-[#143d28] blur-[120px] rounded-full mix-blend-screen opacity-30"
         ></motion.div>

         {/* Accent Blob - Slightly lighter green for contrast */}
         <motion.div 
            style={{ x: useTransform(blobX, (v) => v * 0.5), y: useTransform(blobY, (v) => v * 0.5) }}
            animate={{ 
                x: [0, 40, 0],
                y: [0, 30, 0],
                scale: [0.8, 1, 0.8],
            }}
            transition={{
                duration: 15,
                repeat: Infinity,
                repeatType: "mirror",
                ease: "easeInOut",
                delay: 1
            }}
            className="absolute bottom-[-15%] left-[30%] w-[50vw] h-[50vw] bg-[#5e705e] blur-[150px] rounded-full mix-blend-screen opacity-20"
         ></motion.div>
         
         {/* Grid Pattern with 3D Transform */}
         <motion.div 
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
                backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px),
                                  linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
                maskImage: 'linear-gradient(to bottom, transparent, 10% black, 80% black, transparent)',
            }}
         ></motion.div>

         <NoiseOverlay opacity={0.4} />
      </motion.div>

      {/* Side Elements */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-50 hidden md:block">
          <div className="text-xs text-[#f1f4ee]/50 -rotate-90 origin-left translate-y-12">
             SCROLL <span className="text-[10px] align-middle">▼</span>
          </div>
      </div>
      <div className="absolute left-8 bottom-12 z-50 text-xs tracking-widest text-[#f1f4ee]/70 -rotate-90 origin-bottom-left translate-x-3">
          DATA DRIVEN STRATEGY
      </div>

      {/* Main Content with Parallax */}
      <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-end pb-32 px-8 md:px-20 max-w-[1920px] mx-auto pointer-events-none">
        {/* Left: Headline & Copy */}
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ x: useTransform(blobX, (v) => v * 0.2), y: useTransform(blobY, (v) => v * 0.2) }}
            className="flex-1 mb-8 md:mb-0"
        >
            <h1 className="text-5xl md:text-[6vw] font-bold leading-[1.1] tracking-tighter text-[#f1f4ee] mb-6 whitespace-pre-line break-keep serif">
                어이 김씨<br/>
                <span className="text-[#8fa18c]">오늘 얼마 벌었어<ThinkingDots /></span>
            </h1>
            <p className="text-lg md:text-xl text-[#f1f4ee]/60 font-light max-w-xl leading-relaxed break-keep">
                외식업 사장님을 위한 실시간 매출/노출 진단 솔루션.<br/>
                <strong>D-PLOG</strong>가 데이터 기반의 생존 전략을 제시합니다.
            </p>
        </motion.div>

        {/* Right: Feature Grid (Interactive) */}
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
            className="flex-1 w-full md:max-w-xl pointer-events-auto"
        >
            <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Top Row Items */}
                {[
                    { title: "사업계획서", icon: FileText },
                    { title: "내가게 진단", icon: ClipboardCheck },
                    { title: "상권 분석", icon: Map }
                ].map((item, i) => (
                    <motion.div 
                        key={i}
                        whileHover={{ y: -5, backgroundColor: "rgba(143, 161, 140, 0.1)" }}
                        className="aspect-square bg-[#0f1412]/60 backdrop-blur-md border border-[#8fa18c]/20 rounded-xl flex flex-col items-center justify-center p-4 text-center group cursor-pointer"
                    >
                        <div className="w-10 h-10 mb-3 rounded-full bg-[#8fa18c]/10 flex items-center justify-center group-hover:bg-[#8fa18c]/20 transition-colors">
                            <item.icon className="w-5 h-5 text-[#8fa18c] group-hover:text-[#f1f4ee] transition-colors" />
                        </div>
                        <span className="text-sm md:text-base font-medium text-[#f1f4ee]/80 group-hover:text-white transition-colors break-keep leading-tight">
                            {item.title}
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Bottom Row: Content Factory */}
            <div className="bg-[#0f1412]/60 backdrop-blur-md border border-[#8fa18c]/20 rounded-xl p-6">
                <h3 className="text-[#8fa18c] text-sm font-bold tracking-widest uppercase mb-4 border-b border-[#8fa18c]/10 pb-2">
                    콘텐츠 팩토리
                </h3>
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { title: "SNS 자동화", icon: Share2 },
                        { title: "AI 브랜딩", icon: PenTool },
                        { title: "AI 인테리어", icon: LayoutTemplate }
                    ].map((item, i) => (
                         <motion.div 
                            key={i}
                            whileHover={{ scale: 1.05 }}
                            className="flex flex-col items-center gap-2 cursor-pointer group"
                        >
                            <div className="w-12 h-12 rounded-lg border border-[#8fa18c]/30 flex items-center justify-center group-hover:border-[#8fa18c] transition-colors bg-[#1a231c]/50">
                                <item.icon className="w-6 h-6 text-[#8fa18c] group-hover:text-[#f1f4ee] transition-colors" />
                            </div>
                            <span className="text-xs md:text-sm text-[#f1f4ee]/70 group-hover:text-white text-center break-keep">
                                {item.title}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>

        <div className="absolute bottom-8 right-8 text-[#f1f4ee]/30 text-sm font-light">
            Powered by <span className="font-bold text-[#f1f4ee]/50">D-PLOG AI</span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
