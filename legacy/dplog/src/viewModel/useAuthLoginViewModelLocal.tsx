'use client';

import { useAuthStore } from '@/src/store/provider/StoreProvider';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthRepository from '@/src/model/AuthRepository';
import { logInfo, logError, logUserAction } from '@/src/utils/logger';
import { LoginRequest } from '@/src/types/auth';
import { toast } from 'react-hot-toast';

export default function useAuthLoginViewModelLocal() {
  const { setLoginUser } = useAuthStore();
  const router = useRouter();
  const [isPendingLogin, setIsPendingLogin] = useState(false);

  const login = async (reqDto: LoginRequest, isChecked: boolean) => {
    setIsPendingLogin(true);
    try {
      const response = await AuthRepository.postLogin(reqDto);

      if (response.code !== "0") {
        if (response.data && response.data.code === -3) {
          toast.error(Object.values(response.data).join('\n'));
        } else {
          toast.error(response.message || '로그인 실패');
        }
        return { ok: false };
      }

      // 아이디 기억하기
      if (isChecked) {
        localStorage.setItem('rememberId', JSON.stringify(reqDto.username));
      } else {
        localStorage.removeItem('rememberId');
      }

      // 사용자 정보 설정 (세션 기반으로 서버에서 가져온 유저 정보 사용)
      logInfo('로그인 성공, 서버 응답 원본', { response: response.data }, { 
        tags: { operation: 'login', status: 'success' } 
      });
      
      // 서버 응답을 LoginUser 형태로 변환
      const loginUserData = {
        ...response.data.user,
        // 호환성을 위한 매핑
        userName: response.data.user.username,
        roleList: response.data.user.authority
      };
      
      logInfo('변환된 사용자 정보', { loginUserData }, { 
        tags: { operation: 'login', step: 'data-transformation' } 
      });
      setLoginUser(loginUserData);
      logInfo('setLoginUser 호출 완료', { userId: response.data.user.userId });

      // 사용자 액션 로깅
      logUserAction('로그인', response.data.user.userId?.toString(), { 
        method: 'local',
        username: response.data.user.username 
      });

      // 대시보드로 이동
      logInfo('/track으로 리다이렉트 시작', { userId: response.data.user.userId });
      router.replace('/track');
      return { ok: true, user: response.data.user };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      logError('로그인 오류', error, { 
        username: reqDto.username,
        isChecked 
      });
      toast.error(error.message || '로그인 중 오류 발생');
      return { ok: false };
    } finally {
      setIsPendingLogin(false);
    }
  };

  return {
    login,
    isPendingLogin,
  };
}

