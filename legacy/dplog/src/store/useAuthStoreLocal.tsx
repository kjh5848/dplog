"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import AuthRepository from "@/src/model/AuthRepository";
import { useRouter, usePathname } from "next/navigation";
import { saveSessionId, clearStoredSessionId } from "@/src/utils/browser/cookieUtils";
import { logInfo, logError, logger } from '@/src/utils/logger';

interface LoginUser {
  id: number;
  username: string;
  authority: string[];
  expireDate: string;
  // Kakao/SSO derived fields (optional)
  name?: string;
  nickname?: string;
  profileImage?: string;
  profileImageUrl?: string; // kakao_account.profile.profile_image_url
  thumbnailImageUrl?: string; // kakao_account.profile.thumbnail_image_url
  provider?: string; // e.g., 'KAKAO'
  providerId?: string; // e.g., Kakao user id
  email?: string;
  createdAt?: string;
  phoneNumber?: string;
  company?: string;
  department?: string;
  distributorEntity?: {
    id: number;
    email: string;
    accountNumber: string;
    deposit: string;
    bankName: string;
    googleSheetUrl: string;
    googleCredentialJson: unknown;
    memo: string | null;
    createDate: string;
    updateDate: string | null;
    deleteDate: string | null;
  };
  // 기존 속성들도 유지 (호환성)
  userName?: string;
  companyName?: string;
  companyNumber?: string;
  tel?: string;
  roleList?: string[];
}

