'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/entities/auth/model/useAuthStore';
import { Loader2 } from 'lucide-react';

/**
 * 카카오 OIDC 콜백 처리 클라이언트 컴포넌트
 *
 * 카카오 인가 서버에서 리다이렉트된 후:
 * 1. URL에서 code, state 추출
 * 2. CSRF state 검증
 * 3. 백엔드에 카카오 로그인 API 호출
 * 4. JWT 수신 → 인증 상태 저장 → 대시보드 리다이렉트
 */
export default function KakaoCallbackClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const loginWithKakao = useAuthStore((s) => s.loginWithKakao);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // 카카오 인가 서버 에러 처리
        if (errorParam) {
          throw new Error(
            errorDescription || `카카오 로그인 실패: ${errorParam}`,
          );
        }

        // 필수 파라미터 검증
        if (!code || !state) {
          throw new Error('카카오 로그인 정보가 올바르지 않습니다.');
        }

        // CSRF state 검증
        const savedState = localStorage.getItem('kakao_oauth_state');
        if (state !== savedState) {
          throw new Error('보안 검증에 실패했습니다. 다시 로그인해 주세요.');
        }

        // state 사용 후 제거
        localStorage.removeItem('kakao_oauth_state');

        // 백엔드 카카오 로그인 API 호출 → JWT 수신
        await loginWithKakao(code, state);

        // 저장된 리다이렉트 경로로 이동 (없으면 대시보드)
        const redirectPath = localStorage.getItem('login_redirect_path') ?? '/dashboard';
        localStorage.removeItem('login_redirect_path');
        router.replace(redirectPath);
      } catch (err) {
        const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
        setError(message);

        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.replace('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router, loginWithKakao]);

  // 에러 발생 시 에러 UI
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="bg-red-500/10 backdrop-blur-md border border-red-500/20 rounded-2xl p-8 max-w-md text-center">
          <div className="text-red-400 text-lg font-bold mb-2">로그인 실패</div>
          <p className="text-slate-400 text-sm">{error}</p>
          <p className="text-slate-500 text-xs mt-4">
            잠시 후 로그인 페이지로 이동합니다...
          </p>
        </div>
      </div>
    );
  }

  // 처리 중 로딩 UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-white font-medium">카카오 로그인 처리 중...</p>
        <p className="text-slate-400 text-sm mt-1">잠시만 기다려 주세요.</p>
      </div>
    </div>
  );
}
