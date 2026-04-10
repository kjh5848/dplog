'use client';

import { StoreDetail } from '@/features/store/ui/StoreDetail';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

/**
 * 가게 상세/수정 페이지 클라이언트 컴포넌트
 */
function StoreDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const storeIdParam = searchParams.get('id');
  const storeId = storeIdParam ? Number(storeIdParam) : NaN;

  if (isNaN(storeId)) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        잘못된 가게 ID입니다.
      </div>
    );
  }

  return (
    <div className="py-4">
      <StoreDetail
        storeId={storeId}
        onBack={() => router.push('/dashboard')}
      />
    </div>
  );
}

export default function StoreDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <StoreDetailContent />
    </Suspense>
  );
}
