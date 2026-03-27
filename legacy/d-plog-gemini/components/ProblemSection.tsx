import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Clock, Ban } from 'lucide-react';

const ProblemSection: React.FC = () => {
  const stats = [
    {
      icon: <TrendingDown size={32} />,
      value: "12%",
      label: "연평균 폐업률",
      desc: "경기 회복 지연 시 15% 돌파 예상",
      delay: 0.2
    },
    {
      icon: <Ban size={32} />,
      value: "43.6%",
      label: "3년 내 폐업 고려",
      desc: "초기 창업자의 심각한 경영난",
      delay: 0.4
    },
    {
      icon: <Clock size={32} />,
      value: "6.5년",
      label: "평균 영업 기간",
      desc: "안정화 단계 진입의 어려움",
      delay: 0.6
    }
  ];

  return (
    <div className="h-screen w-full flex items-center justify-center bg-white text-black relative px-4 md:px-20">
      <div className="max-w-6xl w-full">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16 border-l-4 border-black pl-6"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-4">CRISIS</h2>
          <p className="text-xl md:text-2xl text-gray-600 font-light">
            사장님, 혹시 '데스밸리(Death Valley)'에 서 계신가요?
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: stat.delay }}
              className="bg-gray-50 p-8 border border-gray-200 hover:border-black transition-colors duration-300 group"
            >
              <div className="text-gray-400 group-hover:text-black transition-colors duration-300 mb-6">
                {stat.icon}
              </div>
              <h3 className="text-5xl font-black mb-2">{stat.value}</h3>
              <h4 className="text-lg font-bold mb-4">{stat.label}</h4>
              <p className="text-sm text-gray-500">{stat.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-16 text-center md:text-left text-gray-500 text-sm"
        >
          * 출처: 통계청 및 중소벤처기업연구원 (2024-2025 추정치)
        </motion.div>
      </div>
    </div>
  );
};

export default ProblemSection;