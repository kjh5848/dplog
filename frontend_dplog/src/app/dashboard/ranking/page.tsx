'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Store as StoreIcon } from 'lucide-react';
import { RankingDashboard } from '@/features/ranking';
import * as storeApi from '@/entities/store/api/storeApi';
import type { Store as StoreType } from '@/entities/store/model/types';

/**
 * 순위 조회 페이지
 *
 * 대시보드 사이드바 > "순위 조회" 메뉴에서 접근합니다.
 */
export default function RankingPage() {
  const [stores, setStores] = useState<StoreType[]>([]);
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

  return (
    <div className="space-y-6">
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

      {selectedStoreId > 0 && <RankingDashboard storeId={selectedStoreId} />}
    </div>
  );
}
