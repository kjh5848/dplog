'use client';

import { useState, useEffect, type ReactNode } from 'react';

/**
 * MSW 프로바이더 컴포넌트
 *
 * 개발 환경에서 MSW를 초기화한 후 children을 렌더링합니다.
 * NEXT_PUBLIC_MSW_ENABLED=true 일 때만 활성화되며,
 * 프로덕션 환경에서는 즉시 children을 반환합니다.
 */
export function MswProvider({ children }: { children: ReactNode }) {
  const [isMswReady, setIsMswReady] = useState(false);
  const isMswEnabled = process.env.NEXT_PUBLIC_MSW_ENABLED === 'true';

  useEffect(() => {
    if (!isMswEnabled) {
      setIsMswReady(true);
      return;
    }

    async function enableMocking() {
      const { initMocks } = await import('@/shared/mocks');
      await initMocks();
      setIsMswReady(true);
    }

    enableMocking();
  }, [isMswEnabled]);

  // MSW 초기화 전까지 빈 화면 (깜빡임 최소화)
  if (!isMswReady) {
    return null;
  }

  return <>{children}</>;
}
