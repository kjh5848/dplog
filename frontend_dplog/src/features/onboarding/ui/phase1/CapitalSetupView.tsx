import { useOnboardingStore } from '../../store/useOnboardingStore';
import { cn } from '@/shared/lib/utils';
import { useState } from 'react';

export const CapitalSetupView = () => {
  const { totalCapital, setTotalCapital } = useOnboardingStore();
  const [inputValue, setInputValue] = useState(totalCapital ? totalCapital.toString() : '');

  const defaultOptions = [
    { label: '3천만원 이하', value: 30000000 },
    { label: '5천만원', value: 50000000 },
    { label: '1억원', value: 100000000 },
    { label: '1억 5천만원', value: 150000000 },
  ];

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allows only numbers
    const value = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(value);
    
    if (value) {
      setTotalCapital(parseInt(value, 10));
    } else {
      setTotalCapital(0); 
    }
  };

  const handleSelectOption = (val: number) => {
    setInputValue(val.toString());
    setTotalCapital(val);
  };

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          창업에 투입할 <span className="text-blue-600 dark:text-blue-400">총 자본금</span>은<br/>어느 정도로 생각하시나요?
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          권리금, 보증금, 인테리어, 예비비 등을 모두 포함한 영끌 자본금 기준입니다.
        </p>
      </div>

      <div className="max-w-xl mx-auto w-full space-y-8">
        {/* Custom Input */}
        <div className="relative">
          <input
            type="text"
            value={inputValue ? Number(inputValue).toLocaleString() : ''}
            onChange={handleCustomInput}
            placeholder="예) 50,000,000"
            className="w-full text-center text-4xl font-bold bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-3xl py-8 px-6 focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white"
          />
          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
            원
          </span>
        </div>

        {/* Quick Select Options */}
        <div className="grid grid-cols-2 gap-3">
          {defaultOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSelectOption(opt.value)}
              className={cn(
                "py-4 rounded-xl border-2 font-bold transition-all text-lg",
                totalCapital === opt.value
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
