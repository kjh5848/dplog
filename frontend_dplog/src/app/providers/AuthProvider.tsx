'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/entities/auth/model/useAuthStore';

/**
 * 인증 상태 초기화 프로바이더
 *
 * 앱 마운트 시 initAuth()를 호출하여:
 * - 개발 환경: Dev Auto-Login으로 자동 로그인
 * - 프로덕션: 저장된 토큰으로 인증 상태 복원
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((s) => s.initAuth);
  const isInitialized = useAuthStore((s) => s.isInitialized);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // 인증 초기화 완료 전까지는 자식 렌더링 보류 (깜빡임 방지)
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}
