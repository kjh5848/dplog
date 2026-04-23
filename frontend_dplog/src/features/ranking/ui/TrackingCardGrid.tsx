'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { TrackInfo } from '@/entities/ranking/model/types';
import { TrackingCard } from '@/entities/ranking/ui/TrackingCard';

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
  /** 낙관적 UI 업데이트용 대기 목록 */
  pendingKeywords?: { id: number; keyword: string; province: string }[];
  /** 삭제 콜백 */
  onDelete: (trackInfoId: number) => void;
  /** 수정 콜백 */
  onEdit?: (trackInfoId: number, newKeyword: string, province?: string) => void;
  /** 삭제 진행 중인 ID */
  deletingId?: number | null;
}

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
  pendingKeywords = [],
  isLoading,
  onDelete,
  onEdit,
  deletingId,
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

  if (trackInfoList.length === 0 && pendingKeywords.length === 0) {
    return (
      <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-8 text-center">
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
          <TrackingCard
            key={info.id}
            info={info}
            index={idx}
            onDelete={onDelete}
            onEdit={onEdit}
            isDeleting={deletingId === info.id}
          />
        ))}
        {pendingKeywords.map((pending) => (
          <motion.div
            key={`pending-${pending.id}`}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="rounded-2xl border border-blue-200 dark:border-blue-500/30 p-4 bg-blue-50/50 dark:bg-blue-900/10 flex flex-col justify-center gap-3 relative overflow-hidden"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/5 to-transparent animate-[shimmer_1.5s_infinite]" />
            <div className="flex justify-between items-center z-10 w-full mb-1 pr-1">
                <span className="font-bold text-sm text-blue-700 dark:text-blue-400">{pending.keyword}</span>
                <Loader2 className="size-4 animate-spin text-blue-500" />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-600/80 dark:text-blue-300/80 font-semibold z-10 mt-1">
                순위 데이터 수집 중...
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
