'use client';

import { StoreDetail } from '@/features/store/ui/StoreDetail';
import { useParams, useRouter } from 'next/navigation';

/**
 * 가게 상세/수정 페이지 클라이언트 컴포넌트
 */
export default function StoreDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storeId = Number(params.storeId);

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
