'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFormValues } from "./schemas";
import { useAuthStore } from "@/entities/auth/model/useAuthStore";

/** 카카오 OIDC 설정 */
const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID ?? '';
const KAKAO_REDIRECT_URI =
  typeof window !== 'undefined'
    ? `${window.location.origin}/kakao/callback`
    : '';

/**
 * CSRF 방지용 랜덤 state 생성
 */
function generateState(): string {
  const array = new Uint8Array(32);
  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const useLoginViewModel = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loginWithKakao = useAuthStore((s) => s.loginWithKakao);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  /**
   * 아이디/비밀번호 로그인 (현재 미지원 → 카카오 OIDC만 사용)
   * 향후 이메일 로그인 지원 시 구현
   */
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: 이메일/비밀번호 로그인 API 구현 시 연결
      console.log("Login submitted:", data);
      router.push('/dashboard');
    } catch {
      setError('로그인에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 카카오 OIDC 로그인 시작
   *
   * 카카오 인가 URL로 리다이렉트합니다.
   * state를 생성하여 localStorage에 저장 (CSRF 방지)
   */
  const handleKakaoLogin = () => {
    const state = generateState();

    // CSRF state 저장
    localStorage.setItem('kakao_oauth_state', state);

    // 로그인 후 돌아올 경로 저장
    const currentPath = window.location.pathname;
    if (currentPath !== '/login') {
      localStorage.setItem('login_redirect_path', currentPath);
    }

    // 카카오 인가 URL 구성
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: KAKAO_CLIENT_ID,
      redirect_uri: KAKAO_REDIRECT_URI,
      state,
      scope: 'openid profile_nickname profile_image account_email',
    });

    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
    window.location.href = kakaoAuthUrl;
  };

  /**
   * 구글 로그인 (향후 구현)
   */
  const handleGoogleLogin = () => {
    // TODO (향후): 구글 OAuth 연동
    console.log('Google login not yet implemented');
  };

  return {
    form,
    isLoading,
    error,
    onSubmit,
    handleKakaoLogin,
    handleGoogleLogin,
  };
};
