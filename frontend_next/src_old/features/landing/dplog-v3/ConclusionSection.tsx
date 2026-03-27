import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import NoiseOverlay from "./NoiseOverlay";

interface ConclusionSectionProps {
  onStart?: () => void;
}

const ConclusionSection: React.FC<ConclusionSectionProps> = ({ onStart }) => {
  const [email, setEmail] = useState("");

  return (
    <div className="landing-v2-conclusion h-screen w-full flex flex-col items-center justify-center bg-black text-white relative px-4 overflow-hidden">
      <NoiseOverlay opacity={0.2} />
      
      <motion.div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#333 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
        animate={{ opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
      ></motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-3xl"
      >
        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
          <Link className="inline-block hover:text-accent-soft transition-colors" href="/landing/dplog-alt">
            D-PLOG
          </Link>
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 font-light mb-12 leading-relaxed">
          사장님의 직관을{" "}
          <motion.span 
            className="text-white font-bold inline-block border-b-2 border-white"
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
          >
            확신
          </motion.span>으로
          바꿔드립니다.
          <br />
          지금 바로 경영의 새로운 운영체제(OS)를 경험해보세요.
        </p>

        <div className="landing-v2-cta bg-white/5 backdrop-blur-md p-2 rounded-full border border-white/20 flex flex-col md:flex-row max-w-lg mx-auto gap-2 md:gap-0 relative overflow-hidden group">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%]"
            animate={{ translateX: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          />
          <input
            type="email"
            placeholder="이메일을 입력해주세요"
            className="bg-transparent text-white placeholder-gray-400 px-6 py-3 w-full focus:outline-none text-sm text-center md:text-left z-10"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <motion.button 
            onClick={onStart} 
            className="btn btn-primary btn-sm whitespace-nowrap z-10"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            무료 진단 시작
          </motion.button>
        </div>

        <p className="mt-8 text-gray-500 text-xs">
          © 2025 D-PLOG. 모든 권리 보유. <br />
          본 서비스는 예비창업패키지 및 신사업창업사관학교 지원을 통해 개발되었습니다.
        </p>
      </motion.div>
    </div>
  );
};

export default ConclusionSection;
