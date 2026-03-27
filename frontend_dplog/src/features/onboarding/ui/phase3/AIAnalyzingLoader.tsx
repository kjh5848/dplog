import { useState, useEffect } from 'react';
import { Search, Database, Cpu, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface AIAnalyzingLoaderProps {
  onComplete: () => void;
}

const steps = [
  { icon: Search, label: '국토교통부 실거래가 데이터 수집 중...' },
  { icon: Database, label: '소상공인 상권정보 API 교차 검증 중...' },
  { icon: Cpu, label: '경쟁 강도 및 타겟 매칭률 AI 분석 중...' },
  { icon: FileText, label: '최종 상권 진단 리포트 생성 중...' }
];

export const AIAnalyzingLoader = ({ onComplete }: AIAnalyzingLoaderProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Reveal each step sequentially every 1.5 seconds
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          // Wait 1 more second after the last step, then complete
          setTimeout(onComplete, 1200);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="w-full flex justify-center items-center p-8 md:p-12 animate-in fade-in zoom-in-95 duration-700">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse"></div>
            <div className="w-20 h-20 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center relative shadow-lg">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
            </div>
          </div>

          <h3 className="text-xl font-black text-white mb-2">AI 상권 분석기 가동 중</h3>
          <p className="text-sm text-slate-400 mb-8 text-center max-w-[260px] leading-relaxed">
            방대한 공공데이터와 지표를 바탕으로 치명적인 단점들을 색출하고 있습니다.
          </p>

          <div className="w-full space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isPast = index < currentStep;

              return (
                <div 
                  key={index}
                  className={cn(
                    "flex items-center gap-3 transition-all duration-500",
                    isPast ? "opacity-100" : isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-500",
                    isPast ? "bg-green-500/20 border-green-500/50 text-green-400" :
                    isActive ? "bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                    "bg-slate-800 border-slate-700 text-slate-500"
                  )}>
                    <Icon className={cn("w-4 h-4", isActive && "animate-pulse")} />
                  </div>
                  <span className={cn(
                    "text-sm font-medium transition-colors duration-500",
                    isPast ? "text-slate-300" :
                    isActive ? "text-white" :
                    "text-slate-500"
                  )}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
