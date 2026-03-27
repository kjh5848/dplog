import { logInfo } from '@/src/utils/logger';

// 쿠키 값 읽기
export function getCookie(name: string): string | null {
  if (typeof window === 'undefined') return null;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

// 현재 세션 쿠키 ID 가져오기
function getCurrentSessionId(): string | null {
  return getCookie('JSESSIONID');
}

// 세션 ID 저장 (로그인 성공 시 호출)
export function saveSessionId(): void {
  if (typeof window === 'undefined') return;
  
  const sessionId = getCurrentSessionId();
  if (sessionId) {
    localStorage.setItem('lastValidSessionId', sessionId);
    logInfo('세션 ID 저장', { sessionIdPrefix: sessionId.substring(0, 8) });
  }
}

// 저장된 세션 ID 제거 (로그아웃 시 호출)
export function clearStoredSessionId(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('lastValidSessionId');
  logInfo('저장된 세션 ID 제거');
} 