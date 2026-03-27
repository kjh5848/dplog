'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const FeatureGridSection = () => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-white/40 text-xs font-semibold tracking-widest uppercase mb-5">
            Target Persona
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white mb-5">누구에게 필요한가요?</h2>
          <p className="text-slate-500 dark:text-white/40 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
            D-PLOG는 다양한 외식업 관계자를 위한 올인원 진단 솔루션입니다.
          </p>
        </div>
        <motion.div 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <motion.div variants={item} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group">
            <span className="material-icons-round text-primary text-4xl mb-4 group-hover:scale-110 transition-transform">storefront</span>
            <h4 className="text-xl font-bold mb-2">1인 사장님</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">마케팅할 시간이 부족한 사장님을 위해, 가장 시급한 개선점만 콕 집어 알려드립니다.</p>
          </motion.div>
          <motion.div variants={item} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group">
            <span className="material-icons-round text-primary text-4xl mb-4 group-hover:scale-110 transition-transform">manage_accounts</span>
            <h4 className="text-xl font-bold mb-2">매장 매니저</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">사장님께 보고할 성과 리포트가 필요하신가요? 데이터 기반의 보고서를 만들어드려요.</p>
          </motion.div>
          <motion.div variants={item} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group">
            <span className="material-icons-round text-primary text-4xl mb-4 group-hover:scale-110 transition-transform">campaign</span>
            <h4 className="text-xl font-bold mb-2">마케팅 대행사</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">여러 클라이언트 매장의 순위를 한눈에 관리하고, 체계적인 관리 리포트를 제공하세요.</p>
          </motion.div>
          
          <motion.div variants={item} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group">
            <span className="material-icons-round text-primary text-4xl mb-4 group-hover:scale-110 transition-transform">psychology</span>
            <h4 className="text-xl font-bold mb-2">AI 진단</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">리뷰, 플레이스 정보, 키워드 경쟁력을 AI가 종합적으로 분석합니다.</p>
            <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-xl">
              <p className="text-xs text-blue-600 dark:text-blue-300 font-bold mb-2">AI Summary</p>
              <div className="h-2 w-full bg-blue-200 dark:bg-blue-900 rounded-full mb-1"></div>
              <div className="h-2 w-2/3 bg-blue-200 dark:bg-blue-900 rounded-full"></div>
            </div>
          </motion.div>
          
          <motion.div variants={item} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group">
            <span className="material-icons-round text-primary text-4xl mb-4 group-hover:scale-110 transition-transform">trending_up</span>
            <h4 className="text-xl font-bold mb-2">성과 추적</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">실행한 개선 조치가 실제 순위에 어떤 영향을 줬는지 히스토리를 확인하세요.</p>
          </motion.div>

          <motion.div variants={item} className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 hover:shadow-xl transition-all group flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-bold mb-2">지금 바로 시작하기 →</h4>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">내 가게의 잠재력을 깨워보세요.</p>
            </div>
            <div className="flex justify-center py-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-primary rounded-full blur-xl opacity-20"></div>
              <span className="material-icons-round text-primary text-6xl">insights</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
