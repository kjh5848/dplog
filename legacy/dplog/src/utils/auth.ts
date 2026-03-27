/**
 * [Role]   인증 관련 유틸리티 함수들
 * [Input]  인증 상태 및 사용자 정보
 * [Output] 인증 상태에 따른 처리 로직
 * [NOTE]   Pure Fn · Utility · Client Component
 */

import { useAuthStore } from "@/src/store/provider/StoreProvider";
import { redirect } from "next/navigation";
import toast from "react-hot-toast";
import { logInfo } from "@/src/utils/logger";

/**
 * 인증 상태를 확인하고 로딩/게스트 상태를 반환
 */
export function useAuthStatus() {
  const { loginUser, isAuthPending, isLogoutPending } = useAuthStore();
  
  const isLoading = loginUser === undefined || isAuthPending;
  const isGuest = loginUser === null;
  const isAuthenticated = loginUser !== null && loginUser !== undefined;
  
  return {
    loginUser,
    isAuthPending,
    isLogoutPending,
    isLoading,
    isGuest,
    isAuthenticated
  };
}

/**
 * 게스트 사용자를 로그인 페이지로 리다이렉트
 * 로그아웃 중일 때는 토스트 메시지 표시하지 않음
 */
export function useGuestRedirect() {
  const { isGuest, isLogoutPending } = useAuthStatus();
  
  const handleGuestRedirect = () => {
    if (isGuest) {
      logInfo('[useGuestRedirect] 🚫 인증되지 않은 사용자 감지, 리다이렉트 시작');
      
      // 로그아웃 중이 아닐 때만 토스트 메시지 표시
      if (!isLogoutPending) {
        toast.error("로그인 후 이용해주세요.", {
          id: 'guest-redirect', // 중복 방지
          duration: 3000
        });
      }
      
      // 클라이언트 컴포넌트에서는 window.location.href 사용
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return true; // 리다이렉트 발생
    }
    return false; // 리다이렉트 없음
  };
  
  return {
    isGuest,
    isLogoutPending,
    handleGuestRedirect
  };
}

/**
 * 인증 상태에 따른 컴포넌트 렌더링 로직
 */
export function useAuthGuard() {
  const { isLoading, isGuest, isAuthenticated, isLogoutPending } = useAuthStatus();
  
  return {
    isLoading,
    isGuest,
    isAuthenticated,
    isLogoutPending
  };
} 