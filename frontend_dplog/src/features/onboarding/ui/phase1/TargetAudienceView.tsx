import { useOnboardingStore } from '../../store/useOnboardingStore';
import { cn } from '@/shared/lib/utils';
import { Users, User, Baby, Briefcase } from 'lucide-react';

export const TargetAudienceView = () => {
  const { targetAudience, setTargetAudience } = useOnboardingStore();

  const audiences = [
    { id: '2030_women', label: '2030 여성', desc: '트렌드와 인스타 감성 중시', icon: Users },
    { id: 'office_workers', label: '직장인 (점심/회식)', desc: '가성비와 회전율, 단체석 확충', icon: Briefcase },
    { id: 'family', label: '가족 단위', desc: '유아 동반, 편안한 주차 필수', icon: Baby },
    { id: 'solo_dining', label: '1인 가구/혼밥족', desc: '바 테이블, 1인 맞춤 메뉴', icon: User },
  ];

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          우리 가게의 <span className="text-blue-600 dark:text-blue-400">메인 타겟 고객층</span>은<br/>누구인가요?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          상권 분석과 핏(Fit) 진단을 위해 가장 핵심이 되는 고객을 선택해주세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
        {audiences.map((aud) => {
          const isSelected = targetAudience === aud.id;
          return (
            <div
              key={aud.id}
              onClick={() => setTargetAudience(aud.id)}
              className={cn(
                "group relative flex flex-col items-start p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200",
                "bg-white dark:bg-slate-800",
                isSelected
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400 shadow-md"
                  : "border-slate-100 dark:border-slate-700 hover:border-blue-300 hover:shadow-sm"
              )}
            >
              <div className={cn(
                "size-12 rounded-full flex items-center justify-center transition-colors mb-4",
                isSelected
                 ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                 : "bg-slate-50 dark:bg-slate-700 text-slate-400 group-hover:text-blue-500"
              )}>
                <aud.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className={cn(
                  "text-xl font-bold mb-1 transition-colors",
                  isSelected ? "text-blue-700 dark:text-blue-300" : "text-slate-900 dark:text-white"
                )}>
                  {aud.label}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  {aud.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
