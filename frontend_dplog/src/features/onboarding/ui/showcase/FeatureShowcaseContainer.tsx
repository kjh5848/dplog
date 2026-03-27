'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  FileText, 
  TrendingUp, 
  ShieldAlert, 
  Lock, 
  ChevronRight, 
  CheckCircle2 
} from 'lucide-react';
import { Button } from '@/shared/ui/button';

const upcomingFeatures = [
  {
    icon: <MapPin className="w-6 h-6 text-indigo-500" />,
    title: 'AI 상권 & 입지 팩트체크',
    description: '공공데이터 기반으로 사장님이 점찍은 그 자리의 진짜 유동인구, 타겟 적합도, 그리고 주변 좀비 상권 현황을 교차 검증합니다.',
    badge: 'Phase 3'
  },
  {
    icon: <FileText className="w-6 h-6 text-orange-500" />,
    title: '상가 계약서 호구 방지 스캐너',
    description: '임대인에게 절대적으로 유리한 독소조항(제소전 화해조서, 포괄적 원상복구 등)을 AI가 스캔하여 협상 가이드를 제공합니다.',
    badge: 'Phase 4'
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-emerald-500" />,
    title: 'D-Day 역산 창업 로드맵',
    description: '임장부터 가계약, 인테리어, 오픈까지. 수백 개의 체크리스트를 놓치지 않도록 사장님 맞춤형 생존 일정을 자동 시각화합니다.',
    badge: 'Phase 5'
  }
];

export const FeatureShowcaseContainer = () => {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-neutral-950 flex flex-col font-sans mb-12 relative overflow-hidden">
      
      {/* Background Embellishments */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto flex flex-col pt-16 md:pt-24 px-4 relative z-10 pb-32">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-2xl mb-6 border border-indigo-500/20">
            <ShieldAlert className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            여기까지 오신 사장님,<br/>
            절반은 생존하셨습니다.
          </h1>
          <p className="text-lg text-neutral-400 font-medium max-w-2xl mx-auto leading-relaxed">
            비현실적인 핑크빛 로망은 걷어냈습니다.<br className="hidden md:block"/>
            이제 진짜 객관적인 데이터로 <strong className="text-white">실패 확률 0%</strong>에 도전할 시간입니다.
          </p>
        </motion.div>

        {/* Features Locked State Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative">
          
          {/* Lock Overlay */}
          <div className="absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center rounded-3xl border border-white/5 shadow-2xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="bg-neutral-900 border border-neutral-800 p-6 md:p-8 rounded-2xl flex flex-col items-center text-center max-w-sm mx-4 shadow-2xl shadow-indigo-900/20"
            >
              <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">프리미엄 기능 잠금 상태</h3>
              <p className="text-sm text-neutral-400 mb-6">
                상권 분석부터 계약서 스캔까지,<br/>
                D-PLOG의 핵심 무기를 사용하려면 10초만에 가입하세요.
              </p>
              <Button 
                onClick={() => router.push('/login')} 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl text-md"
              >
                무료로 시작하기
              </Button>
            </motion.div>
          </div>

          {/* Underlaying Feature Cards */}
          {upcomingFeatures.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 + 0.3 }}
              className="bg-neutral-900/50 border border-neutral-800/50 p-6 rounded-2xl opacity-60 grayscale-[30%] pointer-events-none"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-neutral-800 rounded-xl">
                  {feature.icon}
                </div>
                <span className="text-xs font-bold text-neutral-500 bg-neutral-800/80 px-2 py-1 rounded-md">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-lg font-bold text-neutral-300 mb-3">{feature.title}</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="bg-gradient-to-r from-neutral-900 to-neutral-900/50 border border-neutral-800 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              지금 가입하면 얻을 수 있는 혜택
            </h3>
            <ul className="text-neutral-400 text-sm space-y-2 mt-4">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                시뮬레이터로 계산한 내 재무 보수 수치 저장
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                실시간 팩트폭행 리포트 무제한 열람
              </li>
            </ul>
          </div>
          
          <Button 
            onClick={() => router.push('/login')} 
            className="w-full md:w-auto px-8 bg-white hover:bg-neutral-200 text-black font-bold h-14 rounded-xl text-lg flex items-center gap-2 group"
          >
            회원가입하고 계속하기
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

      </div>
    </div>
  );
};
