'use client';

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { loginSchema, LoginFormValues } from "./schemas";
import * as authApi from "@/entities/auth/api/authApi";

export const useLoginViewModel = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "kjh5848",
      password: "wngur5848@&",
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
  const handleKakaoLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const redirectParam = new URLSearchParams(window.location.search).get('redirect');
      if (redirectParam && redirectParam.startsWith('/')) {
        localStorage.setItem('login_redirect_path', redirectParam);
      }

      const { authorizeUrl } = await authApi.getKakaoAuthorizeUrl();
      window.location.href = authorizeUrl;
    } catch {
      setError('카카오 로그인 주소를 생성하지 못했습니다. 관리자에게 문의해 주세요.');
      setIsLoading(false);
    }
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
