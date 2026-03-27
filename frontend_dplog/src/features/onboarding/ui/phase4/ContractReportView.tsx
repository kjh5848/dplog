import { motion } from 'framer-motion';
import { ShieldAlert, AlertCircle, CheckCircle2, ChevronRight, RefreshCw, FileText, Calendar, Hash, TrendingDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/button';
import { useState, useEffect } from 'react';

interface Props {
  onRetake: () => void;
}

const toxicClauses = [
  {
    id: 1,
    severity: 'danger', // red
    title: '포괄적 원상복구 의무',
    originalText: '"임차인은 임대차 목적물을 원상으로 회복하여 반환한다." (특약: 이전 임차인이 설치한 시설물 포함)',
    risk: '권리금을 주고 들어왔더라도, 퇴거 시 이전 세입자의 인테리어까지 모두 철거해야 하는 수천만 원의 원상복구 폭탄을 맞을 수 있습니다.',
    guide: '사장님, 원상복구의 범위를 "현 임차인이 설치한 시설물에 한함"으로 명시적으로 수정해달라고 강력히 요청하세요.',
  },
  {
    id: 2,
    severity: 'danger', // red
    title: '제소전 화해조서 강제',
    originalText: '"임차인은 임대인의 요구 시 제소전 화해조서 작성에 무조건 응해야 하며, 비용은 임차인이 부담한다."',
    risk: '월세가 단 2달만 밀려도 재판 없이 바로 명도(상가 퇴거) 집행을 당할 수 있는 건물주 절대 유리 조항입니다.',
    guide: '임차인에게도 유리한 환산보증금 이내 권리금 보호 규정 등 방어 조항을 화해조서 내용에 반드시 포함시키도록 협상해야 합니다.',
  },
  {
    id: 3,
    severity: 'warning', // yellow
    title: '모호한 임대료 인상 기준',
    originalText: '"물가 상승 및 주변 시세 변동에 따라 1년마다 임대료를 증액할 수 있다."',
    risk: '상가건물 임대차보호법상 5% 상한선이 존재하나, 기준이 모호하여 매년 인상 압박 및 분쟁의 불씨가 됩니다.',
    guide: '"상가건물 임대차보호법이 정한 상한 비율 내에서 상호 합리적 협의하에 조정한다"로 명확히 수정하세요.',
  }
];

export function ContractReportView({ onRetake }: Props) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  // 오늘 날짜 포맷팅
  const today = new Date();
  const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
  const reportId = `DPLOG-CTR-${today.getTime().toString().slice(-6)}`;

  return (
    <div className="min-h-screen bg-neutral-950 px-4 md:px-8 pt-6 pb-40 max-w-4xl mx-auto font-sans text-neutral-200">
      
      {/* Report Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-6 md:p-8 rounded-3xl bg-neutral-900 border border-neutral-800 shadow-xl relative overflow-hidden"
      >
        <div className="absolute -right-10 -bottom-10 opacity-[0.03] pointer-events-none">
          <FileText className="w-64 h-64 text-white" />
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 relative z-10 border-b border-neutral-800/80 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-sm text-xs font-bold font-mono border border-red-500/20">
                STRICTLY CONFIDENTIAL
              </span>
              <span className="bg-neutral-800 text-neutral-300 px-3 py-1 rounded-sm text-xs font-bold border border-neutral-700">
                상가 계약 법률 진단
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
              AI 계약서 리스크 분석 보고서
            </h1>
            <p className="text-neutral-400 font-medium text-sm md:text-base">
              업로드된 특약 및 계약 조항에 대한 AI 법률 위험도 교차 검증 결과
            </p>
          </div>
          
          <div className="flex flex-col gap-2 text-right text-xs md:text-sm text-neutral-400 font-mono bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/80 shrink-0">
            <div className="flex items-center justify-end gap-2">
              <Calendar className="w-4 h-4" />
              <span>발급일자: {formattedDate}</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Hash className="w-4 h-4" />
              <span>문서번호: {reportId}</span>
            </div>
            <div className="flex items-center justify-end gap-2 font-bold text-neutral-300">
              <ShieldAlert className="w-4 h-4" />
              <span>진단주체: D-PLOG 법무 분석 시스템</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            AI 종합 법률 소견
          </h3>
          <p className="text-neutral-300 leading-relaxed text-sm md:text-base">
            제출하신 계약서 초안을 분석한 결과, 임차인의 권리금 회수 기회를 원천 차단하거나 퇴거 시 수천만 원의 이중 부담을 지울 수 있는 <strong>치명적인 "독소조항" 3건</strong>이 발견되었습니다. 
            해당 특약들을 그대로 날인할 경우 상가임대차보호법의 보장 범위를 자발적으로 포기하는 결과로 이어질 위험이 매우 높습니다. 
            아래 가이드에 따라 가계약금 입금 전 반드시 공인중개사 및 임대인과 조항 수정을 강력히 협상하십시오.
          </p>
        </div>
      </motion.div>

      {/* Report Clauses */}
      <div className="space-y-6 max-w-3xl mx-auto">
        {toxicClauses.map((clause, index) => (
          <motion.div
            key={clause.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 + 0.3 }}
            className={`p-6 md:p-8 rounded-2xl border ${
              clause.severity === 'danger' 
                ? 'bg-red-950/20 border-red-500/30 shadow-lg shadow-red-900/10' 
                : 'bg-yellow-950/20 border-yellow-500/30'
            }`}
          >
            <div className="flex flex-col md:flex-row items-start gap-4">
              <div className={`mt-1 hidden md:block ${clause.severity === 'danger' ? 'text-red-500' : 'text-yellow-500'}`}>
                {clause.severity === 'danger' ? <AlertCircle size={28} /> : <AlertCircle size={28} />}
              </div>
              
              <div className="flex-1 space-y-5 w-full">
                {/* Title */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-sm ${
                      clause.severity === 'danger' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                    }`}>
                      {clause.severity === 'danger' ? '치명적 위험 특약' : '주의 요망 특약'}
                    </span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                    <div className={`md:hidden ${clause.severity === 'danger' ? 'text-red-500' : 'text-yellow-500'}`}>
                      <AlertCircle size={20} />
                    </div>
                    {clause.title}
                  </h3>
                </div>

                {/* Original Text */}
                <div className="p-4 bg-neutral-900/80 rounded-xl border border-neutral-800 text-sm md:text-base font-mono text-neutral-300 leading-relaxed shadow-inner">
                  <span className="text-neutral-500 mr-3 font-semibold bg-neutral-800 px-2 py-0.5 rounded-sm">문서상 원문</span>
                  {clause.originalText}
                </div>

                {/* Risk */}
                <div className="text-sm md:text-base text-neutral-300 leading-relaxed">
                  <span className="text-red-400 font-bold mb-1.5 block flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4" />
                    [AI 리스크 진단] 예상 피해 요약
                  </span>
                  {clause.risk}
                </div>

                {/* Guide */}
                <div className="p-5 bg-emerald-950/20 border border-emerald-500/20 rounded-xl mt-4">
                  <h4 className="flex items-center gap-2 text-emerald-400 font-bold text-sm md:text-base mb-3 border-b border-emerald-500/20 pb-2">
                    <CheckCircle2 size={18} /> 협상 솔루션 행동 지침
                  </h4>
                  <p className="text-sm md:text-base text-emerald-200/90 leading-relaxed">
                    {clause.guide}
                  </p>
                </div>
                
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Action Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-neutral-950 via-neutral-950 to-transparent flex justify-center items-center z-50 pointer-events-none"
      >
        <div className="w-full max-w-4xl flex gap-4 pointer-events-auto px-4 md:px-0">
          <Button 
            variant="outline" 
            onClick={onRetake}
            className="flex-1 bg-neutral-900 border-neutral-700 hover:bg-neutral-800 h-14 md:h-16 rounded-xl text-neutral-300 font-bold text-base transition-colors"
          >
            <RefreshCw size={20} className="mr-2" />
            특약 사진 다시 촬영하기
          </Button>
          <Button 
            onClick={() => router.push('/dashboard')}
            className="flex-[2] bg-white text-black hover:bg-neutral-200 h-14 md:h-16 rounded-xl font-bold text-base md:text-lg transition-colors shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            미션 완료 (대시보드로)
            <ChevronRight size={20} className="ml-2" />
          </Button>
        </div>
      </motion.div>

    </div>
  );
}
