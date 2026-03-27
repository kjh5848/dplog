import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Gamepad2, ArrowRight } from 'lucide-react';

const FeatureSection: React.FC = () => {
  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-white overflow-hidden">
      
      {/* Left: Gamification */}
      <motion.div 
        initial={{ x: "-100%" }}
        whileInView={{ x: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="w-full md:w-1/2 h-1/2 md:h-full bg-gray-50 flex flex-col justify-center p-12 md:p-24 border-b md:border-b-0 md:border-r border-gray-200 text-black"
      >
        <div className="text-gray-400 mb-4">
            <Gamepad2 size={48} className="text-black mb-6" />
        </div>
        <h3 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
          고객을 부르는<br/>도파민 시스템
        </h3>
        <p className="text-gray-600 mb-8 leading-relaxed">
          단순 할인은 이제 그만. <br/>
          게이미피케이션(Gamification)을 통해 매장을 방문하는 것 자체가 즐거운 경험이 됩니다.
          AR 보물찾기, 디지털 스탬프 등 트렌드에 민감한 MZ세대를 사로잡으세요.
        </p>
        <ul className="space-y-3 text-sm font-medium">
            <li className="flex items-center gap-2"><ArrowRight size={16}/> 재방문율 30% 이상 증가 기대</li>
            <li className="flex items-center gap-2"><ArrowRight size={16}/> 브랜드 충성도 강화</li>
        </ul>
      </motion.div>

      {/* Right: Legal Safety */}
      <motion.div 
        initial={{ x: "100%" }}
        whileInView={{ x: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="w-full md:w-1/2 h-1/2 md:h-full bg-black text-white flex flex-col justify-center p-12 md:p-24"
      >
        <div className="text-gray-400 mb-4">
            <ShieldCheck size={48} className="text-white mb-6" />
        </div>
        <h3 className="text-3xl md:text-4xl font-black mb-6 leading-tight">
          법률 리스크,<br/>AI가 사전에 차단
        </h3>
        <p className="text-gray-400 mb-8 leading-relaxed">
          마케팅 아이디어가 떠올라도 법적으로 문제가 없을지 걱정되시나요?
          경품법, 게임산업법 등 복잡한 규제를 AI가 실시간으로 검토하여
          사장님의 안전한 경영을 돕습니다.
        </p>
        <ul className="space-y-3 text-sm font-medium text-gray-300">
            <li className="flex items-center gap-2"><ArrowRight size={16}/> 경품 가액 적정성 자동 체크</li>
            <li className="flex items-center gap-2"><ArrowRight size={16}/> 이벤트 확률 정보 게시 자동화</li>
        </ul>
      </motion.div>

    </div>
  );
};

export default FeatureSection;