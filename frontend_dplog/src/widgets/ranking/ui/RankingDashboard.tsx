'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { RefreshCw, AlertCircle, BarChart3, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { useRankingViewModel, TrackingCardGrid, TrackingManager } from '@/features/ranking';
import { TrackingStatus } from '@/entities/ranking';

// 성능 최적화: 번들 크기 축소를 위해 무거운 Recharts 기반 차트 컴포넌트를 동적 로딩합니다.
// (Vercel Best Practice: bundle-dynamic-imports)
const RankingChart = dynamic(
  () => import('@/entities/ranking').then((mod) => mod.RankingChart),
  { ssr: false, loading: () => <div className="h-64 flex items-center justify-center text-slate-400">Loading chart...</div> }
);

/**
 * 순위 대시보드 컨테이너
 *
 * 모든 순위 관련 섹션을 조합한 메인 컨테이너입니다.
 * 구성:
 *  1. 헤더 (타이틀 + 새로고침)
 *  2. 트래킹 상태 바
 *  3. 트래킹 관리 (등록)
 *  4. 키워드 트래킹 카드 그리드
 *  5. 30일 순위 차트
 *  6. 실시간 순위 테이블
 */

interface RankingDashboardProps {
  /** 가게 ID (기본값: 목데이터용 1) */
  storeId?: number;
  /** 내 가게 shopId (실시간 순위 하이라이트용) */
  myShopId?: string;
}

export const RankingDashboard = ({
  storeId = 1,
}: RankingDashboardProps) => {
  const {
    trackInfoList,
    chartData,
    trackState,
    chartInterval,
    isLoadingTrack,
    isLoadingChart,
    isRegistering,
    cooldownRemaining,
    isRefreshingAll,
    error,
    pendingKeywords,
    actions,
  } = useRankingViewModel(storeId);

  return (
    <div className="space-y-6">
      {/* ─── 헤더 ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-500/10">
              <BarChart3 className="size-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                순위 대시보드
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                네이버 플레이스 키워드별 순위를 추적하고 분석하세요
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 에러 메시지 ──────────────────────────────────── */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/15 flex items-center gap-3">
          <AlertCircle className="size-5 text-red-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              오류 발생
            </p>
            <p className="text-xs text-red-500 dark:text-red-400/80 mt-0.5">
              {error}
            </p>
          </div>
          <button
            onClick={actions.clearError}
            className="text-sm text-red-600 hover:text-red-700 font-bold underline shrink-0"
          >
            닫기
          </button>
        </div>
      )}

      {/* ─── 트래킹 상태 ──────────────────────────────────── */}
      <TrackingStatus trackState={trackState} isLoading={isLoadingTrack} />

      {/* ─── 트래킹 관리 ──────────────────────────────────── */}
      <TrackingManager
        currentCount={trackInfoList.length}
        maxCount={10}
        isRegistering={isRegistering}
        onRegister={actions.registerTrack}
        onRefreshAll={actions.refreshAll}
        isRefreshingAll={isRefreshingAll}
        cooldownRemaining={cooldownRemaining}
      />

      {/* ─── 키워드 트래킹 카드 ──────────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          트래킹 키워드
        </h2>
        <TrackingCardGrid
          trackInfoList={trackInfoList}
          pendingKeywords={pendingKeywords}
          isLoading={isLoadingTrack}
          onDelete={actions.deleteTrack}
          onEdit={actions.editTrack}
        />
      </div>

      {/* ─── 90일 순위 차트 ──────────────────────────────── */}
      <RankingChart 
        chartData={chartData} 
        isLoading={isLoadingChart}
        chartInterval={chartInterval}
        setChartInterval={actions.setChartInterval} 
      />
    </div>
  );
};
