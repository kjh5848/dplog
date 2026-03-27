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
  RefreshTokenRequest,
  RefreshTokenResponse,
} from '../model/types';

/**
 * 카카오 OIDC 로그인
 *
 * 카카오 인가 코드와 state를 백엔드로 전송하여 JWT를 발급받습니다.
 */
export async function kakaoLogin(request: KakaoLoginRequest): Promise<LoginResponse> {
  return post<LoginResponse>('/v1/auth/kakao/login', request);
}

/**
 * 현재 로그인된 유저 정보 조회
 *
 * 액세스 토큰으로 인증된 유저 정보를 가져옵니다.
 */
export async function getMe(): Promise<User> {
  return get<User>('/v1/auth/me');
}

/**
 * 로그아웃
 *
 * 서버에서 리프레시 토큰을 무효화합니다.
 */
export async function logout(refreshToken: string): Promise<void> {
  return post<void>('/v1/auth/logout', { refreshToken });
}

/**
 * 액세스 토큰 갱신
 *
 * 리프레시 토큰으로 새로운 토큰 쌍을 발급받습니다.
 */
export async function refreshTokens(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  return post<RefreshTokenResponse>('/v1/auth/refresh', request);
}
