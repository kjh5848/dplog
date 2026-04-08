'use client';

import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  Globe,
  MousePointerClick
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
  onSearch: (keyword: string, province: string, lat?: number, lon?: number) => void;
  /** 내 가게 shopId (하이라이트 용) */
  myShopId?: string;
  /** 트래킹 명단에 추가 콜백 */
  onAddTracking?: (keyword: string, province: string) => void;
  /** 트래킹 추가 진행 상태 여부 */
  isRegistering?: boolean;
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
  const [province, setProvince] = useState('서울');
  const [selectedStore, setSelectedStore] = useState<RealtimeRank | null>(null);

  // 검색 시 선택된 상점 초기화
  useEffect(() => {
    setSelectedStore(null);
  }, [ranks]);

  const [lat, setLat] = useState<number | undefined>();
  const [lon, setLon] = useState<number | undefined>();
  const [isLocating, setIsLocating] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    onSearch(keyword.trim(), province, lat, lon);
  };

  const findClosestProvince = (lat: number, lon: number): string => {
    const provinceCoords: Record<string, [number, number]> = {
      '서울': [37.5665, 126.9780],
      '경기': [37.2636, 127.0286], // 수원 기준
      '인천': [37.4563, 126.7052],
      '부산': [35.1796, 129.0756],
      '대구': [35.8714, 128.6014],
      '대전': [36.3504, 127.3845],
      '광주': [35.1595, 126.8526],
      '울산': [35.5384, 129.3114],
      '세종': [36.4800, 127.2890],
      '강원': [37.8813, 127.7298], // 춘천 기준
      '충북': [36.6356, 127.4913], // 청주 기준
      '충남': [36.6588, 126.6728], // 내포 기준
      '전북': [35.8242, 127.1480], // 전주 기준
      '전남': [34.8161, 126.4629], // 무안 기준
      '경북': [36.5760, 128.5056], // 안동 기준
      '경남': [35.2383, 128.6922], // 창원 기준
      '제주': [33.4890, 126.4983],
    };

    let closest = '서울';
    let minDistance = Infinity;

    for (const [prov, [pLat, pLon]] of Object.entries(provinceCoords)) {
      // 단순 유클리디안 거리 (정밀 역지오코딩 없이 가장 가까운 도심을 찾음)
      const dist = Math.pow(lat - pLat, 2) + Math.pow(lon - pLon, 2);
      if (dist < minDistance) {
        minDistance = dist;
        closest = prov;
      }
    }
    return closest;
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("브라우저가 위치 정보를 지원하지 않습니다.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = pos.coords.latitude;
        const newLon = pos.coords.longitude;
        setLat(newLat);
        setLon(newLon);
        setIsLocating(false);
        
        // GPS 좌표 기반으로 가장 가까운 지역(도/광역시) 자동 매핑
        const detectedProvince = findClosestProvince(newLat, newLon);
        setProvince(detectedProvince);
        
        alert(`현재 위치 정보(${detectedProvince} 인근)가 반영되었습니다! 이제 검색 버튼을 누르시면 해당 위치 기준 순위가 조회됩니다.`);
      },
      (err) => {
        setIsLocating(false);
        alert("위치 정보를 가져오는데 실패했습니다: " + err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
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
          {/* 드롭다운 왼쪽(앞쪽)으로 이동 */}
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocating}
              className={cn(
                "px-3 py-2.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 transition-all text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 shrink-0",
                lat ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30" : "bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10"
              )}
            >
              {isLocating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
              {lat ? "위치 적용됨" : "내 위치"}
            </button>
            <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-[100px] sm:w-28 shrink-0 px-2 sm:px-4 py-2.5 rounded-xl bg-slate-50 font-semibold dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none cursor-pointer"
          >
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          </div>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="검색 키워드 입력 (예: 강남 빵집)"
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
             <li><strong className="font-semibold text-blue-800 dark:text-blue-300">지역명이 포함된 검색어</strong> (예: "강남 맛집", "부산 돼지국밥")를 입력하시면 네이버 지도가 알아서 그쪽을 비춰줘요!</li>
             <li><strong className="font-semibold text-blue-800 dark:text-blue-300">지역명이 빠진 키워드</strong> (예: "마라탕", "필라테스")를 검색하실 때만 위 [내 위치] 콤보박스를 조정해주세요.</li>
           </ul>
        </div>
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
                        
                        {/* 랭크 오버레이 뱃지 (광고/일반 분기) */}
                        <div className="absolute -bottom-2 -left-2 z-10">
                           {shop.isAd ? (
                             <div className="bg-slate-800 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-md border border-slate-700">
                               AD 광고
                             </div>
                           ) : (
                             <RankBadge rank={shop.rank} />
                           )}
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
        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 dark:text-slate-500">
            <span>전체 {ranks[0]?.totalCount?.toLocaleString() ?? 0}개 결과 중 상위 {ranks.length}개 표출</span>
          </div>
          {onAddTracking && (
            <button
              onClick={() => onAddTracking(keyword, province)}
              disabled={isRegistering}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/20 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
            >
              {isRegistering ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <TrendingUp className="size-4" />
              )}
              👉 이 키워드를 추적 명단에 추가하기
            </button>
          )}
        </div>
      )}
    </div>
  );
};
