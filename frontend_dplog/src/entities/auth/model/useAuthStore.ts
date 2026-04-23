import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, TokenPair } from '../model/types';
import * as authApi from '../api/authApi';

// ─── 인증 쿠키 헬퍼 (미들웨어 라우트 보호용) ──────────────

/** 인증 쿠키 이름 — middleware.ts와 동일 */
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
  /** 액세스 토큰 (메모리 전용, persist 제외) */
  accessToken: string | null;
  /** 리프레시 토큰 */
  refreshToken: string | null;
  /** 인증 초기화 완료 여부 */
  isInitialized: boolean;

  // ─── 액션 ─────────────────────────────────
  /** 카카오 로그인 처리 (콜백에서 호출) */
  loginWithKakao: (code: string, state: string) => Promise<void>;
  /** 로그아웃 */
  logout: () => Promise<void>;
  /** 토큰 갱신 */
  refreshTokens: () => Promise<boolean>;
  /** 앱 시작 시 인증 상태 초기화 */
  initAuth: () => Promise<void>;
  /** 토큰 직접 설정 (인터셉터 갱신 후 사용) */
  setTokens: (tokens: TokenPair) => void;
  /** 유저 정보 설정 */
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // 초기 상태
      isLoggedIn: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      isInitialized: false,

      // ─── 카카오 로그인 ──────────────────────
      loginWithKakao: async (code: string, state: string) => {
        const response = await authApi.kakaoLogin({ code, state });
        set({
          isLoggedIn: true,
          user: response.user,
          accessToken: response.tokens.accessToken,
          refreshToken: response.tokens.refreshToken,
        });
        // 미들웨어 라우트 보호용 쿠키 설정
        setAuthCookie();
      },

      // ─── 로그아웃 ──────────────────────────
      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch {
          // 로그아웃 API 실패해도 클라이언트 상태는 초기화
        }
        // 미들웨어 라우트 보호용 쿠키 삭제
        removeAuthCookie();
        set({
          isLoggedIn: false,
          user: null,
          accessToken: null,
          refreshToken: null,
        });
      },

      // ─── 토큰 갱신 ──────────────────────────
      refreshTokens: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await authApi.refreshTokens({ refreshToken });
          set({
            accessToken: response.tokens.accessToken,
            refreshToken: response.tokens.refreshToken,
          });
          return true;
        } catch {
          // 갱신 실패 → 로그아웃 처리
          removeAuthCookie();
          set({
            isLoggedIn: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
          return false;
        }
      },

      // ─── 인증 초기화 ──────────────────────────
      initAuth: async () => {
        const { accessToken, refreshToken } = get();

        // ── 로컬 앱 모드 (Single-Tenant) 자동 승인 ──
        const isLocalAppMode = process.env.NEXT_PUBLIC_APP_MODE === 'local';
        if (isLocalAppMode) {
          console.log('[Auth] 💻 Local App Mode: 가상의 Local Owner 세션을 즉시 주입합니다.');
          setAuthCookie();
          set({
            isLoggedIn: true,
            accessToken: 'dummy-local-access-token',
            refreshToken: 'dummy-local-refresh-token',
            user: {
              id: 'local-1',
              email: 'local@dplog.co.kr',
              nickname: 'Local Owner',
              name: '사장님',
              provider: 'LOCAL',
              providerId: 'local-1',
              createdAt: new Date().toISOString(),
            },
            isInitialized: true,
          });
          return;
        }

        // ── Dev Auto-Login: 개발 환경 자동 로그인 (SaaS 모드 개발 시) ──
        const isDev = process.env.NODE_ENV === 'development';

        if (isDev && !accessToken && !refreshToken) {
          try {
            console.log('[Auth] 🔧 Dev Auto-Login: /v1/auth/dev/login 호출');
            const { post } = await import('@/shared/api');
            const response = await post<{
              tokens: { accessToken: string; refreshToken: string };
              user: {
                id: string;
                email: string;
                nickname: string;
                name: string;
                profileImageUrl?: string;
                provider: string;
                providerId: string;
                createdAt: string;
              };
            }>('/v1/auth/dev/login', { email: 'dev@dplog.co.kr' });

            setAuthCookie();
            set({
              isLoggedIn: true,
              accessToken: response.tokens.accessToken,
              refreshToken: response.tokens.refreshToken,
              user: {
                id: response.user.id,
                email: response.user.email,
                nickname: response.user.nickname,
                name: response.user.name,
                profileImageUrl: response.user.profileImageUrl,
                provider: response.user.provider as 'KAKAO',
                providerId: response.user.providerId,
                createdAt: response.user.createdAt,
              },
              isInitialized: true,
            });
            return;
          } catch (devLoginError) {
            console.warn('[Auth] ⚠️ Dev Auto-Login 실패 (백엔드 서버 확인 필요):', devLoginError);
            // Dev 로그인 실패 시에도 앱은 정상 동작하도록 초기화 완료
            set({ isInitialized: true });
            return;
          }
        }

        // 토큰이 없으면 미인증 상태
        if (!accessToken && !refreshToken) {
          set({ isInitialized: true });
          return;
        }

        try {
          // 액세스 토큰으로 유저 정보 조회 시도
          if (accessToken) {
            const user = await authApi.getMe();
            set({ isLoggedIn: true, user, isInitialized: true });
            return;
          }

          // 액세스 토큰 없고 리프레시 토큰만 있으면 갱신 시도
          if (refreshToken) {
            const refreshed = await get().refreshTokens();
            if (refreshed) {
              const user = await authApi.getMe();
              set({ isLoggedIn: true, user, isInitialized: true });
              return;
            }
          }
        } catch {
          // 인증 실패 → 초기화
          set({
            isLoggedIn: false,
            user: null,
            accessToken: null,
            refreshToken: null,
          });
        }

        set({ isInitialized: true });
      },

      // ─── 유틸리티 ──────────────────────────
      setTokens: (tokens: TokenPair) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        });
      },

      setUser: (user: User) => {
        set({ user, isLoggedIn: true });
      },
    }),
    {
      name: 'dplog-auth',
      storage: createJSONStorage(() => localStorage),
      // 민감한 accessToken은 persist에서 제외 (메모리 전용)
      // refreshToken만 localStorage에 저장
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
);
