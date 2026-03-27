'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { useRankingViewModel } from '../model/useRankingViewModel';
import { RealtimeRankTable } from './RealtimeRankTable';

export const RealtimeRankingDashboard = () => {
  const {
    realtimeRanks,
    isLoadingRealtime,
    actions,
  } = useRankingViewModel(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-500/10">
          <Search className="size-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            실시간 순위 조회
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            특정 키워드와 플레이스 URL로 실시간 노출 순위를 검색해보세요
          </p>
        </div>
      </div>
      
      <RealtimeRankTable
        ranks={realtimeRanks}
        isLoading={isLoadingRealtime}
        onSearch={actions.fetchRealtime}
      />
    </div>
  );
};
