import SessionRepository, { SessionInfo, SessionListResponse } from '@/src/model/SessionRepository';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/types/api';
import { logInfo, logError, logApiResponse } from '@/src/utils/logger';

export const useNplaceSessionViewModel = () => {
  const queryClient = useQueryClient();

  logInfo('세션 관리 ViewModel 초기화', { component: 'useNplaceSessionViewModel' });

  // 세션 목록 조회
  const {
    data: sessionListResult,
    error,
    isLoading,
    refetch
  } = useQuery<ApiResponse<SessionListResponse>>({
    queryKey: ['sessionList'],
    queryFn: async () => {
      logInfo('세션 목록 조회 시작', { operation: 'getSessionList' });
      const response = await SessionRepository.getSessionList();
      logApiResponse('세션 목록 조회', response, { operation: 'getSessionList' });
      return response;
    }
  });

  // 세션 삭제
  const { mutateAsync: deleteSession, isPending: isDeletingSession } = useMutation<
    ApiResponse<void>,
    Error,
    string
  >({
    mutationFn: async (username) => {
      if (!username.trim()) {
        throw new Error("사용자명이 필요합니다.");
      }
      return await SessionRepository.deleteSession(username);
    },
    onSuccess: async () => {
      // 세션 목록 새로고침
      await queryClient.invalidateQueries({ queryKey: ['sessionList'] });
      logInfo('세션 삭제 성공 - 목록 새로고침 완료', { operation: 'deleteSession' });
    },
    onError: (error) => {
      logError('세션 삭제 중 오류', error, { operation: 'deleteSession' });
    }
  });

  // 세션 목록 가져오기 (정렬된)
  const getSessionList = (): SessionInfo[] => {
    if (!sessionListResult?.data?.sessionList) return [];
    
    // 최근 접속 순으로 정렬
    const sessionList = [...sessionListResult.data.sessionList];
    return sessionList.sort((a, b) => {
      return new Date(b.lastAccessedTime).getTime() - new Date(a.lastAccessedTime).getTime();
    });
  };

  // 날짜 포맷팅
  const formatDateTime = (dateTimeString: string): string => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateTimeString;
    }
  };

  return {
    sessionList: getSessionList(),
    isLoading,
    error,
    refetch,
    deleteSession,
    isDeletingSession,
    formatDateTime,
    sessionCount: getSessionList().length
  };
};