function useAuthStoreLocal() {
  const router = useRouter();
  const pathname = usePathname();
  const [loginUser, setLoginUser] = useState<LoginUser | null | undefined>(
    undefined
  );

  // loginUser 상태 변화 추적
  useEffect(() => {
    logInfo('[AuthStore] 🔄 loginUser 상태 변화', {
      previousType: typeof loginUser,
      currentValue: loginUser ? `${loginUser.userName}` : loginUser,
      timestamp: new Date().toISOString()
    });
  }, [loginUser]);
  
  // API 호출 중복 방지를 위한 플래그
  const isCheckingAuth = useRef(false);
  const hasCheckedOnce = useRef(false); // 한 번 체크했는지 확인
  const previousPathname = useRef<string | null>(null); // 이전 경로 저장

  // 세션 체크 함수 - 한 번만 실행
  const checkAuthCallback = useCallback(async () => {
    // 이미 확인했으면 중복 호출 방지
    if (hasCheckedOnce.current || isCheckingAuth.current) {
      logInfo('[AuthStore] 이미 인증 체크 완료, 중복 호출 방지');
      return;
    }
    
    isCheckingAuth.current = true;
    hasCheckedOnce.current = true;
    
    try {
      logInfo('[AuthStore] 🚀 인증 상태 확인 시작 (최초 1회)');
      const response = await AuthRepository.checkAuth();
      
      logInfo('[AuthStore] API 응답', { 
        code: response.code, 
        message: response.message,
        hasUser: !!response.data?.user,
        userData: response.data?.user
      });
      
      if (response.code === "0" && response.data?.user) {
        logInfo('[AuthStore] ✅ 인증 성공, 서버 응답', { user: response.data.user });
        
        // 서버 응답을 LoginUser 형태로 변환
        const loginUserData = {
          ...response.data.user,
          // 호환성을 위한 매핑
          userName: response.data.user.username,
          roleList: response.data.user.authority
        };
        
        // 로컬 오버레이와 병합 (카카오 표시정보 유지)
        try {
          const overlayRaw = typeof window !== 'undefined' ? localStorage.getItem('auth_display_overlay') : null;
          if (overlayRaw) {
            const overlay = JSON.parse(overlayRaw);
            if (overlay?.userId && String(overlay.userId) === String(loginUserData.id)) {
              Object.assign(loginUserData, {
                provider: overlay.provider || loginUserData.provider,
                providerId: overlay.providerId || loginUserData.providerId,
                nickname: overlay.nickname || loginUserData.nickname,
                name: overlay.name || loginUserData.name,
                email: loginUserData.email || overlay.email,
                profileImage: overlay.profileImage || loginUserData.profileImage,
                profileImageUrl: overlay.profileImageUrl || loginUserData.profileImageUrl,
                thumbnailImageUrl: overlay.thumbnailImageUrl || loginUserData.thumbnailImageUrl,
              });
              logInfo('[AuthStore] 🟡 Overlay merged for display');
            } else {
              // 사용자 불일치 시 오버레이 정리
              localStorage.removeItem('auth_display_overlay');
            }
          }
        } catch {}

        logInfo('[AuthStore] 🔄 변환된 사용자 정보', { loginUserData });
        
        // 로그인 성공 시 현재 세션 ID 저장
        saveSessionId();
        
        setLoginUser(loginUserData);
      } else if (response.code === "401" || response.code === "-9" || response.code === "-99") {
        // 세션 만료/로그인 필요 - null로 설정
        logInfo('[AuthStore] 🔒 세션 만료 또는 로그인 필요', { code: response.code });
        setLoginUser(null);
        
      } else {
        // 기타 오류 - null로 설정
        logInfo('[AuthStore] ❌ 인증 실패', { code: response.code, message: response.message });
        setLoginUser(null);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("[AuthStore] ❌ API 호출 실패", errorObj, { operation: 'checkAuth' });
      // API 호출 실패 시에도 null로 설정
      logInfo('[AuthStore] 🔒 API 실패로 인한 비로그인 상태 처리');
      setLoginUser(null);
    } finally {
      isCheckingAuth.current = false;
    }
  }, []);

  // 인증 진행 상태
  const [isAuthPending, setIsAuthPending] = useState<boolean>(false);

  // checkAuth 실행 함수 (in-flight 가드 포함)
  const checkAuth = useCallback(async () => {
    // 이미 확인했으면 중복 호출 방지
    if (hasCheckedOnce.current || isCheckingAuth.current) {
      logInfo('[AuthStore] 이미 인증 체크 완료, 중복 호출 방지');
      return;
    }

    isCheckingAuth.current = true;
    hasCheckedOnce.current = true;
    setIsAuthPending(true);

    try {
      logInfo('[AuthStore] 🚀 인증 상태 확인 시작 (최초 1회)');
      const response = await AuthRepository.checkAuth();

      logInfo('[AuthStore] API 응답', {
        code: response.code,
        message: response.message,
        hasUser: !!response.data?.user,
        userData: response.data?.user
      });

      if (response.code === "0" && response.data?.user) {
        logInfo('[AuthStore] ✅ 인증 성공, 서버 응답', { user: response.data.user });

        const loginUserData = {
          ...response.data.user,
          userName: response.data.user.username,
          roleList: response.data.user.authority
        };

        try {
          const overlayRaw = typeof window !== 'undefined' ? localStorage.getItem('auth_display_overlay') : null;
          if (overlayRaw) {
            const overlay = JSON.parse(overlayRaw);
            if (overlay?.userId && String(overlay.userId) === String(loginUserData.id)) {
              Object.assign(loginUserData, {
                provider: overlay.provider || loginUserData.provider,
                providerId: overlay.providerId || loginUserData.providerId,
                nickname: overlay.nickname || loginUserData.nickname,
                name: overlay.name || loginUserData.name,
                email: loginUserData.email || overlay.email,
                profileImage: overlay.profileImage || loginUserData.profileImage,
                profileImageUrl: overlay.profileImageUrl || loginUserData.profileImageUrl,
                thumbnailImageUrl: overlay.thumbnailImageUrl || loginUserData.thumbnailImageUrl,
              });
              logInfo('[AuthStore] 🟡 Overlay merged for display');
            } else {
              localStorage.removeItem('auth_display_overlay');
            }
          }
        } catch {}

        logInfo('[AuthStore] 🔄 변환된 사용자 정보', { loginUserData });
        saveSessionId();
        setLoginUser(loginUserData);
      } else if (response.code === "401" || response.code === "-9" || response.code === "-99") {
        logInfo('[AuthStore] 🔒 세션 만료 또는 로그인 필요', { code: response.code });
        setLoginUser(null);
        if (pathname !== '/') {
          // router.push('/');
        }
      } else {
        logInfo('[AuthStore] ❌ 인증 실패', { code: response.code, message: response.message });
        setLoginUser(null);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("[AuthStore] ❌ API 호출 실패", errorObj, { operation: 'checkAuth' });
      logInfo('[AuthStore] 🔒 API 실패로 인한 비로그인 상태 처리');
      setLoginUser(null);
    } finally {
      isCheckingAuth.current = false;
      setIsAuthPending(false);
    }
  }, [pathname]);

  // 로그아웃 함수
  // 로그아웃 진행 상태
  const [isLogoutPending, setIsLogoutPending] = useState<boolean>(false);
  const isLoggingOutRef = useRef(false);

  // 로그아웃 함수 (in-flight 가드 포함)
  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    setIsLogoutPending(true);

    try {
      await AuthRepository.logout();
      setLoginUser(null);
      clearStoredSessionId();
      try { localStorage.removeItem('auth_display_overlay'); } catch {}
      hasCheckedOnce.current = false;
      router.replace('/login');
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("[AuthStore] ❌ 로그아웃 실패", errorObj, { operation: 'logout' });
      setLoginUser(null);
      clearStoredSessionId();
      hasCheckedOnce.current = false;
      router.replace('/login');
    } finally {
      setIsLogoutPending(false);
      isLoggingOutRef.current = false;
    }
  }, [router]);

  // 강제로 재인증하는 함수 (필요시 사용)
  const forceRecheck = useCallback(async () => {
    logInfo('[AuthStore] 🔄 강제 재인증 시작');
    hasCheckedOnce.current = false;
    isCheckingAuth.current = false;
    setLoginUser(undefined);
    
    // checkAuth는 비동기 함수이므로 Promise로 래핑하여 완료를 보장
    return new Promise<void>((resolve) => {
      checkAuth();
      
      // 상태 변경이 완료될 때까지 대기
      const checkCompletion = () => {
        if (!isCheckingAuth.current && hasCheckedOnce.current) {
          logInfo('[AuthStore] ✅ 강제 재인증 완료');
          resolve();
        } else {
          setTimeout(checkCompletion, 50);
        }
      };
      
      setTimeout(checkCompletion, 50);
    });
  }, [checkAuth]);

  // 컴포넌트 마운트 시 한 번만 인증 상태 확인
  useEffect(() => {
    logInfo('[AuthStore] useEffect 실행', {
      loginUser,
      hasCheckedOnce: hasCheckedOnce.current,
      isCheckingAuth: isCheckingAuth.current
    });
    
    // undefined이고 아직 체크하지 않았을 때만 실행
    if (loginUser === undefined && !hasCheckedOnce.current && !isCheckingAuth.current) {
      logInfo('[AuthStore] 🚀 초기 인증 상태 확인 시작');
      checkAuth();
    } else {
      logInfo('[AuthStore] 인증 체크 건너뜀', {
        reason: loginUser !== undefined ? 'loginUser가 undefined가 아님' : 
                hasCheckedOnce.current ? '이미 체크함' : 
                isCheckingAuth.current ? '체크 중' : '알 수 없음'
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 빈 의존성 배열로 마운트 시 한 번만 실행

  // 페이지 이동 시 세션 유효성 체크 (라우트 변경 감지)
  useEffect(() => {
    if (!loginUser) return; // 로그인 상태가 아니면 체크 안함
    if (pathname === '/') return; // 홈페이지에서는 세션 체크 안함 (불필요한 리다이렉트 방지)
    
    const checkSessionOnRouteChange = async () => {
      try { 
        logInfo('[AuthStore] 🚦 페이지 이동 감지 - 세션 유효성 체크:', { pathname });
        const response = await AuthRepository.checkAuth();
        
        // 세션이 무효화된 경우 (-99, -9, 401 등)
        if (response.code === "401" || response.code === "-9" || response.code === "-99") {
          logInfo('[AuthStore] 🚨 페이지 이동 시 세션 무효 감지 - 강제 로그아웃');
          setLoginUser(null);
          clearStoredSessionId();
          // 현재 경로가 홈페이지가 아닌 경우에만 리다이렉트
          if (pathname !== '/') {
            logInfo('[AuthStore] 홈페이지가 아닌 경로에서 세션 무효 - 홈으로 이동');
            router.push('/');
          }
        } else if (response.code === "0" && response.data?.user) {
          // 세션이 여전히 유효한 경우 - 사용자 정보 업데이트
          logInfo('[AuthStore] ✅ 페이지 이동 시 세션 여전히 유효 - 사용자 정보 업데이트');
          // const updatedUserData = {
          //   ...response.data.user,
          //   userName: response.data.user.username,
          //   roleList: response.data.user.authority
          // };
          // setLoginUser(updatedUserData);
        } else {
          // 기타 오류 응답 - 로그아웃 처리
          logInfo('[AuthStore] ❌ 예상치 못한 응답, 로그아웃 처리:', { code: response.code });
          setLoginUser(null);
          clearStoredSessionId();
          // 현재 경로가 홈페이지가 아닌 경우에만 리다이렉트
          if (pathname !== '/') {
            logInfo('[AuthStore] 홈페이지가 아닌 경로에서 오류 - 홈으로 이동');
            router.push('/');
          }
        }
      } catch (error) {
        logError('[AuthStore] 페이지 이동 시 세션 검증 중 오류:', error as Error);
        // 네트워크 오류 등은 무시 (너무 빈번한 로그아웃 방지)
        // 단, 치명적인 오류인 경우에만 로그아웃 처리
        if (error instanceof TypeError || (error as Error)?.message?.includes('fetch')) {
          logInfo('[AuthStore] 네트워크 오류 감지, 로그아웃하지 않음');
        }
      }
    };

    // 실제로 경로가 변경된 경우에만 세션 체크
    if (hasCheckedOnce.current && previousPathname.current !== null && previousPathname.current !== pathname) {
      logInfo('[AuthStore] 실제 경로 변경 감지:', { previousPathname: previousPathname.current, pathname });
      checkSessionOnRouteChange();
    }
    
    // 현재 경로를 이전 경로로 저장
    previousPathname.current = pathname;
  }, [pathname, loginUser, router]); // pathname 변경 시에만 실행

  // 세션 사용자 정보를 직접 설정하는 함수
  const setSessionUser = useCallback((user: LoginUser | null) => {
    logInfo('[AuthStore] 🎯 setSessionUser 호출됨:', { 
      newUser: user ? user.userName : user,
      currentUser: loginUser ? loginUser.userName : loginUser 
    });
    setLoginUser(user);
    hasCheckedOnce.current = true; // 수동 설정 시에도 체크 완료로 표시
    logInfo('[AuthStore] ✅ setLoginUser 완료');
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 배열 제거하여 무한 루프 방지

  return {
    loginUser,
    setLoginUser: setSessionUser,
    isAuthPending,
    isLogoutPending,
    checkAuth,
    logout,
    forceRecheck, // 강제 재인증 함수 추가
  };
}

export default useAuthStoreLocal;
