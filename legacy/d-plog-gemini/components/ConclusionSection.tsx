import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ConclusionSectionProps {
  onStart?: () => void;
}

const ConclusionSection: React.FC<ConclusionSectionProps> = ({ onStart }) => {
  const [email, setEmail] = useState('');

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white relative px-4">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(#333 1px, transparent 1px)`,
            backgroundSize: '30px 30px'
        }}></div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="z-10 text-center max-w-3xl"
      >
        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">
          D-PLOG
        </h2>
        <p className="text-xl md:text-2xl text-gray-300 font-light mb-12 leading-relaxed">
          사장님의 직관을 <span className="text-white font-bold border-b-2 border-white">확신</span>으로 바꿔드립니다.<br/>
          지금 바로 경영의 새로운 운영체제(OS)를 경험해보세요.
        </p>

        <div className="bg-white/5 backdrop-blur-md p-2 rounded-full border border-white/20 flex flex-col md:flex-row max-w-lg mx-auto gap-2 md:gap-0">
            <input 
                type="email" 
                placeholder="이메일을 입력해주세요"
                className="bg-transparent text-white placeholder-gray-400 px-6 py-3 w-full focus:outline-none text-sm text-center md:text-left"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button 
              onClick={onStart}
              className="bg-white text-black font-bold px-8 py-3 rounded-full hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
                무료 진단 시작
            </button>
        </div>

        <p className="mt-8 text-gray-500 text-xs">
          © 2025 D-PLOG. All rights reserved. <br/>
          본 서비스는 예비창업패키지 및 신사업창업사관학교 지원을 통해 개발되었습니다.
        </p>
      </motion.div>
    </div>
  );
};

export default ConclusionSection;