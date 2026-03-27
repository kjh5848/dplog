import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1721133942491-ad470bc63d8c?w=1000&q=80", // Child dreaming/looking up
    title: "우리 아이의 꿈이\n자라는 곳",
    subtitle: "아이의 몸과 마음을 함께 치유하는\ndplog 한의원입니다.",
    tag: "성장 클리닉"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1749015314315-1c193d1f67e3?w=1000&q=80", // Child running in field
    title: "건강한 성장을\n약속합니다",
    subtitle: "체계적인 검사와 맞춤형 치료로\n아이의 성장을 돕습니다.",
    tag: "면역력 강화"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1758691462164-100b5e356169?w=1000&q=80", // Doctor care
    title: "마음까지 보듬는\n따뜻한 진료",
    subtitle: "부모의 마음으로 아이를 대하며\n행복한 미래를 만듭니다.",
    tag: "심리 케어"
  }
];

interface HeroSectionProps {
  onStart: () => void;
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full px-4 pt-24 pb-12 bg-white md:bg-transparent">
      <div className="max-w-[1320px] mx-auto grid md:grid-cols-12 gap-6 h-auto md:h-[680px]">
        
        {/* Left: Text Content */}
        <div className="md:col-span-5 flex flex-col justify-center pl-4 md:pl-8 z-10 order-2 md:order-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-block px-4 py-2 rounded-full bg-brand-inuri-yellow/20 text-brand-inuri-brown font-bold text-sm mb-6">
                 {slides[currentSlide].tag}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-brand-inuri-brown mb-6 leading-[1.2] whitespace-pre-line tracking-tight">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg text-gray-600 mb-10 leading-relaxed whitespace-pre-line">
                {slides[currentSlide].subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-4">
            <button 
                onClick={onStart}
                className="group flex items-center gap-2 px-8 py-4 bg-brand-inuri-brown text-white font-bold rounded-full overflow-hidden transition-all hover:bg-brand-inuri-yellow hover:text-brand-inuri-brown shadow-lg hover:shadow-xl"
            >
                <span>진료 예약하기</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <div className="flex gap-2">
                {slides.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${currentSlide === idx ? 'bg-brand-inuri-brown' : 'bg-gray-300'}`} 
                    />
                ))}
            </div>
          </div>
        </div>

        {/* Right: Rounded Image Container */}
        <div className="md:col-span-7 relative h-[400px] md:h-full order-1 md:order-2">
           <motion.div 
             className="relative w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl"
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8 }}
           >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2 }}
                  className="absolute inset-0"
                >
                  <img 
                    src={slides[currentSlide].image} 
                    alt="Slide Image" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Floating Badge (Glassmorphism) */}
              <div className="absolute top-8 right-8 bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl shadow-lg flex items-center gap-3">
                 <div className="bg-brand-inuri-yellow p-2 rounded-full text-white">
                    <Star className="w-5 h-5 fill-current" />
                 </div>
                 <div>
                    <div className="text-xs text-gray-600 font-bold">고객 만족도</div>
                    <div className="text-xl font-bold text-brand-inuri-brown">4.9 / 5.0</div>
                 </div>
              </div>
           </motion.div>
           
           {/* Decorative Circle */}
           <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-brand-inuri-yellow/10 rounded-full blur-3xl -z-10" />
        </div>

      </div>
    </section>
  );
}
