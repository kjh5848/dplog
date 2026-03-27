import { Suspense } from 'react';
import { Metadata } from 'next';
import KakaoCallbackClient from '@/features/auth/ui/KakaoCallbackClient';

export const metadata: Metadata = {
  title: '카카오 로그인 처리 중 - D-PLOG',
  description: '카카오 로그인 인증을 처리하고 있습니다.',
};

/**
 * 카카오 OIDC 콜백 페이지
 *
 * useSearchParams()를 사용하므로 Suspense 바운더리가 필요합니다.
 */
export default function KakaoCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white">인증 처리 중...</div>
        </div>
      }
    >
      <KakaoCallbackClient />
    </Suspense>
  );
}
