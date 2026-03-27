import { logInfo, logError } from '@/src/utils/logger';

declare global {
  interface Window {
    Kakao: any;
  }
}

// ====================== SDK 초기화 ======================
export const initKakaoSdk = () => {
  if (typeof window === 'undefined') return;

  if (!window.Kakao) {
    logError('카카오 SDK가 로드되지 않았습니다.');
    return;
  }

  if (!window.Kakao.isInitialized()) {
    const key = process.env.NEXT_PUBLIC_KAKAO_JS_API_KEY;
    if (!key) {
      logError('NEXT_PUBLIC_KAKAO_JS_API_KEY가 설정되지 않았습니다.');
      return;
    }
    window.Kakao.init(key);
    logInfo('카카오 SDK 초기화 완료');
  }
};

// ====================== 상수 및 유틸 ======================
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.dplog.kr';
const KAKAO_INAPP_UA_PATTERN = /KAKAOTALK/i;
const KAKAO_AUTO_PROMPT_DISABLED_KEY = 'kakao_auto_prompt_disabled';

const isKakaoInAppBrowser = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return KAKAO_INAPP_UA_PATTERN.test(navigator.userAgent);
};

const isAutoPromptDisabled = (): boolean => {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(KAKAO_AUTO_PROMPT_DISABLED_KEY) === '1';
  } catch {
    return false;
  }
};

export const shouldUseKakaoAutoPrompt = (): boolean => {
  if (!isKakaoInAppBrowser()) return false;
  return !isAutoPromptDisabled();
};

export const disableKakaoAutoPrompt = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KAKAO_AUTO_PROMPT_DISABLED_KEY, '1');
  } catch {}
};

export const clearKakaoAutoPrompt = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(KAKAO_AUTO_PROMPT_DISABLED_KEY);
  } catch {}
};

// ====================== 로그인 처리 ======================
interface AuthorizeOptions {
  prompt?: 'none' | 'login' | 'select_account';
  serviceTerms?: string[];
}

export const handleKakaoLogin = async () => {
  try {
    // 서버에서 state, scope, serviceTerms 요청
    const res = await fetch(`${apiBaseUrl}/v1/auth/kakao/state`, { credentials: 'include' });
    if (!res.ok) throw new Error(`서버 요청 실패 (status ${res.status})`);

    const json = await res.json();
    const { state, scope, serviceTerms: serviceTermsData } = json?.data || {};

    if (!state || !scope) throw new Error('state 또는 scope가 유효하지 않습니다.');

    // serviceTerms 가 문자열일 경우 배열로 변환
    const serviceTerms = Array.isArray(serviceTermsData)
      ? serviceTermsData
      : typeof serviceTermsData === 'string'
        ? serviceTermsData.split(',').map((s: string) => s.trim()).filter(Boolean)
        : undefined;

    try {
      localStorage.setItem('kakao_oauth_state', state);
    } catch {}

    // 인앱 환경이면 자동로그인 시도
    const useAutoPrompt = shouldUseKakaoAutoPrompt();
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    if (!redirectUri) throw new Error('NEXT_PUBLIC_KAKAO_REDIRECT_URI 환경변수가 누락되었습니다.');

    initKakaoSdk();

    if (typeof window === 'undefined' || !window.Kakao?.Auth) {
      throw new Error('Kakao SDK가 아직 로드되지 않았습니다.');
    }

    const params: Record<string, any> = {
      redirectUri,
      state,
      scope,
    };

    if (useAutoPrompt) {
      params.prompt = 'none';
      logInfo('[kakaoSdk] 인앱 자동 로그인 시도 (prompt=none)');
    }

    if (serviceTerms && serviceTerms.length > 0) {
      params.serviceTerms = serviceTerms;
    }

    // prompt 값 검증 (SDK가 허용하는 값만 전달)
    if (params.prompt && !['none', 'login', 'select_account'].includes(params.prompt)) {
      delete params.prompt;
      logError('[kakaoSdk] 잘못된 prompt 값이 감지되어 제거되었습니다.');
    }

    logInfo('[kakaoSdk] Kakao.Auth.authorize 요청', params);

    // SDK authorize 호출
    window.Kakao.Auth.authorize(params);

  } catch (e) {
    logError('[kakaoSdk] handleKakaoLogin error', e as Error);
  }
};