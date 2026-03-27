'use client';

import { StoreForm } from '@/features/store/ui/StoreForm';
import { useRouter } from 'next/navigation';
import type { Store } from '@/entities/store/model/types';

/**
 * 가게 등록 페이지 클라이언트 컴포넌트
 */
export default function NewStorePage() {
  const router = useRouter();

  /** 등록 성공 → 가게 상세 페이지로 이동 */
  const handleSuccess = (store: Store) => {
    router.push(`/dashboard/stores/${store.id}`);
  };

  return (
    <div className="py-4">
      <StoreForm
        onSuccess={handleSuccess}
        onBack={() => router.push('/dashboard')}
      />
    </div>
  );
}
