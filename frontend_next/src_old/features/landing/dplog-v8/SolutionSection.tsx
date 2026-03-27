import React from "react";
import { motion } from "framer-motion";
import { Search, FlaskConical, Stethoscope, Droplet, Sprout, Heart } from "lucide-react";

const solutions = [
  { icon: Search, title: "정확한 진단", desc: "아이의 체질과 증상을\n과학적으로 분석합니다." },
  { icon: FlaskConical, title: "체계적 연구", desc: "데이터 기반의 연구로\n치료 효과를 높입니다." },
  { icon: Stethoscope, title: "안전한 치료", desc: "아프지 않은 무통 침으로\n아이들이 편안해합니다." },
  { icon: Droplet, title: "청정 한약", desc: "GAP 인증을 받은\n친환경 약재만 사용합니다." },
  { icon: Sprout, title: "바른 성장", desc: "키 성장은 물론\n균형 잡힌 발달을 돕습니다." },
  { icon: Heart, title: "평생 주치의", desc: "성인이 될 때까지\n건강한 삶을 지켜줍니다." },
];

export default function SolutionSection() {
  return (
    <section className="py-32 bg-brand-inuri-beige">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="text-center mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-brand-inuri-brown mb-6"
          >
            dplog만의 약속
          </motion.h2>
          <motion.p
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             transition={{ delay: 0.2 }}
             className="text-lg text-gray-600"
          >
            부모의 마음으로 바르게 치료합니다.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -12 }}
              className="bg-white rounded-[2rem] p-10 shadow-sm hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-transparent hover:border-brand-inuri-yellow/30"
            >
              <div className="w-20 h-20 rounded-2xl bg-brand-inuri-beige flex items-center justify-center mb-8 group-hover:bg-brand-inuri-yellow transition-colors duration-300">
                <item.icon className="w-10 h-10 text-brand-inuri-brown group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-brand-inuri-brown mb-4">{item.title}</h3>
              <p className="text-gray-500 whitespace-pre-line leading-relaxed text-lg">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
