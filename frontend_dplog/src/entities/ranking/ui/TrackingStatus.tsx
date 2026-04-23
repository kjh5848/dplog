'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { CheckCircle2, Clock, Loader2 } from 'lucide-react';
import type { TrackState } from '../model/types';

/**
 * 트래킹 수집 상태 표시
 *
 * 순위 데이터 수집 완료 진척도를 프로그레스 바로 표시합니다.
 */

interface TrackingStatusProps {
  /** 트래킹 상태 */
  trackState: TrackState | null;
  /** 로딩 상태 */
  isLoading: boolean;
}

export const TrackingStatus = ({ trackState, isLoading }: TrackingStatusProps) => {
  if (!trackState) {
    return (
      <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-32 mb-3" />
        <div className="h-2.5 bg-slate-200 dark:bg-white/10 rounded-full w-full" />
      </div>
    );
  }

  const { totalCount, completedCount, completedKeywords } = trackState;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  // isLoading이 켜져있다면, 과거 캐시(5/5)가 있더라도 아직 완료된 것이 아닙니다.
  const isComplete = !isLoading && (completedCount === totalCount);

  if (totalCount === 0) return null;

  return (
    <div
      className={cn(
        'rounded-2xl border p-4 transition-all',
        isLoading
          ? 'bg-blue-50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/15'
          : isComplete
          ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/15'
          : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06]',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Loader2 className="size-4 text-blue-500 animate-spin" />
          )}
          <span
            className={cn(
              'text-sm font-bold',
              isComplete
                ? 'text-emerald-700 dark:text-emerald-400'
                : 'text-slate-700 dark:text-slate-300',
            )}
          >
            {isComplete ? '데이터 수집 완료' : '데이터 수집 중...'}
          </span>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          {isLoading ? (
            <span className="inline-flex items-center gap-1"><Loader2 className="size-3 animate-spin"/> {totalCount}개 탐색중</span>
          ) : (
            `${completedCount}/${totalCount}`
          )}
        </span>
      </div>

      {/* 프로그레스 바 */}
      <div className="relative h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        {isLoading ? (
          <div className="absolute top-0 left-0 h-full w-full bg-blue-500/50 rounded-full animate-pulse" />
        ) : (
          <div
            className={cn(
              'h-full rounded-full transition-all duration-700 ease-out',
              isComplete
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500',
            )}
            style={{ width: `${progress}%` }}
          />
        )}
      </div>

      {/* 완료된 키워드 태그 */}
      {completedKeywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {completedKeywords.map((kw, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400"
            >
              <CheckCircle2 className="size-2.5 text-emerald-500" />
              {kw.keyword}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
