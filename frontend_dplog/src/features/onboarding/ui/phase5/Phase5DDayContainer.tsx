'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { CalendarDays, AlertTriangle, ArrowRight, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { useRouter } from 'next/navigation';
import { OnboardingProgressHeader } from '../components/OnboardingProgressHeader';

export function Phase5DDayContainer() {
  const router = useRouter();
  const dDaySetting = useOnboardingStore(state => state.dDay);
  
  // Calculate remaining days based on setting (fake logic for MVP)
  const remainingDays = dDaySetting === '1month' ? 30 
                      : dDaySetting === '3months' ? 90 
                      : dDaySetting === '6months' ? 180 
                      : 45; // default fallback

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-8 md:py-16 font-sans text-white flex flex-col">
      <OnboardingProgressHeader currentPhase={6} />
      
      <div className="max-w-3xl mx-auto flex flex-col gap-12 mt-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-full mb-6">
            <CalendarDays className="w-10 h-10 text-indigo-400" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            오픈까지 남은 시간, <span className="text-indigo-400">D-{remainingDays}</span>
          </h1>
          <p className="text-lg text-neutral-400">
            사장님, 부동산 투어하고 계약서 쓸 때가 아닙니다.<br />
            지금 당장 해결해야 할 <strong className="text-white">최우선 폭탄 과제 3가지</strong>입니다.
          </p>
        </motion.div>

        {/* Action Items List */}
        <div className="space-y-4">
          
          {/* Item 1 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 flex gap-4 items-start cursor-pointer hover:bg-neutral-900 transition-colors"
          >
            <div className="text-red-500 mt-1">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-red-100 flex items-center gap-2 mb-2">
                영업신고증 발급 전, 위반건축물 조회
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-3">
                마음에 드는 상가를 찾으셨나요? 덜컥 가계약금부터 넣기 전에, 정부24에서 건축물대장부터 떼보세요. 불법 증축 테라스가 있다면 영업신고 자체가 안 나와 수백만 원을 날릴 수 있습니다.
              </p>
              <div className="inline-flex items-center text-xs font-bold px-3 py-1 bg-red-500/10 text-red-400 rounded-full">
                소요 예상: 즉시 확인 요망 (10분)
              </div>
            </div>
            <div className="text-neutral-600">
              <Circle className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Item 2 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-orange-950/20 border border-orange-500/30 flex gap-4 items-start cursor-pointer hover:bg-neutral-900 transition-colors"
          >
            <div className="text-orange-500 mt-1">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-orange-100 flex items-center gap-2 mb-2">
                배달 플랫폼(배민/쿠팡) 심사 접수
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-3">
                가게 인테리어 다 끝나고 배민에 전화하면 늦습니다. 심사와 광고 세팅에 최소 2주~한 달이 걸립니다. 점포 계약 직후 바로 사업자등록증 내고 플랫폼 가입부터 서두르세요.
              </p>
              <div className="inline-flex items-center text-xs font-bold px-3 py-1 bg-orange-500/10 text-orange-400 rounded-full">
                소요 예상: D-30 전 필수
              </div>
            </div>
            <div className="text-neutral-600">
              <Circle className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Item 3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-neutral-900/50 border border-neutral-800 flex gap-4 items-start cursor-pointer hover:bg-neutral-800 transition-colors"
          >
            <div className="text-neutral-500 mt-1">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-neutral-200 flex items-center gap-2 mb-2">
                초기 마케팅 예산 통장 분리 
              </h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-3">
                보증금, 권리금 내고 남은 돈을 하나의 통장에 섞어두지 마세요. 오픈 직후 3개월간 버틸 고정비와 온라인 마케팅 예산(최소 300만원)은 절대 건드리지 못하게 별도 계좌로 빼두셔야 생존합니다.
              </p>
              <div className="inline-flex items-center text-xs font-bold px-3 py-1 bg-neutral-800 text-neutral-300 rounded-full">
                소요 예상: D-15 (가구 입고 전)
              </div>
            </div>
            <div className="text-neutral-600">
              <Circle className="w-6 h-6" />
            </div>
          </motion.div>

        </div>

        {/* CTA (Sign up / Service Entry) */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.8 }}
           className="mt-8 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-indigo-900/40 to-black border border-indigo-500/20 relative overflow-hidden text-center"
        >
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-indigo-500/10 blur-[100px] pointer-events-none" />
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              더 이상 감으로 장사하지 마세요.
            </h2>
            <p className="text-indigo-200 mb-8 max-w-lg mx-auto leading-relaxed">
              성공적인 창업을 위한 모든 준비가 끝났습니다.<br/>
              이제 대시보드에서 D-Day 액션플랜을 체계적으로 관리하세요.
            </p>
            
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-white hover:bg-neutral-200 text-black text-lg h-14 px-8 rounded-full font-bold shadow-[0_0_40px_rgba(99,102,241,0.4)]"
            >
              대시보드로 돌아가기
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <p className="mt-4 text-xs text-neutral-500">
              핵심 생존 미션 완료! 상세 일정은 대시보드에서 추가 관리할 수 있습니다.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
