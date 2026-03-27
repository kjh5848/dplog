/**
 * 인증 관련 도메인 타입 정의
 *
 * 백엔드 API 응답 타입과 1:1 대응됩니다.
 */

/** 유저 정보 */
export interface User {
  /** 유저 고유 ID */
  id: string;
  /** 이메일 */
  email: string;
  /** 닉네임 */
  nickname: string;
  /** 이름 */
  name: string;
  /** 프로필 이미지 URL */
  profileImageUrl?: string;
  /** 인증 제공자 (KAKAO, LOCAL) */
  provider: AuthProvider;
  /** 제공자별 고유 ID */
  providerId?: string;
  /** 가입일 */
  createdAt: string;
}

/** 인증 제공자 */
export type AuthProvider = 'KAKAO' | 'LOCAL';

/** JWT 토큰 쌍 */
export interface TokenPair {
  /** 액세스 토큰 (API 인증용, 단기) */
  accessToken: string;
  /** 리프레시 토큰 (토큰 갱신용, 장기) */
  refreshToken: string;
}

/** 카카오 로그인 요청 */
export interface KakaoLoginRequest {
  /** 카카오 인가 코드 */
  code: string;
  /** CSRF 방지용 state */
  state: string;
}

/** 로그인 응답 (백엔드 → 프론트엔드) */
export interface LoginResponse {
  /** 토큰 쌍 */
  tokens: TokenPair;
  /** 유저 정보 */
  user: User;
}

/** 토큰 갱신 요청 */
export interface RefreshTokenRequest {
  /** 리프레시 토큰 */
  refreshToken: string;
}

/** 토큰 갱신 응답 */
export interface RefreshTokenResponse {
  /** 새 토큰 쌍 */
  tokens: TokenPair;
}
