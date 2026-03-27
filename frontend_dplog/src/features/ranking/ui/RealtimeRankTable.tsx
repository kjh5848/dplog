'use client';

import React, { useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Star,
  Heart,
  MessageSquare,
  BookOpen,
  Crown,
  Loader2,
} from 'lucide-react';
import type { RealtimeRank } from '../model/types';

/**
 * 실시간 순위 테이블
 *
 * 키워드+지역으로 검색하면 네이버 플레이스 경쟁 가게 20개 리스트를 표시합니다.
 * 내 가게는 파란색으로 하이라이트됩니다.
 */

interface RealtimeRankTableProps {
  /** 실시간 순위 데이터 */
  ranks: RealtimeRank[];
  /** 로딩 상태 */
  isLoading: boolean;
  /** 검색 실행 콜백 */
  onSearch: (keyword: string, province: string) => void;
  /** 내 가게 shopId (하이라이트 용) */
  myShopId?: string;
}

/** 지역 선택 옵션 */
const PROVINCES = [
  '서울', '경기', '인천', '부산', '대구', '대전',
  '광주', '울산', '세종', '강원', '충북', '충남',
  '전북', '전남', '경북', '경남', '제주',
];

/** 스켈레톤 로우 */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-md w-full max-w-[80px]" />
      </td>
    ))}
  </tr>
);

/** 순위 뱃지 */
const RankBadge = ({ rank }: { rank: number }) => (
  <div
    className={cn(
      'inline-flex items-center justify-center size-8 rounded-lg font-bold text-sm',
      rank <= 3
        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
        : rank <= 5
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
          : rank <= 10
            ? 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-slate-400'
            : 'text-slate-500 dark:text-slate-500',
    )}
  >
    {rank <= 3 && <Crown className="size-3 mr-0.5 inline" />}
    {rank}
  </div>
);

export const RealtimeRankTable = ({
  ranks,
  isLoading,
  onSearch,
  myShopId,
}: RealtimeRankTableProps) => {
  const [keyword, setKeyword] = useState('');
  const [province, setProvince] = useState('서울');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onSearch(keyword.trim(), province);
  };

  return (
    <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden shadow-sm">
      {/* 헤더 + 검색폼 */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.06]">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          실시간 순위 조회
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          키워드로 네이버 플레이스 실시간 순위를 확인하세요
        </p>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색 키워드 입력 (예: 강남맛집)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
            />
          </div>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none cursor-pointer"
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={isLoading || !keyword.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            검색
          </button>
        </form>
      </div>

      {/* 테이블 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-white/[0.02] text-left">
              <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider w-16">
                순위
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                가게명
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
                카테고리
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider text-center">
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="size-3" />
                  방문자리뷰
                </span>
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider text-center">
                <span className="inline-flex items-center gap-1">
                  <BookOpen className="size-3" />
                  블로그리뷰
                </span>
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider text-center">
                <span className="inline-flex items-center gap-1">
                  <Star className="size-3" />
                  별점
                </span>
              </th>
              <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider text-center">
                <span className="inline-flex items-center gap-1">
                  <Heart className="size-3" />
                  저장
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
            ) : ranks.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-16 text-center text-slate-400 dark:text-slate-500 text-sm"
                >
                  <MapPin className="size-8 mx-auto mb-3 opacity-30" />
                  키워드를 입력하고 검색 버튼을 눌러주세요
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {ranks.map((shop, idx) => {
                  const isMyShop = myShopId && shop.shopId === myShopId;
                  return (
                    <motion.tr
                      key={shop.shopId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className={cn(
                        'transition-colors',
                        isMyShop
                          ? 'bg-blue-50/80 dark:bg-blue-500/10 border-l-4 border-l-blue-500'
                          : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]',
                      )}
                    >
                      <td className="px-4 py-3">
                        <RankBadge rank={shop.rank} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {shop.shopImageUrl && (
                            <img
                              src={shop.shopImageUrl}
                              alt={shop.shopName}
                              className="size-9 rounded-lg object-cover border border-slate-200 dark:border-white/10"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <p
                              className={cn(
                                'font-semibold text-sm',
                                isMyShop
                                  ? 'text-blue-700 dark:text-blue-400'
                                  : 'text-slate-900 dark:text-white',
                              )}
                            >
                              {shop.shopName}
                              {isMyShop && (
                                <span className="ml-2 text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                                  내 가게
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[200px]">
                              {shop.roadAddress || shop.address}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">
                          {shop.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {shop.visitorReviewCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {shop.blogReviewCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                          <Star className="size-3.5 fill-current" />
                          {shop.scoreInfo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-sm text-rose-500 dark:text-rose-400">
                          <Heart className="size-3.5" />
                          {shop.saveCount}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* 푸터 */}
      {ranks.length > 0 && (
        <div className="px-6 py-3 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span>전체 {ranks[0]?.totalCount?.toLocaleString() ?? 0}개 결과 중 상위 {ranks.length}개</span>
        </div>
      )}
    </div>
  );
};
