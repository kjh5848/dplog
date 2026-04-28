import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Loader2,
  Clock,
  Pencil,
} from 'lucide-react';
import type { TrackInfo } from '../model/types';

/** 순위 변동 인디케이터 (내부 컴포넌트) */
const RankChangeIndicator = ({ change }: { change: number }) => {
  if (change === 999) {
    return (
      <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg w-fit">
        <TrendingUp className="size-3.5" />
        <span className="text-xs font-bold tracking-tight">신규 진입</span>
      </div>
    );
  }

  if (change === 0) {
    return (
      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 px-2 py-1 rounded-lg w-fit">
        <Minus className="size-3.5" />
        <span className="text-xs font-bold tracking-tight">변동 없음</span>
      </div>
    );
  }

  const isUp = change > 0;
  return (
    <div
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded-lg w-fit',
        isUp
          ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
          : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
      )}
    >
      {isUp ? (
        <TrendingUp className="size-3.5" />
      ) : (
        <TrendingDown className="size-3.5" />
      )}
      <span className="text-xs font-bold tracking-tight">
        {Math.abs(change)}계단 {isUp ? '상승' : '하락'}
      </span>
    </div>
  );
};

interface TrackingCardProps {
  info: TrackInfo;
  isDeleting?: boolean;
  onDelete?: (id: number) => void;
  onEdit?: (id: number, newKw: string) => void;
  index?: number;
}

export const TrackingCard = ({ info, isDeleting, onDelete, onEdit, index = 0 }: TrackingCardProps) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editKeyword, setEditKeyword] = React.useState(info.keyword);

  const handleEditSubmit = () => {
    if (editKeyword.trim() && editKeyword !== info.keyword) {
      onEdit?.(info.id, editKeyword.trim());
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      key={info.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'relative group rounded-2xl border p-4 transition-all',
        'bg-white dark:bg-white/[0.02]',
        'border-slate-200 dark:border-white/[0.06]',
        'hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/20',
      )}
    >
      {/* 액션 버튼 그룹 (항상 보이도록 수정) */}
      <div className="absolute top-3 right-3 flex items-center gap-1 opacity-100 transition-opacity z-20">
        {onEdit && (
          <button
            onClick={() => setIsEditing(true)}
            className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors hover:bg-blue-50 dark:hover:bg-blue-500/20 hover:text-blue-500 shadow-sm"
            title="키워드 수정"
          >
            <Pencil className="size-3 text-slate-500 dark:text-slate-400" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(info.id)}
            disabled={isDeleting}
            className="size-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-colors hover:bg-red-50 dark:hover:bg-red-500/20 hover:text-red-500 shadow-sm"
            title="트래킹 삭제"
          >
            {isDeleting ? (
              <Loader2 className="size-3.5 animate-spin text-red-500" />
            ) : (
              <X className="size-3.5 text-slate-500 dark:text-slate-400" />
            )}
          </button>
        )}
      </div>

      {/* 키워드 */}
      {isEditing ? (
        <div className="flex gap-1 pr-14 mb-1">
          <input
            value={editKeyword}
            onChange={(e) => setEditKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
            onBlur={handleEditSubmit}
            className="text-sm font-bold bg-slate-100 dark:bg-slate-800 border-none rounded px-2 w-full text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
        </div>
      ) : (
        <p 
          className="font-bold text-sm text-slate-900 dark:text-white mb-1 pr-14 cursor-pointer hover:text-blue-500 transition-colors"
          onDoubleClick={() => setIsEditing(true)}
          title="더블클릭하여 수정"
        >
          {info.keyword}
        </p>
      )}

      {/* 지역 및 갱신 시간 */}
      <div className="flex flex-col gap-1.5 mb-3">
        {/* 지역 표시 숨김 (사용자 요청)
        <div className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
          <MapPin className="size-3" />
          {info.province}
        </div>
        */}
        {info.lastTrackedAt && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400/80 dark:text-slate-500/80">
            <Clock className="size-2.5" />
            {info.lastTrackedAt}
          </div>
        )}
      </div>

      {/* 메트릭 박스 */}
      <div className="flex items-end gap-2.5 mt-2">
        <div className="flex items-baseline gap-0.5">
           {info.totalCount === 0 ? (
             <span className="text-sm font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-2 py-1 rounded-md border border-red-100 dark:border-red-500/20">
               검색결과 0건 (오타 의심)
             </span>
           ) : info.currentRank && info.currentRank > 0 ? (
             <>
               <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
                 {info.currentRank}
               </span>
               <span className="text-xs font-bold text-slate-500 dark:text-slate-400">위</span>
             </>
           ) : (
             <span className="text-sm font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
               이탈
             </span>
           )}
        </div>
        {info.totalCount !== 0 && (
          <div className="pb-[2px]">
            <RankChangeIndicator change={info.rankChange} />
          </div>
        )}
      </div>
    </motion.div>
  );
};
