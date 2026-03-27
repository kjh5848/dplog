"use client";

import { useEffect } from 'react';
import { initKakaoSdk } from '@/src/utils/api/kakaoSdk';
import { logInfo, logError } from '@/src/utils/logger';

declare global {
  interface Window { Kakao: any }
}

function generateState(): string {
  try {
    const buf = new Uint32Array(4);
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      window.crypto.getRandomValues(buf);
      return Array.from(buf).join('');
    }
  } catch {}
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export default function KakaoSyncButton() {
  useEffect(() => {
    initKakaoSdk();

    const state = generateState();
    try {
      localStorage.setItem('kakao_oauth_state', state);
    } catch (e) {
      logError('kakao_oauth_state 저장 실패', e as Error);
    }

    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    const scope = 'profile_nickname profile_image account_email phone_number';

    if (typeof window !== 'undefined' && window.Kakao?.Auth?.createLoginButton) {
      try {
        window.Kakao.Auth.createLoginButton({
          container: '#kakao-sync-btn',
          scope,
          state,
          redirectUri,
          success: () => logInfo('[KakaoSync] authorize 시작'),
          fail: (err: any) => logError('[KakaoSync] authorize 오류', err instanceof Error ? err : new Error(JSON.stringify(err)))
        });
      } catch (error) {
        logError('[KakaoSync] createLoginButton 실패', error as Error);
      }
    }
  }, []);

  // 카카오 표준 버튼이 렌더링될 컨테이너
  return (
    <div id="kakao-sync-btn" className="w-full" />
  );
}

