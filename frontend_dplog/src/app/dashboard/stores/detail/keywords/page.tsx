'use client';

import { KeywordManager } from '@/features/store/ui/KeywordManager';
import { useParams, useRouter } from 'next/navigation';

/**
 * 키워드 관리 페이지 클라이언트 컴포넌트
 */
export default function KeywordsPage() {
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
      <KeywordManager
        storeId={storeId}
        onBack={() => router.push(`/dashboard/stores/${storeId}`)}
      />
    </div>
  );
}
