'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

/* Animated counter hook */
const useCountUp = (target: number, duration = 2000, inView: boolean) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return count;
};

const STATS = [
  { value: 2200, suffix: '+', label: '진단 완료 매장' },
  { value: 45, suffix: '%', label: '평균 상위 노출 기여' },
  { value: 30, suffix: '%', label: '마케팅 비용 절감' },
  { value: 10, suffix: '분', label: '평균 진단 소요 시간' },
];

const TESTIMONIALS = [
  {
    name: '김○○ 사장님',
    role: '서울 강남 카페',
    quote: "대행사 없이 혼자 순위를 올릴 수 있을 줄은 몰랐어요. D-PLOG 리포트대로 메뉴 사진만 바꿨는데 3주 만에 10위 밖에서 3위로 올라왔습니다.",
  },
  {
    name: '박○○ 매니저',
    role: '부산 해운대 식당',
    quote: "사장님께 매주 보고서를 드려야 하는데, D-PLOG 리포트를 그대로 캡처해서 보여드려요. 데이터가 있으니까 신뢰가 생깁니다.",
  },
  {
    name: '이○○ 대표',
    role: '마케팅 컨설팅',
    quote: "8개 매장을 동시에 관리하고 있는데, 한 화면에서 순위를 비교하고 리포트를 뽑을 수 있어서 업무 시간이 절반 이상 줄었습니다.",
  },
];

export const SocialProofSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <section
      ref={ref}
      className="py-28 px-6 bg-[#FAFAF9] dark:bg-[#0F172A]"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-blue-600 dark:text-blue-400 text-sm font-bold tracking-widest uppercase">
            Trusted Results
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-3 tracking-tight text-slate-900 dark:text-white">
            숫자가 증명합니다
          </h2>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {STATS.map((stat, i) => {
            const count = useCountUp(stat.value, 2000, isInView);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]"
              >
                <div className="text-3xl md:text-4xl font-black text-blue-600 dark:text-blue-400 tabular-nums">
                  {count}
                  <span className="text-xl">{stat.suffix}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="p-6 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.06]"
            >
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4 break-keep">
                &quot;{t.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
