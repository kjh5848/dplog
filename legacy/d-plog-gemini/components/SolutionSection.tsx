import React from 'react';
import { motion } from 'framer-motion';
import { Database, Search, ShoppingBag, BarChart3 } from 'lucide-react';

const SolutionSection: React.FC = () => {
  const solutions = [
    {
      title: "정부 지원 사업 매칭",
      desc: "사업자 등록증과 매출 데이터를 기반으로 당첨 확률이 높은 지원 사업을 AI가 큐레이션합니다.",
      icon: <Search className="w-8 h-8" />
    },
    {
      title: "트렌드 메뉴 & 원가 관리",
      desc: "SNS 인기 키워드와 도매 가격 데이터를 분석하여 수익성이 확보된 트렌디한 메뉴를 제안합니다.",
      icon: <ShoppingBag className="w-8 h-8" />
    },
    {
      title: "마케팅 자동화 & SEO",
      desc: "네이버 플레이스 상위 노출을 위한 최적의 키워드 생성 및 리뷰 답글 관리를 자동화합니다.",
      icon: <BarChart3 className="w-8 h-8" />
    }
  ];

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black text-white px-4 md:px-20 overflow-hidden">
      <div className="max-w-6xl w-full h-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-bold tracking-widest border border-white/20 px-4 py-2 rounded-full mb-6 inline-block">
            SOLUTION
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 leading-tight">
            RAG 기반 AI 경영 에이전트
          </h2>
          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            디플로그(D-PLOG)는 복잡한 데이터 속에서 사장님에게 꼭 필요한 정답만을 찾아냅니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent -z-0"></div>

          {solutions.map((sol, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: i * 0.2 }}
              className="z-10 bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 p-8 flex flex-col items-center text-center hover:bg-neutral-800 transition-colors duration-300 rounded-xl"
            >
              <div className="bg-white text-black p-4 rounded-full mb-6 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                {sol.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{sol.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed word-keep">
                {sol.desc}
              </p>
            </motion.div>
          ))}
        </div>
        
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 flex justify-center items-center gap-2 text-gray-500 text-xs uppercase tracking-widest"
        >
            <Database size={12} />
            Powered by Retrieval-Augmented Generation
        </motion.div>
      </div>
    </div>
  );
};

export default SolutionSection;