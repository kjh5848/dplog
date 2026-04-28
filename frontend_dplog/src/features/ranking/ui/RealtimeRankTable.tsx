'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/shared/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  TrendingUp,
  MapPin,
  Star,
  Crown,
  Loader2,
  ExternalLink,
  Globe,
  MousePointerClick,
  Lightbulb
} from 'lucide-react';
import type { RealtimeRank } from '@/entities/ranking/model/types';

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
  onSearch: (keyword: string, province: string, lat?: number, lon?: number) => void;
  /** 내 가게 shopId (하이라이트 용) */
  myShopId?: string;
  /** 트래킹 명단에 추가 콜백 */
  onAddTracking?: (keyword: string, province: string) => void;
  /** 트래킹 추가 진행 상태 여부 */
  isRegistering?: boolean;
}

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
            : 'bg-slate-700 text-white dark:bg-slate-600 shadow-md',
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
  onAddTracking,
  isRegistering,
}: RealtimeRankTableProps) => {
  const [keyword, setKeyword] = useState('');
  const [selectedStore, setSelectedStore] = useState<RealtimeRank | null>(null);

  // 로컬 스토리지에서 초기 검색어 복원
  useEffect(() => {
    if (myShopId) {
      const savedKw = localStorage.getItem(`dplog_rt_kw_${myShopId}`);
      if (savedKw) setKeyword(savedKw);
    }
  }, [myShopId]);

  // 검색 시 선택된 상점 초기화
  useEffect(() => {
    setSelectedStore(null);
  }, [ranks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onSearch(keyword.trim(), '');
  };

  return (
    <div className="bg-white dark:bg-white/[0.02] rounded-2xl border border-slate-200 dark:border-white/[0.06] overflow-hidden shadow-sm">
      {/* 헤더 + 검색폼 */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-white/[0.06]">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          실시간 순위 조회
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          키워드로 네이버 플레이스 실시간 순위를 확인하세요
        </p>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색 키워드 입력 (예: 연산동 한식, 부산 돼지국밥)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
            />
          </div>

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

        <div className="mt-4 bg-blue-50/80 dark:bg-blue-500/10 rounded-2xl p-4 sm:p-5 border border-blue-100/50 dark:border-blue-500/20">
           <h4 className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2">
             <Lightbulb className="size-4" /> 알아두면 좋은 검색 꿀팁
           </h4>
           <ul className="space-y-2 text-[13px] text-blue-600/80 dark:text-blue-400/80 ml-6 list-disc">
             <li><strong className="font-semibold text-blue-800 dark:text-blue-300">지역명이 포함된 검색어</strong>를 입력하세요. 네이버 검색 결과의 지역 의도에 맞춰 순위를 확인합니다.</li>
           </ul>
        </div>

        {ranks.length > 0 && onAddTracking && (
          <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 bg-gradient-to-r from-indigo-50/80 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/10 border border-indigo-100 dark:border-indigo-800/30 rounded-2xl gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl shadow-sm border border-indigo-200/50 dark:border-indigo-500/30">
                <TrendingUp className="size-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">현재 검색된 키워드를 즉시 추적할까요?</h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">대시보드에 등록하여 매일 자동으로 내 가게의 순위 변동을 모니터링합니다.</p>
              </div>
            </div>
            <button
              onClick={() => onAddTracking(keyword, '')}
              disabled={isRegistering}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0"
            >
              {isRegistering ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-1.5"><TrendingUp className="size-4" /> 추적 명단에 추가하기</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* 2열 스플릿 뷰 컨테이너 (좌측 리스트 / 우측 미리보기) */}
      <div className="flex flex-col lg:flex-row bg-slate-50/50 dark:bg-white/[0.01] min-h-[600px]">
        {/* 좌측 1열: 리스트 (스크롤) */}
        <div className="w-full lg:w-[55%] border-r border-slate-100 dark:border-white/[0.04] h-[800px] overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col gap-3 p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.01]">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 h-24 flex gap-4">
                 <div className="size-16 bg-slate-200 dark:bg-white/10 rounded-xl shrink-0" />
                 <div className="flex-1 space-y-3 py-1">
                   <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-1/3" />
                   <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
                   <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-3/4" />
                 </div>
              </div>
            ))}
          </div>
        ) : ranks.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <div className="size-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
              <MapPin className="size-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">검색 결과가 없습니다.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">상단 검색창에서 키워드를 입력하고 검색해주세요.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 p-5 sm:p-6 bg-slate-50/50 dark:bg-white/[0.01] overflow-x-auto">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-200 dark:border-slate-800">
               <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  전체 매장 <span className="text-blue-600 dark:text-blue-400">{ranks[0]?.totalCount || ranks.length}</span>건
               </span>
               <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                 * 네이버 모바일 플레이스 자연 노출 순위
               </span>
            </div>
            <AnimatePresence>
              {ranks.map((shop, idx) => {
                const isMyShop = myShopId && shop.shopId === myShopId;
                return (
                  <motion.div
                    key={shop.shopId}
                    onClick={() => setSelectedStore(shop)}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5), duration: 0.3 }}
                    className={cn(
                      'group relative p-3 sm:p-4 rounded-2xl border transition-all duration-300 hover:shadow-md min-w-full cursor-pointer', // min-w-[500px] 제거하고 부모 컨테이너에 맞춤
                      selectedStore?.shopId === shop.shopId
                        ? 'bg-blue-50/50 dark:bg-blue-900/30 border-blue-400 dark:border-blue-500 scale-[1.01] shadow-lg ring-1 ring-blue-400/50'
                        : isMyShop
                          ? 'bg-blue-50/20 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/50'
                    )}
                  >
                    {/* 내 가게 뱃지 플로팅 */}
                    {isMyShop && (
                      <div className="absolute -top-3 -right-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-black shadow-lg shadow-blue-500/30 z-10 flex items-center gap-1">
                        <Star className="size-3 fill-white" />
                        내 가게
                      </div>
                    )}
                    
                    <div className="flex items-start gap-4 h-full">
                      {/* 순위 및 이미지 */}
                      <div className="relative shrink-0">
                        {shop.shopImageUrl ? (
                          <img
                            src={shop.shopImageUrl}
                            alt={shop.shopName}
                            className="size-[72px] sm:size-20 rounded-xl object-cover border border-slate-100 dark:border-slate-800"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YxZjVmOSIgLz48L3N2Zz4=';
                            }}
                          />
                        ) : (
                          <div className="size-[72px] sm:size-20 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <MapPin className="size-6 text-slate-300 dark:text-slate-600" />
                          </div>
                        )}
                        
                        {/* 랭크 순위 뱃지 */}
                        <div className="absolute -bottom-2 -left-2 z-10">
                          <RankBadge rank={shop.rank} />
                        </div>
                      </div>

                      {/* 정보 영역 */}
                      <div className="flex-1 min-w-0 py-0.5 relative pr-4">
                        <div className="flex items-center gap-2 mb-1.5">
                           <h4 className={cn(
                             "text-sm sm:text-base font-bold truncate transition-colors w-full",
                             isMyShop ? "text-blue-800 dark:text-blue-400" : "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-amber-400"
                           )}
                           title={shop.shopName}>
                             {shop.shopName}
                           </h4>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-1.5 mb-2">
                          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-white/5">
                            {shop.category || '기타'}
                          </span>
                          
                          {shop.scoreInfo && shop.scoreInfo !== '없음' && (
                            <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-200/50 dark:border-amber-500/20">
                              <Star className="size-3 fill-amber-500/80" />
                              {shop.scoreInfo}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] sm:text-[12px] text-slate-400 dark:text-slate-500 leading-snug line-clamp-2 mt-auto">
                          {shop.roadAddress || shop.address}
                        </p>
                      </div>
                      
                      {/* 가게 바로가기 링크 버튼 */}
                      <div className="flex items-center pl-4 border-l border-slate-100 dark:border-slate-800 ml-auto shrink-0">
                        {shop.placeUrl ? (
                          <a
                            href={shop.placeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <span className="hidden sm:inline">네이버 보기</span>
                            <span>👉</span>
                          </a>
                        ) : (
                          <div className="p-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 text-xs font-bold whitespace-nowrap">
                            링크 탐색 중
                          </div>
                        )}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

        {/* 우측 2열: 네이버 플레이스 미리보기 (Sticky 고정) */}
        <div className="hidden lg:block w-[45%] h-[800px] sticky top-0 bg-white dark:bg-[#0b1120]">
          {selectedStore ? (
            <div className="w-full h-full flex flex-col">
              {/* 상단 툴바 */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedStore.shopName}
                  </span>
                  {selectedStore.rank && (
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-bold">
                      {selectedStore.rank}위
                    </span>
                  )}
                </div>
                {selectedStore.placeUrl && (
                  <a 
                    href={selectedStore.placeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 transition-colors font-semibold shadow-sm"
                  >
                    <span>새 창으로 열기</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
              {/* Iframe View */}
              {selectedStore.placeUrl ? (
                <iframe
                  src={selectedStore.placeUrl}
                  className="w-full flex-1 border-none bg-slate-50 dark:bg-slate-900/50"
                  title="Naver Place Preview"
                  loading="lazy"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <Globe className="size-10 mb-3 opacity-20" />
                  <p className="text-sm">링크 정보가 없습니다.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-900/20">
              <div className="size-16 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center mb-4">
                <MousePointerClick className="size-8 text-blue-400 opacity-60" />
              </div>
              <p className="font-semibold text-slate-500 dark:text-slate-400">가게를 선택해보세요</p>
              <p className="text-sm mt-1">좌측 리스트에서 카드를 클릭하면 상세 정보가 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>

      {/* 푸터 */}
      {ranks.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-center sm:justify-start">
          <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            전체 {ranks[0]?.totalCount?.toLocaleString() ?? 0}개 결과 중 상위 {ranks.length}개 표출
          </div>
        </div>
      )}
    </div>
  );
};
