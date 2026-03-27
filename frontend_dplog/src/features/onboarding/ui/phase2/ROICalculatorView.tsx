import { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { cn } from '@/shared/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  ReferenceLine 
} from 'recharts';

interface ROICalculatorViewProps {
  targetProfit: number;
  onNext: () => void;
  onBack: () => void;
}

export const ROICalculatorView = ({ targetProfit, onNext, onBack }: ROICalculatorViewProps) => {
  const { totalCapital, setPhase2Data } = useOnboardingStore();
  const [isMounted, setIsMounted] = useState(false);

  // States
  const [adjustableTargetProfit, setAdjustableTargetProfit] = useState<number>(targetProfit);
  const [totalInvestment, setTotalInvestment] = useState<number>(totalCapital || 100000000); // Default 1억
  const [paybackMonths, setPaybackMonths] = useState<number>(24); // Default 2년
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(val);
  };

  if (!isMounted) return null;

  // Calculatations
  const monthlyPayback = Math.ceil(totalInvestment / paybackMonths);
  const realNetProfit = adjustableTargetProfit - monthlyPayback;
  const isDanger = realNetProfit <= 0;

  // Options for Payback Select (1 to 20 years)
  const paybackOptions = Array.from({ length: 20 }, (_, i) => {
    const years = i + 1;
    return { value: (years * 12).toString(), label: `${years}년 (${years * 12}개월)` };
  });

  // Input Handlers
  const handleTargetProfitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue || '0', 10);
    setAdjustableTargetProfit(numValue);
  };

  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue || '0', 10);
    setTotalInvestment(numValue);
  };

  const handleMonthsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const numValue = parseInt(rawValue || '0', 10);
    setPaybackMonths(numValue);
  };

  // Chart Data
  const chartData = [
    { name: '예상 순수익', value: adjustableTargetProfit },
    { name: '월 투자 회수액', value: monthlyPayback * -1 }, // Negative for visual deduction
    { name: '진짜 남는 돈', value: realNetProfit }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const isNegative = payload[0].value < 0;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border shadow-lg">
          <p className="text-sm text-slate-500 mb-1">{payload[0].payload.name}</p>
          <p className={cn(
            "font-bold text-lg",
             isNegative ? "text-red-500" : "text-blue-500"
          )}>
            {formatCurrency(Math.abs(payload[0].value))}원
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex flex-col gap-8 pb-12">
      <div className="text-center px-4">
        <h2 className="text-2xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-800 dark:from-red-400 dark:to-orange-500 mb-4 animate-fade-in-up">
          잠깐, 창업에 들어간 돈은 언제 회수하실 건가요?
        </h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium">
          내 피 같은 돈이든, 대출금이든 초기 투자금 회수(ROI)를 고려하지 않은 마진은 가짜입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Input Panel */}
        <div className="flex flex-col gap-6">
          <div className="bg-slate-50 dark:bg-slate-800/80 p-8 rounded-2xl border border-border shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="bg-red-100 text-red-600 p-1.5 rounded-lg">
                <AlertTriangle size={18} />
              </span>
              초기 투자금 및 회수 목표
            </h3>

            <div className="space-y-6">
              {/* Target Profit */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  월 목표 순수익 (앞서 설정한 마진)
                </label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={adjustableTargetProfit === 0 ? '' : formatCurrency(adjustableTargetProfit)} 
                    onChange={handleTargetProfitChange} 
                    className="text-right pr-12 h-14 text-xl font-bold border-slate-200 focus-visible:ring-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">원</span>
                </div>
              </div>

              {/* Total Investment */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  총 창업 비용 (보증금+권리금+인테리어 등)
                </label>
                <div className="relative">
                  <Input 
                    type="text" 
                    value={totalInvestment === 0 ? '' : formatCurrency(totalInvestment)} 
                    onChange={handleInvestmentChange} 
                    className="text-right pr-12 h-14 text-xl font-bold border-red-200 focus-visible:ring-red-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">원</span>
                </div>
              </div>

              {/* Payback Months */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  목표 원금 회수 기간
                </label>
                <Select value={paybackMonths.toString()} onValueChange={(val) => setPaybackMonths(parseInt(val, 10))}>
                  <SelectTrigger className="h-14 text-xl font-bold border-red-200 focus:ring-red-500 text-right pr-4">
                    <SelectValue placeholder="기간 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {paybackOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="text-right">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">목표 기간 내 회수하려면, 매월 따로 챙겨둬야(갚아야) 할 돈은</span>
                </div>
                <div className="text-right text-3xl font-black text-red-600 dark:text-red-400">
                  {formatCurrency(monthlyPayback)}원
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: ROI Impact Result */}
        <div className="flex flex-col gap-6">
          <div className={cn(
            "h-full p-8 rounded-2xl border shadow-sm transition-colors duration-500 flex flex-col justify-between",
             isDanger 
               ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50" 
               : "bg-white dark:bg-slate-800 border-border"
          )}>
            <div>
              <h3 className="text-lg font-bold mb-2 flex items-center justify-between">
                <span>사장님의 진짜 가처분 소득</span>
                {isDanger && <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded">위태로움</span>}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                월 순수익({formatCurrency(adjustableTargetProfit)}원) - 월 투자 회수액({formatCurrency(monthlyPayback)}원)
              </p>

              <div className="h-48 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(value) => `${value / 10000}만`} tick={{ fontSize: 11, fill: '#888' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                    <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={2} />
                    <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={40}>
                      {
                        chartData.map((entry, index) => {
                          const isDed = index === 1;
                          const isResult = index === 2;
                          let fill = '#3b82f6'; // Default (Target)
                          if (isDed) fill = '#ef4444'; // Deduction
                          if (isResult) fill = entry.value <= 0 ? '#ef4444' : '#10b981'; // Result
                          return <Cell key={`cell-${index}`} fill={fill} />
                        })
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="text-center pt-4 border-t border-slate-200/50 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-500">실제로 내 손에 남는 돈</span>
                <div className={cn(
                  "text-4xl md:text-5xl font-black mt-2",
                   isDanger ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {formatCurrency(realNetProfit)}원
                </div>
                {isDanger && (
                  <p className="mt-4 text-sm font-bold text-red-600 bg-red-100 dark:bg-red-900/40 p-3 rounded-lg animate-pulse">
                    ⚠️ 경고: 이렇게 팔면 초기 투자금 회수는커녕 오히려 적자입니다. 매출 목표를 늘리거나 고정비를 반드시 줄여야 합니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-6 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            마진 시뮬레이터로
          </button>
          
          <button
            onClick={() => {
              setPhase2Data({ totalInvestment, paybackMonths, monthlyPayback, realNetProfit });
              onNext();
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-slate-900/20 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">종합 진단하러 가기</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
      </div>

    </div>
  );
};
