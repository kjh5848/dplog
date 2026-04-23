'use client';

import React, { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { Plus, MapPin, Loader2, Info } from 'lucide-react';

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
  /** 전체 수동 갱신콜백 */
  onRefreshAll?: () => void;
  /** 전체 수동 갱신 상태 */
  isRefreshingAll?: boolean;
  /** 쿨다운 남은 시간 (ms) */
  cooldownRemaining?: number;
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
  onRefreshAll,
  isRefreshingAll = false,
  cooldownRemaining = 0,
}: TrackingManagerProps) => {
  const [keyword, setKeyword] = useState('');
  const [province, setProvince] = useState('서울');
  const isFull = currentCount >= maxCount;

  const isCooldown = cooldownRemaining > 0;
  const cooldownMinutes = Math.ceil(cooldownRemaining / (1000 * 60));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || isFull) return;
    onRegister(keyword.trim(), province);
    setKeyword('');
  };

  return (
    <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              키워드 트래킹 등록
            </h3>
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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            순위를 추적할 키워드를 등록하세요
          </p>
        </div>
        
        {/* 전체 추적 시작 버튼 (크기 대폭 확대) */}
        <div className="relative group flex items-center w-full md:w-auto">
          <button
            onClick={onRefreshAll}
            disabled={isRefreshingAll || isCooldown}
            className={`flex w-full md:w-auto justify-center items-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-black transition-all border shadow-sm
              ${isRefreshingAll || isCooldown
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500 border-blue-200 dark:border-blue-500/20 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-tr from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 hover:shadow-lg hover:-translate-y-0.5 border-transparent'}`}
          >
            {isRefreshingAll ? (
              <Loader2 className="size-5 animate-spin" />
            ) : isCooldown ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.1-8.52L2.5 9"/></svg>
            )}
            {isRefreshingAll 
              ? '데이터 전체 수집 중...' 
              : isCooldown 
                ? `${cooldownMinutes}분 후 갱신 가능` 
                : '전체 추적 시작'}
          </button>
          
          {/* Tooltip */}
          <div className="absolute right-0 top-full mt-3 w-72 p-3.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs leading-snug shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
            <div className="absolute -top-1.5 right-8 w-3 h-3 bg-slate-800 dark:bg-slate-700 rotate-45" />
            <div className="flex items-start gap-2.5 relative">
              <Info className="size-4 shrink-0 text-blue-400 mt-0.5" />
              <p className="flex flex-col gap-1">
                <span>안전한 데이터 수집을 위해 <strong>수동 갱신은 3시간 간격</strong>으로 제한됩니다.</span>
                <span className="text-blue-300">💡 단, 매일 <strong>낮 12시(정오)</strong>가 되면 황금시간대 수집을 위해 제한이 <strong>즉시 해제</strong>됩니다.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-5">
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
        {/* 지역 선택 숨김 처리 (사용자 요청) */}
        {/*
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
        */}
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
