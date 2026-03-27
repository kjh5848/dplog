"use client";

import { Button } from "@/shared/ui/button";

interface SocialLoginButtonsProps {
  onKakaoClick?: () => void;
  onGoogleClick?: () => void;
}

export function SocialLoginButtons({
  onKakaoClick,
  onGoogleClick,
}: SocialLoginButtonsProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Button
        variant="outline"
        className="w-full bg-[#FEE500] hover:bg-[#FEE500]/90 text-[#3C1E1E] border-none font-bold"
        onClick={onKakaoClick}
      >
        <svg
          className="mr-2 h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 3C7.58 3 4 5.79 4 9.24C4 11.22 5.21 12.98 7.08 14.12L6.34 16.86C6.27 17.13 6.57 17.34 6.81 17.18L10.32 14.86C10.87 14.95 11.43 15 12 15C16.42 15 20 12.21 20 8.76C20 5.31 16.42 3 12 3Z" />
        </svg>
        카카오 로그인
      </Button>
      <Button
        variant="outline"
        className="w-full bg-white text-black hover:bg-slate-100 border-slate-200"
        onClick={onGoogleClick}
      >
         <svg
          className="mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        구글 로그인
      </Button>
    </div>
  );
}
