import { useState } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { cn } from '@/shared/lib/utils';
import { Calendar } from 'lucide-react';

export const DDaySetupView = () => {
  const { dDay, setDDay } = useOnboardingStore();
  const [selectedPreset, setSelectedPreset] = useState<string | null>(dDay?.includes('-') ? null : dDay);

  const presets = [
    { id: '1_month', label: '1개월 내 (급해요)' },
    { id: '3_months', label: '3개월 내 (여유있게)' },
    { id: '6_months', label: '6개월 내 (준비 중)' },
    { id: 'undecided', label: '미정 (알아보는 중)' },
  ];

  const handlePresetSelect = (id: string) => {
    setSelectedPreset(id);
    setDDay(id);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedPreset(null);
    setDDay(e.target.value);
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          사장님의 목표 <span className="text-blue-600 dark:text-blue-400">오픈 시점</span>은<br/>언제인가요?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          오픈일에 맞춘 역산형 D-Day 체크리스트를 생성하기 위함입니다.
        </p>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-8">
        {/* Exact Date Picker */}
        <div className="relative">
          <input
            type="date"
            value={dDay?.includes('-') ? dDay : ''}
            onChange={handleDateChange}
            className="w-full text-center text-2xl font-bold bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-6 px-16 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white"
          />
          <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-8 h-8 pointer-events-none" />
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
          <span className="text-slate-400 text-sm font-bold">또는 대략적인 시점 선택</span>
          <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
        </div>

        {/* Quick Select Options */}
        <div className="grid grid-cols-2 gap-3">
          {presets.map(opt => (
            <button
              key={opt.id}
              onClick={() => handlePresetSelect(opt.id)}
              className={cn(
                "py-4 rounded-xl border-2 font-bold transition-all",
                selectedPreset === opt.id
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-400"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-200 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
