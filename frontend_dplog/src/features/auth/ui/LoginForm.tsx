"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { SocialLoginButtons } from "./SocialLoginButtons";
import { useLoginViewModel } from "../model/useLoginViewModel";

export function LoginForm() {
  const { form, isLoading, onSubmit, handleKakaoLogin, handleGoogleLogin } = useLoginViewModel();
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4">
        <SocialLoginButtons 
          onKakaoClick={handleKakaoLogin}
          onGoogleClick={handleGoogleLogin}
        />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-[#0A0A0A] px-2 text-slate-500">
              Or continue with email
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">아이디</Label>
            <Input
              id="username"
              placeholder="아이디를 입력하세요"
              type="text"
              autoCapitalize="none"
              autoComplete="username"
              autoCorrect="off"
              disabled={isLoading}
              {...register("username")}
            />
            {errors.username && (
              <p className="text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">비밀번호</Label>
              <Link
                href="/forgot-password"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-slate-500 dark:text-slate-400"
              >
                비밀번호를 잊으셨나요?
              </Link>
            </div>
            <Input
              id="password"
              placeholder="비밀번호를 입력하세요"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="rememberMe" {...register("rememberMe")} />
            <label
              htmlFor="rememberMe"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 dark:text-slate-300"
            >
              로그인 상태 유지
            </label>
          </div>
          <Button disabled={isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11">
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            로그인
          </Button>
        </div>
      </form>
      
      <div className="text-center text-sm text-slate-600 dark:text-slate-400 mt-2">
        계정이 없으신가요?{" "}
        <Link href="/signup" className="underline underline-offset-4 hover:text-primary font-semibold text-slate-900 dark:text-white">
          회원가입
        </Link>
      </div>
    </div>
  );
}
