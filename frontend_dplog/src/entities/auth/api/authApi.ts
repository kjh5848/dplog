/**
 * 인증 API 클라이언트
 *
 * 백엔드 인증 API와 통신합니다.
 * 모든 API 호출은 shared/api의 공통 클라이언트를 사용합니다.
 */
import { post, get } from '@/shared/api';
import type {
  User,
  LoginResponse,
  KakaoLoginRequest,
  KakaoAuthorizeUrlResponse,
} from '../model/types';

export async function ensureCsrf(): Promise<{ headerName: string; token: string }> {
  return get<{ headerName: string; token: string }>('/v1/auth/csrf');
}

export async function getKakaoAuthorizeUrl(): Promise<KakaoAuthorizeUrlResponse> {
  return get<KakaoAuthorizeUrlResponse>('/v1/auth/kakao/authorize-url');
}

/**
 * 카카오 OIDC 로그인
 *
 * 카카오 인가 코드와 state를 백엔드로 전송하여 HttpOnly 세션 쿠키를 발급받습니다.
 */
export async function kakaoLogin(request: KakaoLoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/v1/auth/kakao/callback', request);
}

/**
 * 현재 로그인된 유저 정보 조회
 *
 * HttpOnly 세션 쿠키로 인증된 유저 정보를 가져옵니다.
 */
export async function getMe(): Promise<User> {
  return get<User>('/v1/auth/me');
}

/**
 * 로그아웃
 *
 * 서버 세션을 무효화합니다.
 */
export async function logout(): Promise<void> {
  await ensureCsrf();
  return post<void>('/v1/auth/logout');
}
