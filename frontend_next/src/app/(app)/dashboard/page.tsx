'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Zap, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const StatCard = ({ title, value, change, trend, icon: Icon, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative group p-6 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-xl hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon className="size-16" />
    </div>
    <div className="flex justify-between items-start mb-4">
      <div className="size-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-600 dark:text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
        <Icon className="size-5" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
        trend === 'up' ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
      )}>
        {trend === 'up' ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        {change}%
      </div>
    </div>
    <div>
      <p className="text-sm text-slate-500 mb-1 font-medium">{title}</p>
      <h3 className="text-2xl font-black tabular-nums tracking-tight">{value}</h3>
    </div>
    <div className="mt-4 h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: '70%' }}
        transition={{ duration: 1, delay: delay + 0.3 }}
        className="h-full bg-blue-600 rounded-full"
      />
    </div>
  </motion.div>
);

const AnimatedChart = () => {
  // Simple animated SVG logic for a high-end look
  const points = [20, 45, 30, 65, 55, 80, 75, 95];
  const pathData = points.map((p, i) => `${i * (100 / (points.length - 1))},${100 - p}`).join(' L ');

  return (
    <div className="relative w-full h-48 mt-6">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={`M 0,100 L 0,${100 - points[0]} L ${pathData} L 100,100 Z`}
          fill="url(#chartGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.path
          d={`M 0,${100 - points[0]} L ${pathData}`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={i * (100 / (points.length - 1))}
            cy={100 - p}
            r="1.5"
            fill="white"
            stroke="#3b82f6"
            strokeWidth="0.8"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.2 + i * 0.1 }}
          />
        ))}
      </svg>
    </div>
  );
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">프리미엄 대시보드</h1>
          <p className="text-slate-500 font-medium italic">"오늘 플레이스 지수는 전주 대비 <span className="text-blue-600 dark:text-blue-400 font-bold">12% 상승</span>했습니다."</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-slate-100 dark:bg-white/5 rounded-xl text-sm font-bold hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">데이터 다운로드</button>
          <button className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:scale-105 transition-all active:scale-95">신규 진단 생성</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="방문 고객 수" value="12,482" change="+12.5" trend="up" icon={Users} delay={0.1} />
        <StatCard title="예약 전환율" value="4.2%" change="+0.8" trend="up" icon={Zap} delay={0.2} />
        <StatCard title="지출 광고비" value="142만원" change="-5.2" trend="down" icon={TrendingUp} delay={0.3} />
        <StatCard title="AI 콘텐츠 조회" value="45,201" change="+24.1" trend="up" icon={Sparkles} delay={0.4} />
      </div>

      {/* Main Chart Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="lg:col-span-2 p-8 rounded-[40px] border border-slate-200 dark:border-white/10 bg-white dark:bg-black relative overflow-hidden group shadow-xl shadow-slate-200/50 dark:shadow-none"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold mb-1">매장 성장 트렌드</h3>
              <p className="text-sm text-slate-500">지난 7일간의 지점 통합 지표</p>
            </div>
            <select className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer">
              <option>최근 7일</option>
              <option>최근 30일</option>
            </select>
          </div>
          <AnimatedChart />
        </motion.div>

        {/* AI Insight Sidebar Widget */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="p-8 rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Sparkles className="size-32" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="mb-6 flex items-center gap-2">
              <div className="size-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-md">
                <Sparkles className="size-4" />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">AI Insight</span>
            </div>
            <h3 className="text-2xl font-black mb-6 leading-tight">
              이번 주 매장 노출도가<br/>급증할 것으로 예상됩니다.
            </h3>
            <p className="text-blue-100/80 text-sm leading-relaxed mb-8">
              주변 500m 내 경쟁 매장 3곳의 활동이 일시적으로 감소했습니다. 지금 '인기 메뉴' 사진을 업데이트하면 상위 노출 기회를 잡을 수 있습니다.
            </p>
            <div className="mt-auto">
              <button className="w-full py-4 bg-white text-blue-600 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/10">
                추천 액션 실행하기
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row - More detailed lists/widgets could go here */}
    </div>
  );
}
