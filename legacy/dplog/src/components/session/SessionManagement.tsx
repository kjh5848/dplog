'use client';

import { useNplaceSessionViewModel } from '@/src/viewModel/session/useNplaceSessionViewModel';
import { useAuthGuard, useAuthStatus } from '@/src/utils/auth';
import { loadingUtils } from '@/src/utils/loading';
import LoadingFallback from '@/src/components/common/LoadingFallback';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { logInfo, logError } from '@/src/utils/logger';
import DplogHeader from '@/src/components/common/Headers/DplogHeader';
import toast from 'react-hot-toast';

export default function SessionManagement() {
  const router = useRouter();
  const { loginUser } = useAuthStatus();
  const { isLoading, isGuest, isLogoutPending } = useAuthGuard();
  const [mounted, setMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  
  const {
    sessionList,
    isLoading: sessionLoading,
    error,
    refetch,
    deleteSession,
    isDeletingSession,
    formatDateTime,
    sessionCount
  } = useNplaceSessionViewModel();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 게스트 사용자 처리
  useEffect(() => {
    if (mounted && isGuest && !isLogoutPending) {
      router.push('/login');
    }
  }, [mounted, isGuest, isLogoutPending, router]);

  // 권한 체크 - ADMIN만 접근 가능 (loginUser가 확정된 후에만 실행)
  useEffect(() => {
    if (mounted && !isLoading && loginUser !== undefined && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      
      if (!loginUser) {
        toast.error('로그인이 필요합니다.');
        router.push('/login');
        return;
      }
      
      const hasAdminAuth = loginUser.authority?.includes('ADMIN');
      if (!hasAdminAuth) {
        toast.error('관리자 권한이 필요합니다.');
        router.push('/');
        return;
      }
    }
  }, [mounted, isLoading, loginUser, hasCheckedAuth, router]);

  // 세션 삭제 핸들러
  const handleDeleteSession = async (username: string) => {
    if (window.confirm(`${username} 사용자의 세션을 삭제하시겠습니까?`)) {
      try {
        await deleteSession(username);
        
        // 현재 로그인된 사용자가 자신의 세션을 삭제한 경우에만 로그아웃
        const currentUsername = loginUser?.username || loginUser?.userName;
        if (currentUsername === username) {
          toast.error('본인의 세션이 삭제되었습니다. 다시 로그인해주세요.');
          
          // 로그인 페이지로 리다이렉트
          router.push('/login');
          return;
        }
        
        // 다른 사용자의 세션을 삭제한 경우 - 어드민은 로그아웃하지 않음
        logInfo('다른 사용자 세션 삭제 완료, 어드민은 계속 로그인 상태 유지');
        
        toast.success('세션이 삭제되었습니다.');
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('세션 삭제 오류', errorObj, { username });
        toast.error('세션 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  // 1. 인증/로딩/게스트 처리
  if (isLoading) {
    if (isLogoutPending) {
      return <LoadingFallback config={loadingUtils.logoutAuth()} />;
    }
    return <LoadingFallback config={loadingUtils.userAuth()} />;
  }

  if (isGuest) {
    return <LoadingFallback config={loadingUtils.loginRedirect()} />;
  }

  // 2. 권한 체크 (ADMIN만 접근)
  if (!mounted || loginUser === undefined || !hasCheckedAuth) {
    return <LoadingFallback config={loadingUtils.userAuth()} />;
  }

  if (!loginUser) {
    return <LoadingFallback config={loadingUtils.loginRedirect()} />;
  }

  // 권한이 없는 경우 (이미 위에서 리다이렉트 했지만 안전장치)
  if (!loginUser.authority?.includes('ADMIN')) {
    return (
      <div className="min-h-screen bg-rank-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-rank-danger">권한이 없습니다.</div>
        </div>
      </div>
    );
  }

  if (sessionLoading) {
    return <LoadingFallback config={loadingUtils.contentLoad()} />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-rank-light">
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold text-rank-dark mb-6">세션관리</h1>
          <div className="card-primary p-6">
            <div className="text-center text-rank-danger">
              <p className="mb-4">세션 목록을 불러오는 중 오류가 발생했습니다.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-rank-primary text-white rounded-lg hover:opacity-80 transition-opacity"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto mt-10 max-w-6xl items-center py-8">
        <DplogHeader title="N-PLACE" message="세션 관리" />
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-rank-dark text-2xl font-bold">세션관리</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              총 {sessionCount}개의 활성 세션
            </span>
            <button
              onClick={() => refetch()}
              disabled={sessionLoading}
              className="bg-rank-primary rounded-lg px-4 py-2 text-white transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              새로고침
            </button>
          </div>
        </div>

        <div className="card-primary overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-rank-light-accent">
                <tr>
                  <th className="text-rank-dark px-6 py-4 text-left text-sm font-medium">
                    아이디
                  </th>
                  <th className="text-rank-dark px-6 py-4 text-left text-sm font-medium">
                    생성일자
                  </th>
                  <th className="text-rank-dark px-6 py-4 text-left text-sm font-medium">
                    최근접속일자
                  </th>
                  <th className="text-rank-dark px-6 py-4 text-left text-sm font-medium">
                    삭제
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessionList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      활성 세션이 없습니다.
                    </td>
                  </tr>
                ) : (
                  sessionList.map((session) => (
                    <tr
                      key={session.username}
                      className="transition-colors hover:bg-gray-50"
                    >
                      <td className="text-rank-dark px-6 py-4 text-sm font-medium">
                        {session.username}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(session.creationTime)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {formatDateTime(session.lastAccessedTime)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteSession(session.username)}
                          disabled={isDeletingSession}
                          className="bg-rank-danger rounded px-3 py-1 text-sm text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                        >
                          {isDeletingSession ? "삭제중..." : "삭제"}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 