import { useState, useEffect } from 'react';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { AlertCircle, ArrowRight, ArrowLeft, TrendingDown, CheckCircle2, AlertTriangle, ShieldAlert, FileText, Calendar, Hash } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface Phase2ReportViewProps {
  onNext: () => void;
  onBack: () => void;
}

export const Phase2ReportView = ({ onNext, onBack }: Phase2ReportViewProps) => {
  const { totalCapital, phase2Data } = useOnboardingStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const data = phase2Data || {
    depositAmt: 0,
    facilityAmt: 0,
    reserveAmt: 0,
    targetProfit: 0,
    bepRevenue: 0,
    totalInvestment: 0,
    paybackMonths: 0,
    monthlyPayback: 0,
    realNetProfit: 0,
  };

  const capital = totalCapital || 100000000;
  const reservePct = (data.reserveAmt / capital) * 100;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(val);
  };

  // 오늘 날짜 포맷팅
  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const reportId = `DPLOG-SIM-${today.getTime().toString().slice(-6)}`;

  return (
    <div className="w-full flex flex-col gap-8 pb-12 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Report Header */}
      <div className="max-w-4xl mx-auto w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl p-8 md:p-10 border-b-4 border-b-slate-900 dark:border-b-white shadow-sm relative overflow-hidden">
        {/* 워터마크 효과 */}
        <div className="absolute -right-10 -bottom-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <ShieldAlert className="w-64 h-64" />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-sm text-xs font-bold font-mono border border-red-200 dark:border-red-800/50">
                STRICTLY CONFIDENTIAL
              </span>
              <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-3 py-1 rounded-sm text-xs font-bold border border-slate-200 dark:border-slate-700">
                시뮬레이션 진단
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              재무 생존율 분석 보고서
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              D-PLOG AI 엔진 기반 창업 자본금 리스크 및 현금흐름 진단 결과
            </p>
          </div>
          
          <div className="flex flex-col gap-2 text-right text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-end gap-2">
              <Calendar className="w-4 h-4" />
              <span>발급일자: {formattedDate}</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Hash className="w-4 h-4" />
              <span>문서번호: {reportId}</span>
            </div>
            <div className="flex items-center justify-end gap-2 font-bold text-slate-700 dark:text-slate-300">
              <FileText className="w-4 h-4" />
              <span>진단주체: D-PLOG 생존 분석 시스템</span>
            </div>
          </div>
        </div>

        {/* AI 종합 소견 요약 */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            AI 종합 진단 소견
          </h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
            본 진단서는 입력된 자본금 <strong>{formatCurrency(capital)}원</strong>을 바탕으로 초도 창업 비용과 회수 기간을 시뮬레이션한 결과입니다.{' '}
            {data.reserveAmt < 0 
              ? "분석 결과, 명백한 '자본 잠식 예비 상태'입니다. 사업장 오픈 비용이 기 보유 자본을 초과하여 즉각적인 추가 자금 조달이나 계획의 전면 백지화가 요구됩니다." 
              : reservePct < 30 
                ? "분석 결과, 런웨이(Runway) 부족으로 인한 '초기 도산 리스크'가 감지되었습니다. 최소 6개월을 버틸 수 있는 운영 예비비 비율이 전체 자본의 30% 미만으로, 사소한 변수 에도 유동성 위기가 올 수 있습니다."
                : "분석 결과, 재무 안전성이 양호하게 확보되었습니다. 초기 침체기를 견딜 수 있는 여유 현금이 준비되어 있어, 상대적으로 낮은 스트레스 환경에서 영업에 집중할 수 있습니다."}
            <br/><br/>
            또한 목표 수익 달성 시, 매월 투자금 감가상각을 제외한 실질 가처분 현금흐름은 <strong>{formatCurrency(data.realNetProfit)}원</strong>으로 예측되며, 
            {data.realNetProfit <= 0 
              ? " 이는 심각한 현금흐름 경색을 시사합니다. 상가 계약 전 반드시 수익 모델 재검토가 필요합니다."
              : " 이는 비교적 건강한 자본 회수 사이클을 보여줍니다."}
          </p>
        </div>
      </div>

      {/* Main Report Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto px-4 md:px-0">
        
        {/* 1. 투자 및 예비비 현황 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-slate-800 dark:text-slate-200 text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="w-1.5 h-5 bg-blue-500 rounded-sm"></span>
              [SECTION 1] 런웨이 및 자산 분배 진단
            </h3>
            
            <div className="space-y-4 mb-6 mt-4">
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-slate-600 dark:text-slate-400">총 가용 자본금</span>
                <span className="font-bold">{formatCurrency(capital)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm md:text-base text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span>초기 투자 비용 (보증금+시설)</span>
                <span>-{formatCurrency(data.depositAmt + data.facilityAmt)}원</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                <span className="font-bold text-slate-700 dark:text-slate-200">산출된 운영 예비비</span>
                <span className={cn("font-black text-xl", data.reserveAmt < 0 ? "text-red-600" : (reservePct < 30 ? "text-orange-500" : "text-emerald-500"))}>
                  {formatCurrency(data.reserveAmt)}원
                </span>
              </div>
            </div>
          </div>
          
          <div className={cn("text-xs md:text-sm p-4 rounded-xl border flex items-start gap-3", 
            data.reserveAmt < 0 ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300" : 
            (reservePct < 30 ? "bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300" : 
            "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300")
          )}>
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>[리스크 평가]</strong><br/>
              {data.reserveAmt < 0 
                ? "자본 초과(Capital Deficit). 운영 예비비가 음수이므로, 개업 당일부터 임대료/소모품 지출이 불가능합니다." 
                : (reservePct < 30 
                  ? "유동성 경계(Liquidity Warning). 계획된 자본 내 예비비 비율이 낮아, 매출 저조 시 버틸 여력이 극히 제한됩니다." 
                  : "유동성 양호(Liquidity Safe). 초반 변동성을 흡수할 수 있는 안전 마진이 내재되어 있습니다.")}
            </div>
          </div>
        </div>

        {/* 2. 진짜 벌어가는 돈 (ROI 적용) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-slate-800 dark:text-slate-200 text-lg font-bold mb-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="w-1.5 h-5 bg-red-500 rounded-sm"></span>
              [SECTION 2] 감가상각 기반 실질 현금흐름
            </h3>
            
            <div className="space-y-4 mb-6 mt-4">
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-slate-600 dark:text-slate-400">목표 명목 월 수익</span>
                <span className="font-bold">{formatCurrency(data.targetProfit)}원</span>
              </div>
              <div className="flex justify-between items-center text-sm md:text-base text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span>추정 금융/감가 비용 (월 단위)</span>
                <span className="text-red-500">-{formatCurrency(data.monthlyPayback)}원</span>
              </div>
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/80 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mt-2">
                <span className="font-bold text-slate-700 dark:text-slate-200">실질 가처분 현금흐름</span>
                <span className={cn("font-black text-xl", data.realNetProfit <= 0 ? "text-red-600" : "text-emerald-500")}>
                  {formatCurrency(data.realNetProfit)}원
                </span>
              </div>
            </div>
          </div>

          <div className={cn("text-xs md:text-sm p-4 rounded-xl border flex items-start gap-3", 
            data.realNetProfit <= 0 ? "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300" : 
            "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300"
          )}>
            {data.realNetProfit <= 0 ? <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />}
            <div className="leading-relaxed">
              <strong>[수익성 평가]</strong><br/>
              {data.realNetProfit <= 0 
                ? "상각 후 이익 적자. 장부상으로 돈을 벌더라도 통장에는 돈이 마르는 '흑자부도' 구조에 가깝습니다. 목표액 재설정이 권고됩니다." 
                : "초과 수익 창출. 투자된 자본의 매몰 비용을 회수하고도 실제 생활 영위가 가능한 잉여 현금흐름이 창출됩니다."}
            </div>
          </div>
        </div>

      </div>
      
      {/* Disclaimer / Next Step Info */}
      <div className="max-w-4xl mx-auto w-full px-4 mt-4">
        <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400">
            NOTICE
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-loose">
            위 출력된 재무 보수 수치는 점포 임장 단계에서 결코 타협해서는 안 될 <strong>[방어 마지노선 데이터]</strong>입니다.<br/>
            막연한 기대감을 걷어낸 이 기준을 바탕으로, 다음 단계에서는 조작 불가능한 <strong>공공데이터 기반 상권 팩트체크</strong>를 수행하시기 바랍니다.
          </p>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="mt-8 pt-6 pb-12 flex justify-between items-center w-full max-w-4xl mx-auto px-4 z-10">
        <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            ROI 계산기
        </button>
        <button
            onClick={onNext}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-black font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">상권 분석 잠금 해제하기</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </div>
  );
};
