'use client';

import React, { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Plus, MapPin, Loader2 } from 'lucide-react';

/**
 * 트래킹 등록/삭제 관리 컴포넌트
 *
 * 키워드 + 지역을 입력하여 트래킹을 등록합니다.
 */

interface TrackingManagerProps {
  /** 현재 등록된 수 */
  currentCount: number;
  /** 최대 등록 수 */
  maxCount?: number;
  /** 등록 중 상태 */
  isRegistering: boolean;
  /** 등록 콜백 */
  onRegister: (keyword: string, province: string) => void;
}

/** 지역 옵션 */
const PROVINCES = [
  '서울', '경기', '인천', '부산', '대구', '대전',
  '광주', '울산', '세종', '강원', '충북', '충남',
  '전북', '전남', '경북', '경남', '제주',
];

export const TrackingManager = ({
  currentCount,
  maxCount = 10,
  isRegistering,
  onRegister,
}: TrackingManagerProps) => {
  const [keyword, setKeyword] = useState('');
  const [province, setProvince] = useState('서울');
  const isFull = currentCount >= maxCount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || isFull) return;
    onRegister(keyword.trim(), province);
    setKeyword('');
  };

  return (
    <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            키워드 트래킹 등록
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            순위를 추적할 키워드를 등록하세요
          </p>
        </div>
        <span
          className={cn(
            'text-xs font-bold px-2.5 py-1 rounded-full',
            isFull
              ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
              : 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400',
          )}
        >
          {currentCount}/{maxCount}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={isFull ? '최대 등록 수에 도달했습니다' : '키워드 입력'}
            disabled={isFull}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          disabled={isFull}
          className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isRegistering || !keyword.trim() || isFull}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-lg shadow-blue-600/20 whitespace-nowrap"
        >
          {isRegistering ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          등록
        </button>
      </form>
    </div>
  );
};
