'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  RefreshCw,
  Tag,
  MapPin,
  Loader2,
} from 'lucide-react';
import type { TrackInfo } from '../model/types';

/**
 * 키워드 트래킹 카드 그리드
 *
 * 등록된 트래킹 키워드를 카드로 표시하고, 삭제 기능을 제공합니다.
 */

interface TrackingCardGridProps {
  /** 트래킹 정보 목록 */
  trackInfoList: TrackInfo[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 삭제 콜백 */
  onDelete: (trackInfoId: number) => void;
  /** 삭제 진행 중인 ID */
  deletingId?: number | null;
  /** 수동 갱신 콜백 */
  onRefresh?: (trackInfoId: number) => void;
  /** 갱신 진행 중인 ID */
  refreshingId?: number | null;
}

/** 순위 변동 인디케이터 */
const RankChangeIndicator = ({ change }: { change: number }) => {
  if (change === 999) {
    return (
      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg w-fit">
        <TrendingUp className="size-3.5" />
        <span className="text-xs font-bold">신규 진입</span>
      </div>
    );
  }
  if (change === -999) {
    return (
      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg w-fit">
        <TrendingDown className="size-3.5" />
        <span className="text-xs font-bold">순위권 밖</span>
      </div>
    );
  }
  if (change > 0) {
    return (
      <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="size-4" />
        <span className="text-sm font-bold">+{change}</span>
      </div>
    );
  }
  if (change < 0) {
    return (
      <div className="flex items-center gap-1 text-red-500 dark:text-red-400">
        <TrendingDown className="size-4" />
        <span className="text-sm font-bold">{Math.abs(change)}계단 하락</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
      <Minus className="size-4" />
      <span className="text-sm">변동 없음</span>
    </div>
  );
};

/** 스켈레톤 카드 */
const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-white/[0.06] p-5 animate-pulse bg-white dark:bg-white/[0.02]">
    <div className="flex justify-between mb-3">
      <div className="h-5 bg-slate-200 dark:bg-white/5 rounded w-20" />
      <div className="size-5 bg-slate-200 dark:bg-white/5 rounded" />
    </div>
    <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-16 mb-2" />
    <div className="h-6 bg-slate-200 dark:bg-white/5 rounded w-12" />
  </div>
);

export const TrackingCardGrid = ({
  trackInfoList,
  isLoading,
  onDelete,
  deletingId,
  onRefresh,
  refreshingId,
}: TrackingCardGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (trackInfoList.length === 0) {
    return (
      <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-8 text-center">
        <Tag className="size-8 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          등록된 트래킹 키워드가 없습니다
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          아래에서 키워드를 등록하세요 (최대 10개)
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
      <AnimatePresence>
        {trackInfoList.map((info, idx) => (
          <motion.div
            key={info.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className={cn(
              'relative group rounded-2xl border p-4 transition-all',
              'bg-white dark:bg-white/[0.02]',
              'border-slate-200 dark:border-white/[0.06]',
              'hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/20',
            )}
          >
            {/* 액션 버튼 그룹 */}
            <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {onRefresh && (
                <button
                  onClick={() => onRefresh(info.id)}
                  disabled={refreshingId === info.id}
                  className="size-6 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-500"
                  title="순위 실시간 새로고침"
                >
                  {refreshingId === info.id ? (
                    <Loader2 className="size-3 animate-spin text-blue-500" />
                  ) : (
                    <RefreshCw className="size-3" />
                  )}
                </button>
              )}
              <button
                onClick={() => onDelete(info.id)}
                disabled={deletingId === info.id}
                className="size-6 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center transition-colors hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-500"
                title="트래킹 삭제"
              >
                {deletingId === info.id ? (
                  <Loader2 className="size-3 animate-spin text-red-500" />
                ) : (
                  <X className="size-3" />
                )}
              </button>
            </div>

            {/* 키워드 */}
            <p className="font-bold text-sm text-slate-900 dark:text-white mb-1 pr-6">
              {info.keyword}
            </p>

            {/* 지역 */}
            <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 mb-3">
              <MapPin className="size-3" />
              {info.province}
            </div>

            {/* 순위 변동 */}
            <RankChangeIndicator change={info.rankChange} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
