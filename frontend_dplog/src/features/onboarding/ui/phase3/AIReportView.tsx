import { AlertTriangle, MapPin, CheckCircle2, TrendingDown, Target, Building2, ShieldAlert, Calendar, Hash, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/lib/utils';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { useState, useEffect } from 'react';

export const AIReportView = () => {
  const targetAudience = useOnboardingStore((state) => state.targetAudience);
  const mainItem = useOnboardingStore((state) => state.mainItem);

  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // 오늘 날짜 포맷팅
  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const reportId = `DPLOG-LOC-${today.getTime().toString().slice(-6)}`;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col pt-8 pb-32 px-4 md:px-0 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Target Area Badges */}
      <div className="flex flex-wrap items-center gap-2 mb-6 px-4 md:px-0">
        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 px-3 py-1 rounded-sm text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5" />
          분석 지역: 강남구 역삼1동 (테헤란로 이면도로)
        </span>
        <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-sm text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          설정 타겟: {targetAudience}
        </span>
        <span className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-sm text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          업종: {mainItem}
        </span>
      </div>

      {/* Report Header */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl p-8 md:p-10 border-b-4 border-b-slate-900 dark:border-b-white shadow-sm relative overflow-hidden mb-6">
        {/* 워터마크 효과 */}
        <div className="absolute -right-10 -bottom-10 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
          <MapPin className="w-64 h-64" />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-sm text-xs font-bold font-mono border border-red-200 dark:border-red-800/50">
                STRICTLY CONFIDENTIAL
              </span>
              <span className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-3 py-1 rounded-sm text-xs font-bold border border-slate-200 dark:border-slate-700">
                입지 타당성 진단
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
              AI 상권 & 입지 진단 보고서
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              공공데이터(KR-소상공인시장진흥공단) 기반 상권 적합도 교차 검증 결과
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
              <span>진단주체: D-PLOG 상권 분석 시스템</span>
            </div>
          </div>
        </div>

        {/* AI 종합 소견 요약 */}
        <div className="bg-slate-50 dark:bg-slate-800/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            AI 상권 적합성 종합 소견
          </h3>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
            분석 대상 지역인 <strong>'강남구 역삼1동 이면도로'</strong>와 사장님이 설정하신 <strong>{mainItem}</strong> 업종, 그리고 주 타겟인 <strong>{targetAudience}</strong> 간의 교차 분석 결과, 심각한 데이터 불일치가 발견되었습니다. 
            해당 권역은 주말에 주력 타겟층이 대규모로 이탈하는 전형적인 오피스 상권의 특성을 띠며, 현재 동종 업계의 과도한 밀집도로 인해 출혈 경쟁이 극심한 상태입니다. 
            현 입지를 선택할 경우 초기 마케팅 비용이 기하급수적으로 증가할 수 있으며, 버티기 전략(Survival Mode)에 돌입할 확률이 매우 높습니다.
          </p>
        </div>
      </div>

      {/* Extreme Warning Box */}
      <div className="bg-red-50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/50 rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl pointer-events-none">
          <AlertTriangle className="w-32 h-32 text-red-600" />
        </div>
        <div className="relative z-10">
          <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 text-red-800 dark:text-red-400 mb-5 border-b border-red-200/50 pb-4">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            [경고] 치명적 위험 요인: 타겟 미스매치 (Red Ocean)
          </h2>
          <p className="text-red-700 dark:text-red-300 font-medium leading-relaxed mb-6 text-sm md:text-base">
            원하시는 입지는 데이터상 분명한 <strong className="font-black bg-red-200 dark:bg-red-900/50 px-1">{mainItem} 업종의 좀비 상권</strong>으로 분류됩니다.
            최대 체류를 유도해야 할 주 타겟의 주말 유동 인구가 반경 500m 내에서 <strong>평일 대비 82% 이탈</strong>합니다.
          </p>
          <div className="bg-white/70 dark:bg-black/30 p-5 rounded-xl text-xs md:text-sm text-red-900 dark:text-red-200 border border-red-200/50 flex flex-col gap-3">
            <div className="flex justify-between items-center border-b border-red-200/50 pb-3">
              <span className="font-bold shrink-0">경쟁점 (반경 500m 내)</span>
              <span className="font-black text-red-600 text-sm md:text-base">현재 47곳 무한 경쟁 중</span>
            </div>
            <div className="flex justify-between items-center border-b border-red-200/50 pb-3">
              <span className="font-bold shrink-0">1년 내 폐업률 통계</span>
              <span className="font-black text-red-600 text-sm md:text-base">41.2% (지역 평균 1.8배 상회)</span>
            </div>
            <div className="flex justify-between items-center pb-1">
              <span className="font-bold shrink-0">메인 타겟({targetAudience}) 결제 비중</span>
              <span className="font-black text-red-600 text-sm md:text-base">전체 매출의 단 14%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 px-4 md:px-0">
        {/* Card 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="bg-orange-100 text-orange-600 dark:bg-orange-900/20 p-3 rounded-xl shrink-0 h-fit border border-orange-200 dark:border-orange-800/50">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">상가 계약서 지뢰 구간 알림</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                해당 입지의 권리금 호가 평균은 <strong className="text-orange-600 dark:text-orange-400">약 8,500만원</strong>으로 형성되어 있으나, 최근 3개월간 실제 거래된 바닥 권리금은 <strong className="text-orange-600 dark:text-orange-400">0원~2,000만원</strong> 선에서 처참하게 붕괴되고 있습니다. 브로커의 "권리금 금방 회수해요"라는 감언이설을 객관적 지표로 방어하십시오.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex gap-4">
            <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/20 p-3 rounded-xl shrink-0 h-fit border border-blue-200 dark:border-blue-800/50">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-800 pb-2">최종 행동 지침 (Action Item)</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                현재 계획하신 자본금과 {targetAudience} 타겟으로는 이 위치를 백지화하시는 것이 <strong>생존 확률을 70% 이상</strong> 극적으로 반등시킵니다. 만약 강행하신다면, 주말 장사를 포기하고 주중 점심시간 직장인을 타겟으로 한 초극강 가성비 점심 메뉴(객단가 8,000원 이하) 기획이 강제됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Notice & Next Action */}
      <div className="px-4 md:px-0 flex flex-col items-center gap-6 mt-2">
        <div className="w-full text-center p-5 bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-sm md:text-base relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-400">
            D-PLOG DATA LAB
          </div>
          상단 리포트는 <strong>{mainItem}</strong> 아이템을 강남구 역삼동 오피스 상권에 오픈하려 할 때 겪는 누적 실패 사례 데이터를 종합하여 생성된 MVP 데모(Option A)입니다.
        </div>
        
        <Button 
          onClick={() => router.push('/phase4-roadmap')}
          className="w-full max-w-md bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-14 text-lg font-bold shadow-lg shadow-indigo-500/20 mt-4 group transition-all"
        >
          다음 단계: 창업 생존 로드맵 수립
        </Button>
      </div>

    </div>
  );
};
