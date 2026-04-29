import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../model/types';
import * as authApi from '../api/authApi';

// ─── 인증 쿠키 헬퍼 (미들웨어 라우트 보호용) ──────────────

/** 인증 쿠키 이름 - src/proxy.ts와 동일 */
const AUTH_COOKIE_NAME = 'dplog-auth-flag';

/** 인증 쿠키 설정 (로그인 시) */
function setAuthCookie() {
  if (typeof document !== 'undefined') {
    // path=/ 로 설정하여 모든 경로에서 접근 가능
    // SameSite=Lax로 설정하여 CSRF 방지
    document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
  }
}

/** 인증 쿠키 삭제 (로그아웃 시) */
function removeAuthCookie() {
  if (typeof document !== 'undefined') {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0`;
  }
}

/**
 * 인증 상태 인터페이스
 */
interface AuthState {
  // ─── 상태 ─────────────────────────────────
  /** 로그인 여부 */
  isLoggedIn: boolean;
  /** 현재 유저 정보 */
  user: User | null;
  /** 인증 초기화 완료 여부 */
  isInitialized: boolean;

  // ─── 액션 ─────────────────────────────────
  /** 카카오 로그인 처리 (콜백에서 호출) */
  loginWithKakao: (code: string, state: string) => Promise<void>;
  /** 로그아웃 */
  logout: () => Promise<void>;
  /** 앱 시작 시 인증 상태 초기화 */
  initAuth: () => Promise<void>;
  /** 유저 정보 설정 */
  setUser: (user: User) => void;
  /** 클라이언트 인증 상태만 초기화 */
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 초기 상태
      isLoggedIn: false,
      user: null,
      isInitialized: false,

      // ─── 카카오 로그인 ──────────────────────
      loginWithKakao: async (code: string, state: string) => {
        const response = await authApi.kakaoLogin({ code, state });
        set({
          isLoggedIn: true,
          user: response.user,
        });
        // 미들웨어 라우트 보호용 쿠키 설정
        setAuthCookie();
      },

      // ─── 로그아웃 ──────────────────────────
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // 로그아웃 API 실패해도 클라이언트 상태는 초기화
        }
        // 미들웨어 라우트 보호용 쿠키 삭제
        removeAuthCookie();
        set({
          isLoggedIn: false,
          user: null,
        });
      },

      // ─── 인증 초기화 ──────────────────────────
      initAuth: async () => {
        if (process.env.NEXT_PUBLIC_APP_MODE === 'local') {
          setAuthCookie();
          set({
            isLoggedIn: true,
            user: {
              id: 'local-1',
              email: 'local@dplog.co.kr',
              nickname: 'Local Owner',
              name: '사장님',
              provider: 'LOCAL',
              providerId: 'local-1',
              role: 'USER',
              createdAt: new Date().toISOString(),
            },
            isInitialized: true,
          });
          return;
        }

        try {
          const user = await authApi.getMe();
          setAuthCookie();
          set({ isLoggedIn: true, user, isInitialized: true });
          return;
        } catch {
          // 인증 실패 → 초기화
          set({
            isLoggedIn: false,
            user: null,
          });
        }

        set({ isInitialized: true });
      },

      // ─── 유틸리티 ──────────────────────────
      setUser: (user: User) => {
        set({ user, isLoggedIn: true });
      },

      clearAuth: () => {
        removeAuthCookie();
        set({
          isLoggedIn: false,
          user: null,
        });
      },
    }),
    {
      name: 'dplog-auth',
      storage: createJSONStorage(() => localStorage),
      // HttpOnly 세션 쿠키가 실제 인증 수단입니다.
      // localStorage에는 화면 깜빡임 완화를 위한 비민감 사용자 요약만 저장합니다.
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);
