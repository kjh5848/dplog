import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScanSearch, ShieldAlert, FileSearch } from 'lucide-react';

const scanningMessages = [
  "계약서 원문 텍스트 분석 중...",
  "특약사항 맹점 교차 검증 중...",
  "제소전 화해조서 악용 여부 스캔 중...",
  "원상복구 범위 부당 확장 여부 확인 중...",
  "권리금 회수 방해 조항 탐지 완료.",
  "최종 팩트폭행 리포트 생성 중..."
];

export function ContractScanningLoader() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // 4.5 seconds total, 6 messages -> ~750ms per message
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev < scanningMessages.length - 1 ? prev + 1 : prev));
    }, 750);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12 bg-neutral-950 font-sans">
      
      {/* Target Reticle / Scanner Graphic */}
      <div className="relative w-48 h-64 mb-12">
        {/* Fake Document Outline */}
        <div className="absolute inset-0 border-2 border-neutral-800 rounded-lg bg-neutral-900/50 flex flex-col p-4 gap-3 overflow-hidden">
          <div className="w-3/4 h-2 bg-neutral-800 rounded" />
          <div className="w-full h-2 bg-neutral-800 rounded" />
          <div className="w-full h-2 bg-neutral-800 rounded" />
          <div className="w-5/6 h-2 bg-neutral-800 rounded" />
          <div className="mt-4 w-1/2 h-2 bg-neutral-800 rounded" />
          <div className="w-full h-2 bg-neutral-800 rounded" />
          <div className="w-4/5 h-2 bg-neutral-800 rounded" />
        </div>

        {/* Laser Scanner */}
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-4 bg-gradient-to-b from-transparent via-red-500/50 to-transparent flex items-center justify-center z-10 box-content -mx-2"
        >
          <div className="w-full h-[2px] bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
        </motion.div>

        {/* Scanning Overlay Effect */}
        <motion.div 
          animate={{ opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-red-500/10 mix-blend-overlay"
        />

        {/* Floating Icons */}
        <motion.div
           animate={{ y: [0, -10, 0], opacity: [0, 1, 0] }}
           transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
           className="absolute -right-6 top-1/4 text-red-500"
        >
          <ShieldAlert size={24} />
        </motion.div>
        
        <motion.div
           animate={{ y: [0, 10, 0], opacity: [0, 1, 0] }}
           transition={{ duration: 2, repeat: Infinity, delay: 1 }}
           className="absolute -left-6 bottom-1/4 text-red-400"
        >
          <FileSearch size={24} />
        </motion.div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="inline-block text-red-500 mb-2"
        >
          <ScanSearch size={32} />
        </motion.div>

        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-red-600">
          AI 독소조항 스캐닝
        </h2>
        
        <div className="h-6">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-neutral-400 text-sm font-medium"
          >
            {scanningMessages[messageIndex]}
          </motion.p>
        </div>
      </div>
      
    </div>
  );
}
