'use client';

import { Suspense } from 'react';
import KakaoCallbackClient from './KakaoCallbackClient';
import LoadingFallback from '@/src/components/common/LoadingFallback';
import { loadingUtils } from '@/src/utils/loading';

export default function KakaoCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback config={loadingUtils.loginProcessing()} />}>
      <KakaoCallbackClient />
    </Suspense>
  );
}
