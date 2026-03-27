'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ICONS_LIST } from '../../constants';

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { 
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] as const }
  },
};

export const AgentFirst: React.FC = () => {
  return (
    <section className="py-28 md:py-36 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-16 md:mb-20 px-4">
        <motion.h2
          className="text-3xl md:text-5xl font-bold text-gray-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          D-PLOG is <span className="text-blue-600">Action-First</span>
        </motion.h2>
        <motion.p
          className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto [text-wrap:balance]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          단순한 조회(Dashboard)에서 벗어나 실질적인 산출물(Artifacts)을 제공합니다.
          <br />
          플랫폼 알고리즘과 고비용 대행사에 의존하지 않는, 데이터 주권과 자생력을 키우세요.
        </motion.p>
      </div>

      {/* Icon Grid */}
      <motion.div 
        className="flex flex-wrap justify-center gap-5 md:gap-6 max-w-4xl mx-auto px-6"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
      >
        {ICONS_LIST.map((iconItem, idx) => (
          <motion.div
            key={idx}
            variants={item}
            className="overflow-visible"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                repeat: Infinity,
                duration: 3 + (idx % 10) * 0.5,
                delay: (idx % 8) * 0.3,
                ease: "easeInOut",
              }}
              whileHover={{ y: -6, scale: 1.08, boxShadow: "0 12px 24px rgba(0,0,0,0.1)" }}
              className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center cursor-default"
            >
              <iconItem.Icon className="w-7 h-7 md:w-8 md:h-8 text-gray-700" strokeWidth={1.5} />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
