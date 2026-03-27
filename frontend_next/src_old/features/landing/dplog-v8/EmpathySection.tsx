import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const empathyContent = [
  {
    text: "키가 또래보다\n작아요",
    desc: "성장판 검사와 체질 분석을 통해\n숨겨진 키를 찾아냅니다.",
    image: "https://images.unsplash.com/photo-1725596698141-15882898fc42?q=80&w=1000&auto=format&fit=crop", // Child measuring height
    color: "bg-[#FFF8E1]" // Soft Yellow
  },
  {
    text: "밥을 잘\n안 먹어요",
    desc: "소화기 기능을 강화하여\n스스로 밥을 찾게 합니다.",
    image: "https://images.unsplash.com/photo-1724492165135-0b2266124e69?q=80&w=1000&auto=format&fit=crop", // Child eating
    color: "bg-[#E3F2FD]" // Soft Blue
  },
  {
    text: "감기를\n달고 살아요",
    desc: "기초 면역력을 높여\n잔병치레 없는 아이로 키웁니다.",
    image: "https://images.unsplash.com/photo-1612476695576-049b1ce22b4f?q=80&w=1000&auto=format&fit=crop", // Winter clothes
    color: "bg-[#E8F5E9]" // Soft Green
  }
];

export default function EmpathySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section ref={containerRef} className="relative bg-white">
      {empathyContent.map((item, index) => (
        <StickyCard key={index} item={item} index={index} total={empathyContent.length} range={[index * 0.25, 1]} targetRef={containerRef} />
      ))}
    </section>
  );
}

const StickyCard = ({ item, index, total, range, targetRef }: any) => {
  return (
    <div className="h-screen sticky top-0 flex items-center justify-center overflow-hidden">
      <div 
        className={`relative w-full h-full flex flex-col md:flex-row items-center justify-center p-6 md:p-12 transition-colors duration-500 ${item.color}`}
      >
        <div className="max-w-[1240px] w-full grid md:grid-cols-2 gap-12 items-center">
            {/* Text Side */}
            <motion.div
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="order-2 md:order-1"
            >
                <div className="text-xl md:text-2xl font-bold text-brand-inuri-brown/50 mb-4">
                    0{index + 1}
                </div>
                <h2 className="text-5xl md:text-7xl font-bold text-brand-inuri-brown mb-8 leading-tight whitespace-pre-line tracking-tight">
                    {item.text}
                </h2>
                <p className="text-xl md:text-2xl text-gray-600 leading-relaxed whitespace-pre-line">
                    {item.desc}
                </p>
            </motion.div>

            {/* Image Side */}
            <motion.div 
               className="order-1 md:order-2 flex justify-center"
               initial={{ opacity: 0, scale: 0.8 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ duration: 0.8 }}
            >
                <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full overflow-hidden shadow-2xl border-8 border-white">
                    <img 
                        src={item.image} 
                        alt={item.text} 
                        className="w-full h-full object-cover"
                    />
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}
