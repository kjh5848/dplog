/**
 * [역할] 사용자 인증 상태 관리
 * [입력] 로그인/로그아웃 액션
 * [출력] 인증 상태 및 사용자 정보
 * [NOTE] 기존 useAuthStoreLocal.tsx 리팩터링
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { AuthState, LoginUser } from './types';
import AuthRepository from '@/src/model/AuthRepository';
import { saveSessionId, clearStoredSessionId } from '@/src/utils/browser/cookieUtils';
import { logError, logInfo } from '@/src/utils/logger';

let hasCheckedOnce = false;
let isCheckingAuth = false;

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // 상태
        loginUser: null,
        isAuthPending: false,
        isLogoutPending: false,
        
        // 액션
        setLoginUser: (user) => {
          logInfo('[AuthStore] setLoginUser:', { username: user?.username });
          set({ loginUser: user });
          hasCheckedOnce = true;
        },
        
        checkAuth: async () => {
          if (hasCheckedOnce || isCheckingAuth) return;
          
          isCheckingAuth = true;
          hasCheckedOnce = true;
          set({ isAuthPending: true });
          
          try {
            logInfo('[AuthStore] 인증 상태 확인 시작');
            const response = await AuthRepository.checkAuth();
            
            if (response.code === "0" && response.data?.user) {
              const loginUserData = {
                ...response.data.user,
                userName: response.data.user.username,
                roleList: response.data.user.authority
              };
              
              saveSessionId();
              set({ loginUser: loginUserData });
              logInfo('[AuthStore] 인증 성공');
            } else {
              logInfo('[AuthStore] 인증 실패');
              set({ loginUser: null });
            }
          } catch (error) {
            const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
            logError('[AuthStore] 인증 체크 실패:', errorObj);
            set({ loginUser: null });
          } finally {
            set({ isAuthPending: false });
            isCheckingAuth = false;
          }
        },
        
        logout: async () => {
          set({ isLogoutPending: true });
          
          try {
            await AuthRepository.logout();
            set({ loginUser: null });
            clearStoredSessionId();
            hasCheckedOnce = false;
            logInfo('[AuthStore] 로그아웃 성공');
            
            // 로그아웃 성공 후 로그인 페이지로 리디렉션
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          } catch (error) {
            const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
            logError('[AuthStore] 로그아웃 실패:', errorObj);
            set({ loginUser: null });
            clearStoredSessionId();
            hasCheckedOnce = false;
            
            // 로그아웃 실패해도 로그인 페이지로 리디렉션 (보안상 안전)
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          } finally {
            set({ isLogoutPending: false });
          }
        },
        
        forceRecheck: async () => {
          logInfo('[AuthStore] 강제 재인증 시작');
          hasCheckedOnce = false;
          isCheckingAuth = false;
          set({ loginUser: null });
          
          const { checkAuth } = get();
          await checkAuth();
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({ loginUser: state.loginUser }),
      }
    ),
    { name: 'AuthStore' }
  )
); 