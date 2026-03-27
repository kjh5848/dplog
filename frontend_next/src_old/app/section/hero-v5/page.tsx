"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { TiltCard, InsetGrid } from "@/shared/ui/interactive-grid";
import { TextEffect } from "@/shared/ui/text-effect";
import { cn } from "@/shared/lib/utils";

// --- Beams Background Logic ---
interface Beam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    hue: number;
    pulse: number;
    pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle: angle,
        speed: 0.6 + Math.random() * 1.2,
        opacity: 0.12 + Math.random() * 0.16,
        hue: 190 + Math.random() * 70,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.03,
    };
}

const opacityMap = {
    subtle: 0.7,
    medium: 0.85,
    strong: 1,
};

const BeamsCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<Beam[]>([]);
    const animationFrameRef = useRef<number>(0);
    const MINIMUM_BEAMS = 20;
    const intensity = "strong";

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const updateCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);

            const totalBeams = MINIMUM_BEAMS * 1.5;
            beamsRef.current = Array.from({ length: totalBeams }, () =>
                createBeam(canvas.width, canvas.height)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        function resetBeam(beam: Beam, index: number, totalBeams: number) {
            if (!canvas) return beam;
            const column = index % 3;
            const spacing = canvas.width / 3;
            beam.y = canvas.height + 100;
            beam.x = column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
            beam.width = 100 + Math.random() * 100;
            beam.speed = 0.5 + Math.random() * 0.4;
            beam.hue = 190 + (index * 70) / totalBeams;
            beam.opacity = 0.2 + Math.random() * 0.1;
            return beam;
        }

        function drawBeam(ctx: CanvasRenderingContext2D, beam: Beam) {
            ctx.save();
            ctx.translate(beam.x, beam.y);
            ctx.rotate((beam.angle * Math.PI) / 180);
            const pulsingOpacity = beam.opacity * (0.8 + Math.sin(beam.pulse) * 0.2) * opacityMap[intensity];
            const gradient = ctx.createLinearGradient(0, 0, 0, beam.length);
            gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
            gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
            gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
            gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
            gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
            gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);
            ctx.fillStyle = gradient;
            ctx.fillRect(-beam.width / 2, 0, beam.width, beam.length);
            ctx.restore();
        }

        function animate() {
            if (!canvas || !ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.filter = "blur(35px)";
            const totalBeams = beamsRef.current.length;
            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;
                if (beam.y + beam.length < -100) {
                    resetBeam(beam, index, totalBeams);
                }
                drawBeam(ctx, beam);
            });
            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animate();
        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ filter: "blur(15px)" }}
        />
    );
};

// --- Page Component ---
const V5_CARDS = [
  {
    title: "Naesuni API",
    description: "국내 유일의 플레이스 실시간 순위 수집 엔진을 통해 정확한 노출 정보를 확보합니다.",
    className: "md:col-span-8 md:row-span-2 min-h-[400px]",
    image: "https://images.unsplash.com/photo-1761839257946-4616bcfafec7?q=80&w=1169&auto=format&fit=crop",
  },
  {
    title: "RAG Analysis",
    description: "최신 알고리즘 지식을 학습한 AI가 사장님의 매장을 위한 맞춤형 분석을 수행합니다.",
    className: "md:col-span-4 md:row-span-1 min-h-[190px]",
    image: "https://plus.unsplash.com/premium_photo-1661883237884-263e8de8869b?q=80&w=1189&auto=format&fit=crop",
  },
  {
    title: "10-Min Action",
    description: "더 이상 고민하지 마세요. 바로 실행할 수 있는 리스트만 정리해 드립니다.",
    className: "md:col-span-4 md:row-span-1 min-h-[190px]",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1170&auto=format&fit=crop",
  },
  {
    title: "Continuous Tracking",
    description: "노출은 끝이 아닌 시작입니다. 히스토리 관리를 통해 플레이스를 지속적으로 육성하세요.",
    className: "md:col-span-12 md:row-span-1 min-h-[220px]",
    image: "https://images.unsplash.com/photo-1652195960911-c9f55224bd89?q=80&w=687&auto=format&fit=crop",
  },
];

