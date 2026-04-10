'use client';

import { useEffect, useState } from 'react';
import { StoreForm } from '@/features/store/ui/StoreForm';
import { StoreDetail } from '@/features/store/ui/StoreDetail';
import { useRouter } from 'next/navigation';
import type { Store } from '@/entities/store/model/types';
import * as storeApi from '@/entities/store/api/storeApi';
import { Loader2 } from 'lucide-react';

/**
 * 내 가게 탭 페이지
 * - 가게 없음 → 등록 폼 표시
 * - 가게 있음 → 가게 상세 정보 (StoreDetail) 표시
 */
export default function MyStorePage() {
  const router = useRouter();
  const [myStore, setMyStore]   = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 기존 가게 존재 여부 확인
  useEffect(() => {
    storeApi.getMyStores()
      .then(list => {
        if (list.length > 0) setMyStore(list[0]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  // ── 로딩 ──
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // ── 가게 있음 → StoreDetail 바로 렌더링 ──
  if (myStore) {
    return (
      <div className="w-full">
        <StoreDetail storeId={myStore.id} />
      </div>
    );
  }

  // ── 가게 없음 → 등록 폼 ──
  return (
    <div className="py-4">
      <StoreForm
        onSuccess={(store: Store) => {
          router.push(`/dashboard/stores/detail?id=${store.id}`);
        }}
        onBack={() => router.push('/dashboard')}
      />
    </div>
  );
}
