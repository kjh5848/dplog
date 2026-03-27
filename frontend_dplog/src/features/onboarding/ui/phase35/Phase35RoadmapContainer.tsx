'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FileSearch, Building2, Store, ShoppingBag, Send, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { OnboardingProgressHeader } from '../components/OnboardingProgressHeader';

export function Phase35RoadmapContainer() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/phase4-contract');
  };

  const timelineSteps = [
    {
      id: 1,
      title: "점포 탐색 및 가계약",
      icon: <FileSearch className="w-5 h-5 text-indigo-400" />,
      color: "border-indigo-500/50 bg-indigo-500/10",
      description: "입지 분석(Phase 3) 후 마음에 드는 건물을 찾으면 가계약금을 겁니다.",
      factCheck: "가계약 전 건축물대장을 반드시 확인하세요. 위반건축물이면 영업신고 자체가 안 나옵니다."
    },
    {
      id: 2,
      active: true,
      title: "본계약 (임대차계약)",
      icon: <Building2 className="w-5 h-5 text-red-400" />,
      color: "border-red-500 bg-red-500/20",
      description: "본격적인 임대차 계약서 작성 및 보증금/권리금을 지급합니다.",
      factCheck: "가장 위험한 순간! 특약사항 장난질(원상복구, 제소전 화해조서)을 이때 잡아내야 합니다.",
      highlight: true
    },
    {
      id: 3,
      title: "인허가 및 사업자등록",
      icon: <Store className="w-5 h-5 text-neutral-400" />,
      color: "border-neutral-700 bg-neutral-800",
      description: "보건증 발급, 위생교육 수료 후 구청에 영업신고를 하고 세무서에서 사업자를 냅니다.",
      factCheck: "잔금 치르기 전에 인허가 가능 여부를 구청에 미리 크로스체크 해야 탈이 없습니다."
    },
    {
      id: 4,
      title: "가계 세팅 및 배달 앱 입점",
      icon: <ShoppingBag className="w-5 h-5 text-neutral-400" />,
      color: "border-neutral-700 bg-neutral-800",
      description: "인테리어를 마무리 짓고 배민/쿠팡이츠 등 배달 플랫폼과 포스를 세팅합니다.",
      factCheck: "플랫폼 심사는 2주~한 달이 걸립니다. 인테리어 완공 후 알아보기 시작하면 늦습니다."
    },
    {
      id: 5,
      title: "가오픈 및 정식 오픈",
      icon: <Send className="w-5 h-5 text-neutral-400" />,
      color: "border-neutral-700 bg-neutral-800",
      description: "최종 목표인 오픈일에 맞춰 가오픈으로 운영을 점검합니다.",
      factCheck: "오픈빨은 한 달입니다. 철저히 분리해 둔 마케팅 예산을 쏟아부어야 할 시기입니다."
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans flex flex-col">
      <OnboardingProgressHeader currentPhase={4} />

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl font-bold mb-4">창업 실패를 막는 전체 로드맵</h1>
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
            방금 진단한 역삼동 상권에 들어가기로 결심했다면,<br />
            이제 <strong>전 재산이 걸린 "계약" 타이밍</strong>입니다.<br/>
            각 단계별 치명적인 팩트 체크 포인트를 확인하세요.
          </p>
        </motion.div>

        {/* Vertical Timeline */}
        <div className="relative pl-6 md:pl-10 space-y-6 md:space-y-8 before:absolute before:inset-0 before:ml-6 md:before:ml-10 before:-translate-x-px before:h-full before:w-[2px] before:bg-neutral-800">
          
          {timelineSteps.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              {/* Timeline Node */}
              <div className={`absolute -left-[35px] md:-left-[45px] w-10 h-10 rounded-full border-2 ${step.color} flex items-center justify-center z-10 shadow-lg bg-neutral-950`}>
                {step.icon}
              </div>

              {/* Content Card */}
              <div className={`p-5 rounded-2xl border ${step.highlight ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)] relative overflow-hidden' : 'bg-neutral-900 border-neutral-800'}`}>
                {step.highlight && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-bl-lg">
                    가장 위험한 현 단계
                  </div>
                )}
                <h3 className={`text-lg font-bold mb-2 ${step.highlight ? 'text-red-400' : 'text-white'}`}>
                  {step.id}. {step.title}
                </h3>
                <p className="text-sm text-neutral-400 mb-4">{step.description}</p>
                
                {/* Fact Check Box */}
                <div className={`p-3 rounded-lg text-sm border flex items-start gap-2 ${
                  step.highlight ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                }`}>
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${step.highlight ? 'text-red-400' : 'text-neutral-500'}`} />
                  <span className="leading-relaxed"><strong>팩트체크:</strong> {step.factCheck}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Warning & CTA Footer */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-16 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 text-center"
        >
          <div className="mb-4 text-red-400 flex justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">다음 단계: 본계약 방어 (스마트폰 카메라 준비)</h2>
          <p className="text-neutral-400 text-sm mb-6">
            공인중개사가 뽑아온 계약서, 특약사항에 눈속임은 없는지 AI가 즉석에서 판단해 드립니다. <br/>
            모바일 기기에서 계약서를 바로 촬영해 보세요.
          </p>

          <Button 
            onClick={handleNext}
            className="w-full sm:w-auto px-8 h-14 bg-red-600 hover:bg-red-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-red-500/20"
          >
            본 계약서 독소조항 스캔하기
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