export default function HeroV5Page() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      {/* Integrated Beams Background for the entire page */}
      <div className="fixed inset-0 z-0">
        <BeamsCanvas />
        <motion.div
            className="absolute inset-0 bg-neutral-950/20"
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
            style={{ backdropFilter: "blur(40px)" }}
        />
      </div>

      <div className="relative z-10 pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto">
          {/* Top Section */}
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-12">
            <div className="max-w-3xl text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <h1 className="text-[10px] font-black tracking-[0.6em] text-white/40 uppercase mb-6 flex items-center gap-4">
                  <div className="flex gap-1">
                     <span className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
                     <span className="h-1 w-1 rounded-full bg-blue-500/60 animate-pulse delay-75" />
                     <span className="h-1 w-1 rounded-full bg-blue-500/30 animate-pulse delay-150" />
                  </div>
                  The Next Level Solution
                </h1>
                <div className="text-6xl md:text-9xl font-light tracking-[-0.06em] mb-10 text-white leading-none">
                  사장님의 플레이스, <br /> <span className="text-white/30 italic">지능형으로 변화합니다.</span>
                </div>
              </motion.div>
              
              <TextEffect per="word" preset="fade" className="text-xl md:text-2xl text-white/40 font-extralight leading-snug tracking-tight max-w-2xl">
                단순한 순위 조회를 넘어, AI가 제안하는 실행 전략을 만나보세요. D-PLOG는 사장님의 디지털 비즈니스 가치를 극대화합니다.
              </TextEffect>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
            >
              <button className="group relative overflow-hidden rounded-[1.5rem] bg-blue-600 px-12 py-6 text-sm font-bold text-white transition-all hover:bg-blue-500 active:scale-95 shadow-[0_20px_50px_rgba(37,99,235,0.3)]">
                무료 진단 시작하기
              </button>
              <button className="rounded-[1.5rem] border border-white/10 bg-white/5 px-12 py-6 text-sm font-bold backdrop-blur-3xl transition-all hover:bg-white/10">
                성공 사례 보기
              </button>
            </motion.div>
          </div>

          {/* Grid Section */}
          <InsetGrid>
            {V5_CARDS.map((card, idx) => (
              <TiltCard key={idx} index={idx} className={card.className}>
                <div className="relative h-full w-full overflow-hidden rounded-[3rem] p-12 flex flex-col justify-between group border border-white/10 bg-black/30 backdrop-blur-xl hover:bg-black/40 transition-all duration-500">
                  {/* Background Image with subtle animation */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src={card.image} 
                      alt={card.title} 
                      className="h-full w-full object-cover grayscale-[80%] brightness-[30%] group-hover:grayscale-0 group-hover:brightness-[50%] transition-all duration-1000 ease-in-out" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-transparent to-black/20" />
                  </div>

                  <div className="relative z-10">
                     <div className="text-[10px] font-mono text-blue-500/60 mb-8 tracking-widest uppercase">Feature 0{idx+1}</div>
                     <h3 className="text-3xl md:text-5xl font-light tracking-tight text-white mb-4">
                        {card.title}
                     </h3>
                     <div className="h-0.5 w-12 bg-blue-500/20 group-hover:w-20 transition-all duration-500" />
                  </div>

                  <div className="relative z-10 flex items-end justify-between">
                     <p className="text-white/30 text-sm font-light max-w-[300px] leading-relaxed">
                        {card.description}
                     </p>
                     <motion.div 
                       whileHover={{ scale: 1.1,  x: 5, y: -5 }}
                       className="h-16 w-16 rounded-2xl border border-white/10 flex items-center justify-center backdrop-blur-md bg-white/5 text-white/40 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-500 transition-all duration-500"
                     >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H7M17 7V17" />
                        </svg>
                     </motion.div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </InsetGrid>
        </div>

        <footer className="mt-52 py-20 text-center relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
           <p className="text-white/10 text-[10px] tracking-[1em] uppercase font-black">Future of Place Marketing</p>
        </footer>
      </div>
    </div>
  );
}
