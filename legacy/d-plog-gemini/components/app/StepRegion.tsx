import React from 'react';
import { motion } from 'framer-motion';

interface StepProps {
  onNext: () => void;
  onBack: () => void;
}

const regions = [
  { name: "Seoul", kr: "서울", icon: "location_city" },
  { name: "Busan", kr: "부산", icon: "sailing" },
  { name: "Daegu", kr: "대구", icon: "temple_buddhist" },
  { name: "Incheon", kr: "인천", icon: "flight_takeoff" },
  { name: "Gwangju", kr: "광주", icon: "palette" },
  { name: "Daejeon", kr: "대전", icon: "science" },
  { name: "Ulsan", kr: "울산", icon: "factory" },
  { name: "Sejong", kr: "세종", icon: "account_balance" },
  { name: "Gyeonggi", kr: "경기", icon: "subway" },
  { name: "Gangwon", kr: "강원", icon: "landscape" },
  { name: "Chungbuk", kr: "충북", icon: "nature" },
  { name: "Chungnam", kr: "충남", icon: "agriculture" },
  { name: "Jeonbuk", kr: "전북", icon: "rice_bowl" },
  { name: "Jeonnam", kr: "전남", icon: "water_drop" },
  { name: "Gyeongbuk", kr: "경북", icon: "history_edu" },
  { name: "Gyeongnam", kr: "경남", icon: "precision_manufacturing" },
  { name: "Jeju", kr: "제주", icon: "sunny" },
];

const StepRegion: React.FC<StepProps> = ({ onNext, onBack }) => {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="font-black tracking-tighter text-xl">D-PLOG</span>
        </div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-white transition-colors">Save & Exit</button>
      </header>

      <main className="flex-1 flex flex-col items-center p-6">
        <div className="w-full max-w-4xl mt-8">
          <div className="mb-8">
            <div className="flex justify-between items-end mb-2">
              <span className="text-gray-500 text-sm uppercase tracking-widest">Step 2 of 4</span>
              <span className="text-white text-sm font-bold">50%</span>
            </div>
            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/2"></div>
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold mb-2">어디서 시작하시나요?</h1>
            <p className="text-gray-400 text-sm md:text-base">
                사업자 등록 예정지 혹은 현재 사업장 소재지를 선택해주세요.<br className="hidden md:block" /> 
                해당 지역의 지원금 및 맞춤형 혜택을 찾아드립니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {regions.map((region, idx) => (
                <button 
                    key={idx}
                    className="group flex flex-col items-center justify-center p-4 rounded-xl border border-gray-800 bg-neutral-900 hover:bg-neutral-800 hover:border-gray-600 transition-all duration-200 aspect-square focus:ring-2 focus:ring-white focus:outline-none"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-800 flex items-center justify-center text-gray-400 group-hover:text-white group-hover:bg-neutral-700 transition-colors mb-3">
                        <span className="material-symbols-outlined text-2xl">{region.icon}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">{region.kr}</span>
                </button>
            ))}
          </div>

          <div className="mt-12 flex justify-end">
            <button onClick={onNext} className="bg-white text-black px-10 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                다음 단계 <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StepRegion;