import { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { Slider } from '@/shared/ui/slider';
import { AlertCircle, ArrowLeft, ArrowRight, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface MarginCalculatorViewProps {
  onNext: (targetProfit: number) => void;
  onBack: () => void;
}

export const MarginCalculatorView = ({ onNext, onBack }: MarginCalculatorViewProps) => {
  const { setPhase2Data } = useOnboardingStore();
  const [isMounted, setIsMounted] = useState(false);

  // 변수 초기값
  const [rent, setRent] = useState(2000000);
  const [menuPrice, setMenuPrice] = useState(15000);
  const [foodCostPct, setFoodCostPct] = useState(35);
  const [deliveryPct, setDeliveryPct] = useState(50);
  const [otherFixed, setOtherFixed] = useState(3000000);
  const [customTargetProfit, setCustomTargetProfit] = useState<number>(5000000);

  useEffect(() => { setIsMounted(true); }, []);

  const fmt = (val: number) =>
    new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(val) + '원';
  const fmtNum = (val: number) =>
    new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(val);

  if (!isMounted) return null;

  // --- 계산 로직 ---
  const foodCost = menuPrice * (foodCostPct / 100);
  const vatAndCard = menuPrice * 0.13;
  const hallNetProfit = menuPrice - foodCost - vatAndCard;

  const deliveryPlatformFee = menuPrice * 0.098;
  const deliveryRiderFee = 3000;
  const deliveryNetProfit = menuPrice - foodCost - vatAndCard - deliveryPlatformFee - deliveryRiderFee;

  const avgNetProfit = (hallNetProfit * ((100 - deliveryPct) / 100)) + (deliveryNetProfit * (deliveryPct / 100));
  const avgMarginPct = (avgNetProfit / menuPrice) * 100;

  const totalFixedCosts = rent + otherFixed;
  const bepOrders = avgNetProfit > 0 ? Math.ceil(totalFixedCosts / avgNetProfit) : 0;
  const bepOrdersPerDay = Math.ceil(bepOrders / 30);

  const calculateTarget = (targetProfit: number) => {
    const orders = avgNetProfit > 0 ? Math.ceil((totalFixedCosts + targetProfit) / avgNetProfit) : 0;
    return { orders, ordersPerDay: Math.ceil(orders / 30), revenue: orders * menuPrice };
  };

  const customTarget = calculateTarget(customTargetProfit || 0);

  const targetChartData = [
    { name: '손익분기점', value: bepOrders, revenue: bepOrders * menuPrice, color: '#64748b' },
    { name: '300만 목표', value: calculateTarget(3000000).orders, revenue: calculateTarget(3000000).revenue, color: '#3b82f6' },
    { name: '500만 목표', value: calculateTarget(5000000).orders, revenue: calculateTarget(5000000).revenue, color: '#3b82f6' },
    { name: '1000만 달성', value: calculateTarget(10000000).orders, revenue: calculateTarget(10000000).revenue, color: '#2563eb' },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl min-w-[160px]">
          <p className="text-white font-bold mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex justify-between items-center gap-4 text-xs">
              <span className="text-slate-400">요구 판매량</span>
              <span className="font-bold text-white">{fmtNum(data.value)}개</span>
            </div>
            <div className="flex justify-between items-center gap-4 text-xs pt-1 border-t border-slate-700/50">
              <span className="text-slate-300">필요 매출액</span>
              <span className="font-bold text-blue-400">{fmtNum(data.revenue)}원</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="animate-in fade-in duration-500 w-full max-w-2xl mx-auto pb-24 px-4">

      {/* 페이지 헤더 */}
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-2xl font-black">진짜 마진 &amp; 손익분기점 계산기</h2>
        <p className="text-slate-500 text-sm">배달앱 수수료와 부가세를 떼고 <span className="text-red-500 font-bold">진짜 남는 돈</span>을 계산합니다.</p>
        <div className="inline-block bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 px-4 py-2 rounded-xl text-left">
          <span className="font-bold text-slate-700 dark:text-slate-300">※ 기준</span> 배달앱 평균 수수료 9.8% + 배달대행 3,000원 + 부가세 10% + 카드수수료 3% 합산
        </div>
      </div>

      {/* 인풋 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* 고정비 카드 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">고정비</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">가게 월 고정비</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">예상 월세</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={fmtNum(rent)}
                  onChange={(e) => setRent(Number(e.target.value.replace(/[^0-9]/g, '')))}
                  className="text-right font-black text-base text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none w-28 transition-colors"
                />
                <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">원</span>
              </div>
            </div>
            <Slider value={[rent]} onValueChange={(v) => setRent(v[0])} min={500000} max={10000000} step={100000} />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">알바/직원 및 기타 관리비</label>
            <p className="text-xs text-slate-400 -mt-1">수도·전기·가스, 렌탈료, 통신비 포함</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">금액</span>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={fmtNum(otherFixed)}
                  onChange={(e) => setOtherFixed(Number(e.target.value.replace(/[^0-9]/g, '')))}
                  className="text-right font-black text-base text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none w-28 transition-colors"
                />
                <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">원</span>
              </div>
            </div>
            <Slider value={[otherFixed]} onValueChange={(v) => setOtherFixed(v[0])} min={0} max={15000000} step={100000} />
          </div>

        </div>

        {/* 수익률 카드 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl p-6 space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">수익률</p>
            <p className="text-lg font-black text-slate-900 dark:text-white">객단가 및 원가율</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">예상 객단가</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={fmtNum(menuPrice)}
                  onChange={(e) => setMenuPrice(Number(e.target.value.replace(/[^0-9]/g, '')))}
                  className="text-right font-black text-base text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none w-28 transition-colors"
                />
                <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">원</span>
              </div>
            </div>
            <Slider value={[menuPrice]} onValueChange={(v) => setMenuPrice(v[0])} min={5000} max={100000} step={1000} className="[&_[role=slider]]:border-blue-500" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">식재료 원가율</label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={foodCostPct}
                  onChange={(e) => { const v = Number(e.target.value.replace(/[^0-9]/g, '')); if (v <= 100) setFoodCostPct(v); }}
                  className="text-right font-black text-base text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-amber-500 outline-none w-16 transition-colors"
                />
                <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">%</span>
              </div>
            </div>
            <p className="text-xs text-slate-400">건당 재료비 {fmt(foodCost)}</p>
            <Slider value={[foodCostPct]} onValueChange={(v) => setFoodCostPct(v[0])} min={15} max={60} step={1} className="[&_[role=slider]]:border-amber-500" />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">배달 비중</label>
            <p className="text-xs text-slate-400 -mt-1">배달 1건당 {fmt(deliveryPlatformFee + deliveryRiderFee)} 지출 예상</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">비중</span>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="text"
                  value={deliveryPct}
                  onChange={(e) => { const v = Number(e.target.value.replace(/[^0-9]/g, '')); if (v <= 100) setDeliveryPct(v); }}
                  className="text-right font-black text-base text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 outline-none w-16 transition-colors"
                />
                <span className="font-bold text-slate-600 dark:text-slate-400 text-sm">%</span>
              </div>
            </div>
            <Slider value={[deliveryPct]} onValueChange={(v) => setDeliveryPct(v[0])} min={0} max={100} step={5} className="[&_[role=slider]]:border-indigo-500" />
          </div>
        </div>
      </div>

      {/* 결과 카드 - 진짜 남는 돈 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden mb-4">
        <div className="h-1 w-full bg-blue-500" />
        <div className="px-6 pt-5 pb-2">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">마진 분석</p>
          <p className="text-lg font-black text-slate-900 dark:text-white">1개 팔면 진짜 남는 돈</p>
        </div>

        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 홀 마진 */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4">
            <p className="text-xs font-bold text-blue-500 mb-1">홀(매장) 판매</p>
            <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{fmt(hallNetProfit)}</p>
            <p className="text-xs text-blue-400 mt-1">마진율 {((hallNetProfit / menuPrice) * 100).toFixed(1)}%</p>
          </div>

          {/* 배달 마진 */}
          <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl p-4">
            <p className="text-xs font-bold text-amber-500 mb-1">배달 판매</p>
            <p className={cn("text-2xl font-black", deliveryNetProfit > 0 ? "text-amber-600 dark:text-amber-400" : "text-red-500")}>
              {deliveryNetProfit > 0 ? fmt(deliveryNetProfit) : "적자 발생"}
            </p>
            {deliveryNetProfit > 0 && <p className="text-xs text-amber-400 mt-1">마진율 {((deliveryNetProfit / menuPrice) * 100).toFixed(1)}%</p>}
          </div>

          {/* 가중 평균 */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl p-4">
            <p className="text-xs font-bold text-emerald-500 mb-1">홀/배달 통합 평균</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{avgMarginPct.toFixed(1)}%</p>
            <p className="text-xs text-emerald-400 mt-1">건당 {fmt(avgNetProfit)}</p>
          </div>
        </div>

        {/* 손익분기점 */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm font-black text-slate-900 dark:text-white">손익분기점 — 적자를 면하기 위한 최소 판매량</p>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">월세와 고정비를 감당하고 순수익이 0원이 되는 지점. 이보다 적게 팔면 무조건 적자입니다.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 font-bold mb-1">한 달 최소 판매량</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{fmtNum(bepOrders)}<span className="text-sm font-bold ml-1">개</span></p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
              <p className="text-xs text-slate-500 font-bold mb-1">하루 평균 (30일)</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{fmtNum(bepOrdersPerDay)}<span className="text-sm font-bold ml-1">개</span></p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-2xl p-4 text-center border border-red-100 dark:border-red-900/30">
              <p className="text-xs text-red-500 font-bold mb-1">필요 매출액</p>
              <p className="text-xl font-black text-red-600 dark:text-red-400">{fmtNum(bepOrders * menuPrice)}<span className="text-sm font-bold ml-1">원</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* 목표 수익 시뮬레이터 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden mb-6">
        <div className="h-1 w-full bg-blue-500" />
        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-blue-500 w-5 h-5" />
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">시뮬레이터</p>
          </div>
          <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">목표 수익 달성 시뮬레이터</p>
          <p className="text-xs text-slate-500 mt-1">목표 월 순수익을 얻으려면 얼마나 팔아야 할까요?</p>
        </div>

        {/* 목표 바 차트 */}
        <div className="px-6 py-4">
          <div className="bg-slate-950 rounded-2xl p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={targetChartData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 'bold' }} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
                  {targetChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 커스텀 입력 */}
        <div className="px-6 pb-6 space-y-5">
          <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
            <label className="text-sm font-black text-slate-900 dark:text-white block mb-3">얼마를 벌고 싶으신가요?</label>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="relative flex-1 max-w-xs">
                <input
                  type="text"
                  value={customTargetProfit === 0 ? '' : fmtNum(customTargetProfit)}
                  onChange={(e) => setCustomTargetProfit(Number(e.target.value.replace(/[^0-9]/g, '')))}
                  className="w-full text-xl font-black h-14 pl-5 pr-12 border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-2xl focus:outline-none focus:border-blue-500 text-slate-900 dark:text-white transition-colors"
                  placeholder="순수익 입력"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">원</span>
              </div>
              <div className="flex gap-3 shrink-0">
                {[{ label: '300만', value: 3000000 }, { label: '500만', value: 5000000 }, { label: '1,000만', value: 10000000 }].map(p => (
                  <button
                    key={p.value}
                    onClick={() => setCustomTargetProfit(p.value)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-sm font-bold border transition-colors",
                      customTargetProfit === p.value
                        ? "bg-blue-500 text-white border-blue-500"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-500"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 결과 3칸 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-5 border border-blue-100 dark:border-blue-900/30">
              <p className="text-xs font-bold text-blue-500 mb-2">필요 매출액</p>
              <p className="text-xl font-black text-blue-700 dark:text-blue-400 leading-tight">{fmtNum(customTarget.revenue)}<span className="text-sm font-bold ml-1">원</span></p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500 mb-2">한 달 판매량</p>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">{fmtNum(customTarget.orders)}<span className="text-sm font-bold ml-1">개</span></p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-500 mb-2">하루 평균</p>
              <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">{fmtNum(customTarget.ordersPerDay)}<span className="text-sm font-bold ml-1">개</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          투자금 분배로
        </button>
        <button
          onClick={() => {
            setPhase2Data({ targetProfit: customTargetProfit, bepRevenue: bepOrders * menuPrice });
            onNext(customTargetProfit);
          }}
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black transition-all shadow-xl shadow-blue-500/20 hover:scale-105 active:scale-95"
        >
          다음 단계로
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};
