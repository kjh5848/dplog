import { ApiResponse } from "@/types/api";
import { logInfo, logError } from '@/src/utils/logger';

export async function processApiResponse<T>(response: Response, skipRedirect: boolean = false): Promise<ApiResponse<T>> {
  console.log("responseHandler - 응답 상태:", response.status);
  console.log("responseHandler - 응답 URL:", response.url);
  
  const text = await response.text();
  console.log("responseHandler - 응답 텍스트:", text.substring(0, 200) + (text.length > 200 ? "..." : ""));
  
  if (!text) {
    return {
      code: response.ok ? "0" : String(response.status),
      message: response.statusText || '서버에서 응답이 없습니다.',
      data: null as unknown as T
    };
  }
  
  try {
    // HTML 응답인지 확인 (<!DOCTYPE 또는 <html로 시작하는지)
    if (text.trim().toLowerCase().startsWith('<!doctype') || text.trim().toLowerCase().startsWith('<html')) {
              logInfo('HTML 응답 감지 - 세션 만료로 판단');
      if (typeof window !== "undefined" && !skipRedirect) {
        // 세션 쿠키 삭제
        document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "AUTH_TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // 현재 페이지를 redirect 파라미터로 저장하고 로그인 페이지로 이동
        const currentPath = window.location.pathname + window.location.search;
        const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
        
        logInfo('로그인 페이지로 이동', { loginUrl });
        // setTimeout을 사용하여 비동기적으로 리다이렉트
        setTimeout(() => {
          window.location.href = loginUrl;
        }, 100);
      }
      return {
        code: skipRedirect ? "0" : "401",
        data: null as unknown as T,
        message: skipRedirect ? '데이터를 불러오는데 실패했습니다.' : '세션이 만료되었습니다. 다시 로그인해주세요.'
      };
    }
    
    const data = JSON.parse(text);
    
    // 세션 만료 또는 로그인 필요 응답 처리
    if ((data.code === "-99" || data.code === "401")) {
      logInfo('세션 만료 감지', { data });
      if (typeof window !== "undefined" && !skipRedirect) {
        // 세션 쿠키 삭제
        document.cookie = "JSESSIONID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "AUTH_TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // 현재 페이지를 redirect 파라미터로 저장하고 로그인 페이지로 이동
        const currentPath = window.location.pathname + window.location.search;
        const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
        
        logInfo('로그인 페이지로 이동', { loginUrl });
        // setTimeout을 사용하여 비동기적으로 리다이렉트
        setTimeout(() => {
          window.location.href = loginUrl;
        }, 100);
      }
      return {
        code: skipRedirect ? "0" : "401",
        data: null as unknown as T,
        message: skipRedirect ? '데이터를 불러오는데 실패했습니다.' : (data.message || '로그인이 필요한 서비스입니다.')
      };
    }
    
    return {
      code: String(data.code),
      data: data.data,
      message: data.message || '',
      meta: data.meta
    };
      } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('응답 처리 중 에러 발생', errorObj, { operation: 'processApiResponse' });
    return {
      code: "-1",
      data: null as unknown as T,
      message: '응답 형식이 올바르지 않습니다. 서버 연결을 확인해주세요.'
    };
  }
} 
