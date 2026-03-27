import { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCcw, 
  HandCoins, 
  Building2, 
  Wallet, 
  BookOpen, 
  Pencil, 
  Check, 
  Briefcase, 
  Paintbrush, 
  Refrigerator, 
  PlusCircle,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CapitalDistributorViewProps {
  onNext: () => void;
  onBack: () => void;
}

export const CapitalDistributorView = ({ onNext, onBack }: CapitalDistributorViewProps) => {
  const { totalCapital, setTotalCapital, setPhase2Data } = useOnboardingStore();
  const capital = totalCapital || 100000000;

  const [currentStep, setCurrentStep] = useState(0);
  const [isEditingCapital, setIsEditingCapital] = useState(false);
  const [tempCapital, setTempCapital] = useState(capital);

  useEffect(() => {
    setTempCapital(capital);
  }, [capital]);

  const [depositAmt, setDepositAmt] = useState<number>(0);
  const [premiumAmt, setPremiumAmt] = useState<number>(0);
  const [interiorAmt, setInteriorAmt] = useState<number>(0);
  const [equipmentAmt, setEquipmentAmt] = useState<number>(0);
  const [etcAmt, setEtcAmt] = useState<number>(0);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const totalUsed = depositAmt + premiumAmt + interiorAmt + equipmentAmt + etcAmt;
  const reserveAmt = capital - totalUsed;
  const reservePct = (reserveAmt / capital) * 100;

  const getPct = (amt: number) => (amt / capital) * 100;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(val) + '원';
  };

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, 6));
  const prevStep = () => {
    if (currentStep === 0) onBack();
    else setCurrentStep(s => s - 1);
  };

  if (!isMounted) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div 
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold">STEP 1. 자본금 확인</span>
              <h3 className="text-xl md:text-2xl font-black">가진 총알(자본금)을 다시 한번 확인해 볼까요?</h3>
              <p className="text-slate-500 text-sm">사업을 시작할 때 동원 가능한 최대 금액을 입력해 주세요.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 border-2 border-blue-100 dark:border-blue-900/30 rounded-3xl p-8 shadow-xl flex flex-col items-center gap-6">
              <div className="text-4xl md:text-5xl font-black text-blue-600 dark:text-blue-400">
                {isEditingCapital ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={tempCapital === 0 ? '' : new Intl.NumberFormat('ko-KR').format(tempCapital)}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, '');
                        setTempCapital(parseInt(rawValue || '0', 10));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setTotalCapital(tempCapital);
                          setIsEditingCapital(false);
                        }
                      }}
                      className="w-48 md:w-64 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl text-right outline-none ring-2 ring-blue-500"
                    />
                    <span className="text-2xl">원</span>
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setIsEditingCapital(true)}
                  >
                    <span>{formatCurrency(capital)}</span>
                    <Pencil className="w-6 h-6 text-slate-300" />
                  </div>
                )}
              </div>
              
              {isEditingCapital && (
                <Button 
                  onClick={() => {
                    setTotalCapital(tempCapital);
                    setIsEditingCapital(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 rounded-xl"
                >
                  저장하기
                </Button>
              )}
              
              {!isEditingCapital && (
                <p className="text-slate-400 text-sm">금액을 클릭하면 수정할 수 있어요</p>
              )}
            </div>
          </motion.div>
        );
      case 1:
        return (
          <InputStep 
            key="step1"
            title="임대 보증금을 얼마를 예상하시나요?"
            description="가장 큰 몫을 차지하는 보증금부터 시작해 봅시다."
            icon={Building2}
            iconColor="text-blue-500"
            value={depositAmt}
            onChange={setDepositAmt}
            placeholder="예: 3,000만"
            formatCurrency={formatCurrency}
            advice={{
              avgRange: "2,000만 ~ 1억 원",
              tip: "월 임대료의 10~20배가 일반적인 보증금 수준입니다. 상권이 좋을수록 보증금이 높습니다.",
              warning: "보증금은 나중에 돌려받는 돈이지만, 묶여 있는 동안엔 내 자본이라 생각해야 합니다.",
              benchmark: [
                { label: "소규모 (10평 이하)", value: "1,000~3,000만" },
                { label: "중소형 (20~30평)", value: "3,000만~7,000만" },
                { label: "대형 (30평 이상)", value: "7,000만~1억+" },
              ]
            }}
          />
        );
      case 2:
        return (
          <InputStep 
            key="step2"
            title="권리금은 얼마인가요?"
            description="상권의 가치에 따라 이전 주인에게 지불하는 비용입니다."
            icon={HandCoins}
            iconColor="text-amber-500"
            value={premiumAmt}
            onChange={setPremiumAmt}
            placeholder="무권리라면 0을 입력하세요"
            formatCurrency={formatCurrency}
            advice={{
              avgRange: "0원 ~ 5,000만 원",
              tip: "권리금은 법적 보호가 약합니다. 나중에 돌려받지 못할 수 있는 '매몰비용'으로 생각하세요.",
              warning: "이미 매출이 증명된 자리라면 투자 가치가 있지만, 신규 상권은 무권리 협상이 가능합니다.",
              benchmark: [
                { label: "신규 상권 (매출 無)", value: "0원 (무권리)" },
                { label: "일반 상권 (매출 有)", value: "1,000~3,000만" },
                { label: "핵심 상권 (A급)", value: "3,000만~1억+" },
              ]
            }}
          />
        );
      case 3:
        return (
          <InputStep 
            key="step3"
            title="인테리어 비용은 얼마나 생각하시나요?"
            description="철거부터 간판까지, 내 가게의 얼굴을 만드는 비용입니다."
            icon={Paintbrush}
            iconColor="text-emerald-500"
            value={interiorAmt}
            onChange={setInteriorAmt}
            placeholder="평당 150~300만 원 수준"
            formatCurrency={formatCurrency}
            advice={{
              avgRange: "평당 150만 ~ 300만 원",
              tip: "요식업 평균은 평당 200만 원 수준입니다. 프리미엄 컨셉은 300만 원+, 셀프 인테리어는 50~100만 원까지 낮출 수 있습니다.",
              warning: "인테리어는 투자금 회수가 어렵고 감가상각이 빠릅니다. 과도한 투자보다 운영 자금에 여유를 두는 게 현명합니다.",
              benchmark: [
                { label: "셀프 인테리어", value: "50~100만/평" },
                { label: "일반 시공", value: "150~200만/평" },
                { label: "프리미엄 시공", value: "250~400만/평" },
              ]
            }}
          />
        );
      case 4:
        return (
          <InputStep 
            key="step4"
            title="주방 집기 및 홀 가구 비용은요?"
            description="냉장고, 포스기, 테이블 등 장사에 필요한 도구들입니다."
            icon={Refrigerator}
            iconColor="text-indigo-500"
            value={equipmentAmt}
            onChange={setEquipmentAmt}
            placeholder="직접 입력해 보세요"
            formatCurrency={formatCurrency}
            advice={{
              avgRange: "500만 ~ 3,000만 원",
              tip: "중고 집기를 활용하면 비용을 50~70% 절감할 수 있습니다. 황학동, 당근마켓을 적극 활용하세요.",
              warning: "POS 시스템, 냉장고, 조리 기구는 필수입니다. 홀 가구는 렌탈도 고려해보세요.",
              benchmark: [
                { label: "카페 (소규모)", value: "700~1,500만" },
                { label: "식당 (일반)", value: "1,000~2,500만" },
                { label: "주방 장비 많은 업종", value: "2,000~4,000만" },
              ]
            }}
          />
        );
      case 5:
        return (
          <InputStep 
            key="step5"
            title="기타 예상되는 초기 비용이 있나요?"
            description="프랜차이즈 가맹비, 교육비, 마케팅 첫 달 예산 등입니다."
            icon={PlusCircle}
            iconColor="text-slate-500"
            value={etcAmt}
            onChange={setEtcAmt}
            placeholder="없으면 0원"
            formatCurrency={formatCurrency}
            advice={{
              avgRange: "0원 ~ 1,000만 원",
              tip: "오픈 초반 SNS 광고비, 쿠팡이츠/배달의민족 첫 달 광고비, 사업자 등록 및 허가 비용 등을 포함하세요.",
              warning: "프랜차이즈라면 가맹비·교육비·로열티도 이 항목에 포함됩니다. 계약서를 꼼꼼히 확인하세요.",
              benchmark: [
                { label: "개인 창업", value: "100~300만" },
                { label: "프랜차이즈 가맹비", value: "500만~3,000만" },
                { label: "오픈 마케팅 예산", value: "50~200만" },
              ]
            }}
          />
        );
      case 6:
        return (
          <motion.div 
            key="step6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-5"
          >
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-bold">FINAL. 결과 확인</span>
              <h3 className="text-xl md:text-2xl font-black">자금 배분이 완료되었습니다!</h3>
              <p className="text-slate-500 text-sm">가장 중요한 '생존 예비비'를 확인하고 다음 단계로 넘어가세요.</p>
            </div>

            {/* 생존 예비비 결과 카드 */}
            <div className={cn(
              "p-6 rounded-3xl border-2 transition-all duration-500 flex flex-col gap-4",
              reserveAmt < 0 ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50" :
              reservePct < 30 ? "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50" : 
              "bg-slate-900 border-slate-800 text-white"
            )}>
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={cn("size-6", reserveAmt < 0 ? "text-red-500" : reservePct < 30 ? "text-amber-500" : "text-green-400")} />
                    <span className="font-bold">생존 예비비 (남은 금액)</span>
                  </div>
                  <h4 className={cn("text-3xl md:text-4xl font-black", reserveAmt < 0 ? "text-red-600" : reservePct < 30 ? "text-amber-600" : "text-white")}>
                    {formatCurrency(reserveAmt)}
                  </h4>
                </div>
                <div className={cn("px-4 py-1.5 rounded-full text-sm font-black", 
                   reserveAmt < 0 ? "bg-red-100 text-red-700" : reservePct < 30 ? "bg-amber-100 text-amber-700" : "bg-white/10 text-white"
                )}>
                  {reservePct.toFixed(1)}%
                </div>
              </div>

              <div className={cn("p-4 rounded-2xl text-sm leading-relaxed", 
                reserveAmt < 0 ? "bg-red-100/50 text-red-800 dark:bg-red-900/20 dark:text-red-300" : 
                reservePct < 30 ? "bg-amber-100/50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300" : 
                "bg-white/5 text-slate-300"
              )}>
                {reserveAmt < 0 
                  ? "경고: 예산이 초과되었습니다! 자본금보다 많은 돈을 지출할 수는 없습니다. 항목을 다시 조정해 주세요."
                  : reservePct < 30 
                    ? "주의: 예비비가 30% 미만입니다. 초기 6개월간의 적자를 버틸 힘이 부족할 수 있습니다."
                    : "안전: 든든한 예비비가 확보되었습니다. 예기치 못한 상황에도 침착하게 대응할 수 있는 수준입니다."}
              </div>
            </div>

            {/* 예비비 어드바이스 박스 */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
              <div className="h-1 w-full bg-blue-500" />
              <div className="px-6 pt-5 pb-2">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">왜 예비비 30%인가요?</p>
                <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">총 자본금의 30% 이상을 유지하세요</p>
              </div>
              <div className="px-6 py-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">오픈 후 손익분기 도달 평균</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-0.5 rounded-xl">3~6개월</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">월 예상 적자 (초기 3개월)</span>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-0.5 rounded-xl">월 매출의 20~40%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">폐업 원인 1위</span>
                  <span className="text-sm font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-3 py-0.5 rounded-xl">운전자금 소진</span>
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 space-y-2.5">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">초기 창업자의 80%는 오픈 6개월 안에 예비비 부족으로 위기를 맞습니다. 예비비는 가게가 궤도에 오르기 전까지 버티는 '생존 산소통'입니다.</p>
                {reservePct < 30 && reserveAmt >= 0 && (
                  <p className="text-xs text-rose-500 leading-relaxed font-medium">현재 예비비({reservePct.toFixed(0)}%)가 권장 기준(30%) 미만입니다. 다음 단계로 진행은 가능하지만, 운전자금이 부족하면 폐업 위험이 높아집니다. 항목 조정을 권장합니다.</p>
                )}
              </div>
            </div>

            {/* 항목 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <SummaryChip icon={Building2} label="보증금" value={depositAmt} color="blue" />
              <SummaryChip icon={HandCoins} label="권리금" value={premiumAmt} color="amber" />
              <SummaryChip icon={Paintbrush} label="인테리어" value={interiorAmt} color="emerald" />
              <SummaryChip icon={Refrigerator} label="집기/가구" value={equipmentAmt} color="indigo" />
              <SummaryChip icon={PlusCircle} label="기타" value={etcAmt} color="slate" />
              <button 
                onClick={() => setCurrentStep(1)}
                className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-600 hover:border-slate-400 transition-all text-sm font-bold"
              >
                <RefreshCcw className="size-4" /> 다시 배분하기
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto pb-12">
      {/* 예산 현황 카드 */}
      <div className="sticky top-0 z-20 pt-4 px-4 pb-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl px-5 py-4">
          {/* 스텝 + 남은 예산 */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2.5">
              <div className="size-8 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-black font-black text-sm shrink-0">
                {currentStep + 1}
              </div>
              <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Step {currentStep + 1} of 7</span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">남은 예산</p>
              <p className={cn("text-base font-black tabular-nums", reserveAmt < 0 ? "text-red-500" : "text-slate-900 dark:text-white")}>
                {formatCurrency(reserveAmt)}
              </p>
            </div>
          </div>

          {/* 예산 바 */}
          <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <BarPart amt={depositAmt} total={capital} color="bg-blue-500" />
            <BarPart amt={premiumAmt} total={capital} color="bg-amber-400" />
            <BarPart amt={interiorAmt} total={capital} color="bg-emerald-500" />
            <BarPart amt={equipmentAmt} total={capital} color="bg-indigo-500" />
            <BarPart amt={etcAmt} total={capital} color="bg-slate-400" />
            {reserveAmt < 0 && (
              <div className="absolute inset-0 bg-red-500/30 animate-pulse rounded-full" />
            )}
          </div>


          {/* 범례 */}
          <div className="flex gap-4 mt-3 overflow-x-auto no-scrollbar whitespace-nowrap">
            <Legend color="bg-blue-500" label="보증금" />
            <Legend color="bg-amber-400" label="권리금" />
            <Legend color="bg-emerald-500" label="인테리어" />
            <Legend color="bg-indigo-500" label="집기" />
            <Legend color="bg-slate-400" label="기타" />
            <Legend color="bg-slate-100" label="예비비" />
          </div>
        </div>
      </div>


      <div className="px-4 mt-8">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 dark:from-zinc-950 via-slate-50/90 dark:via-zinc-950/90 to-transparent z-30 pointer-events-none">
        <div className="max-w-2xl mx-auto flex justify-between items-center pointer-events-auto">
          <button
            onClick={prevStep}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 bg-white/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 font-bold transition-all"
          >
            <ArrowLeft className="size-5" />
            이전으로
          </button>
          
          {currentStep < 6 ? (
            <button
              onClick={nextStep}
              className="flex items-center justify-center gap-2 px-10 py-4 rounded-2xl font-black transition-all shadow-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black hover:scale-105 active:scale-95 shadow-slate-900/20"
            >
              다음 단계
              <ArrowRight className="size-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setPhase2Data({ 
                  depositAmt, 
                  premiumAmt, 
                  interiorAmt, 
                  equipmentAmt, 
                  etcAmt,
                  facilityAmt: premiumAmt + interiorAmt + equipmentAmt + etcAmt,
                  reserveAmt 
                });
                onNext();
              }}
              disabled={reserveAmt < 0}
              className={cn(
                "flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-black transition-all shadow-xl",
                reserveAmt < 0 
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-500 text-white hover:scale-105 active:scale-95 shadow-blue-500/30"
              )}
            >
              <TrendingUp className="size-5" />
              마진율 계산하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const BarPart = ({ amt, total, color }: { amt: number; total: number; color: string }) => {
  const pct = Math.min((amt / total) * 100, 100);
  if (pct === 0) return null;
  return (
    <div 
      className={cn(color, "h-full transition-all duration-500 border-r border-white/10 last:border-0")}
      style={{ width: `${pct}%` }}
    />
  );
};

const Legend = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1.5 shrink-0">
    <div className={cn("size-2 rounded-full", color)}></div>
    <span className="text-[10px] font-bold text-slate-400">{label}</span>
  </div>
);

const SummaryChip = ({ icon: Icon, label, value, color }: any) => {
  const colorMap: any = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30",
    slate: "bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400 border-slate-100 dark:border-slate-800"
  };
  return (
    <div className={cn("p-4 rounded-2xl border flex flex-col gap-2", colorMap[color])}>
      <div className="flex items-center gap-2 opacity-70">
        <Icon className="size-4" />
        <span className="text-xs font-bold">{label}</span>
      </div>
      <div className="text-sm font-black truncate">
        {new Intl.NumberFormat('ko-KR').format(value)}원
      </div>
    </div>
  );
};

const InputStep = ({ title, description, icon: Icon, iconColor, value, onChange, placeholder, formatCurrency, advice }: any) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    onChange(parseInt(rawValue || '0', 10));
  };
  const addValue = (val: number) => onChange((p: number) => p + val);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div className="text-center space-y-2 px-4">
        <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight">{title}</h3>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>

      {/* 어드바이스 박스 */}
      {advice && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          {/* 상단 파란 포인트 바 */}
          <div className="h-1 w-full bg-blue-500" />

          <div className="px-6 pt-5 pb-2">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">시장 평균</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{advice.avgRange}</p>
          </div>

          {/* 벤치마크 행 */}
          <div className="px-6 py-4 space-y-3">
            {advice.benchmark.map((b: any, i: number) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-slate-500 dark:text-slate-400">{b.label}</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-3 py-0.5 rounded-xl">{b.value}</span>
              </div>
            ))}
          </div>

          {/* 팁·주의 */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 space-y-2.5">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{advice.tip}</p>
            <p className="text-xs text-rose-500 leading-relaxed">{advice.warning}</p>
          </div>
        </div>
      )}




      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl relative group">
        <div className={cn("absolute -top-4 left-1/2 -translate-x-1/2 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md", iconColor)}>
          <Icon className="size-6" />
        </div>
        
        <div className="mt-4 space-y-8">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 text-3xl md:text-4xl font-black border-b-4 border-slate-100 dark:border-slate-800 focus-within:border-blue-500 transition-colors pb-2">
              <input 
                type="text" 
                autoFocus
                value={value === 0 ? '' : new Intl.NumberFormat('ko-KR').format(value)}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="w-48 md:w-64 text-right bg-transparent outline-none placeholder:text-slate-200 dark:placeholder:text-slate-800"
              />
              <span className="text-slate-400">원</span>
            </div>
            {value > 0 && (
              <p className="text-blue-500 font-bold text-sm bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full animate-in fade-in zoom-in">
                {formatCurrency(value)}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[100, 500, 1000].map(val => (
               <button 
                  key={val}
                  onClick={() => addValue(val * 10000)} 
                  className="py-3 px-2 md:px-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all font-bold text-slate-600 dark:text-slate-400 text-xs md:text-sm whitespace-nowrap active:scale-95"
               >
                 +{val}만
               </button>
            ))}
          </div>

          <button 
            onClick={() => onChange(0)}
            className="w-full flex items-center justify-center gap-2 py-3 text-slate-400 hover:text-red-500 transition-colors text-xs font-bold"
          >
            <RefreshCcw className="size-3.5" /> 금액 초기화
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const Button = ({ children, onClick, className, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={cn("px-4 py-2 transition-all active:scale-95 disabled:opacity-50", className)}
  >
    {children}
  </button>
);
