'use client';

import React, { useEffect, useState } from 'react';
import { Search, Store as StoreIcon, Loader2 } from 'lucide-react';
import { useRankingViewModel, RealtimeRankTable } from '@/features/ranking';
import { useRouter } from 'next/navigation';
import * as storeApi from '@/entities/store/api/storeApi';
import type { Store as StoreType } from '@/entities/store/model/types';

export const RealtimeRankingDashboard = () => {
  const [stores, setStores] = useState<StoreType[]>([]);
  const router = useRouter();
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);
  const [isStoreLoading, setIsStoreLoading] = useState(true);

  useEffect(() => {
    storeApi.getMyStores().then((data) => {
      setStores(data);
      if (data.length > 0) {
        setSelectedStoreId(data[0].id);
      }
    }).catch(console.error)
    .finally(() => setIsStoreLoading(false));
  }, []);

  const {
    realtimeRanks,
    isLoadingRealtime,
    isRegistering,
    error,
    actions,
  } = useRankingViewModel(selectedStoreId);

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
            지역명이 포함된 키워드로 네이버 플레이스 실시간 노출 순위를 검색해보세요
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-bold">
          에러 발생: {String(error)}
        </div>
      )}

      {/* 내 가게 선택 콤보박스 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4">
        <StoreIcon className="size-5 text-slate-400" />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          기준 상점 선택
        </span>
        {isStoreLoading ? (
          <Loader2 className="size-4 animate-spin text-slate-400" />
        ) : (
          <select
            value={selectedStoreId}
            onChange={(e) => setSelectedStoreId(Number(e.target.value))}
            className="flex-1 max-w-sm bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
          >
            {stores.length === 0 && <option value={0}>등록된 상점이 없습니다</option>}
            {stores.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
            ))}
          </select>
        )}
      </div>
      
      {selectedStoreId > 0 && (() => {
        const selectedStore = stores.find(s => s.id === selectedStoreId);
        let shopIdFromUrl = selectedStoreId.toString();
        
        if (selectedStore?.placeUrl) {
          try {
            const parts = selectedStore.placeUrl.split('/');
            for (let i = 0; i < parts.length; i++) {
              if ((parts[i] === 'restaurant' || parts[i] === 'place') && i + 1 < parts.length) {
                shopIdFromUrl = parts[i + 1].split('?')[0]; // Query string 제거
                break;
              }
            }
          } catch (e) {
            // fallback
          }
        }

        return (
          <RealtimeRankTable
            ranks={realtimeRanks}
            isLoading={isLoadingRealtime}
            onSearch={(kw, prov) => {
              actions.fetchRealtime(kw, prov);
            }}
            isRegistering={isRegistering}
            onAddTracking={(kw, prov) => {
              // 백그라운드로 API 요청 (기다리지 않음)
              actions.registerTrack(kw, prov).catch(console.error);
              window.alert(`✅ '${kw}' 키워드 추적을 실행합니다!\n\n순위 대시보드로 이동합니다.`);
              router.push('/dashboard/ranking');
            }}
            myShopId={shopIdFromUrl}
          />
        );
      })()}
    </div>
  );
};
