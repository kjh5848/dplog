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
  /** 서비스 역할 */
  role?: 'USER' | 'ADMIN';
  /** 가입일 */
  createdAt: string;
}

/** 인증 제공자 */
export type AuthProvider = 'KAKAO' | 'LOCAL';

/** 카카오 로그인 요청 */
export interface KakaoLoginRequest {
  /** 카카오 인가 코드 */
  code: string;
  /** CSRF 방지용 state */
  state: string;
  /** 선택 마케팅 동의 */
  marketingConsent?: boolean;
}

export interface KakaoAuthorizeUrlResponse {
  authorizeUrl: string;
  state: string;
}

export interface KakaoChannelRelation {
  channelPublicId: string;
  relation: 'ADDED' | 'BLOCKED' | 'NONE' | 'CONSENT_REQUIRED';
  scopeGranted: boolean;
  checkedAt: string;
}

/** 로그인 응답 (백엔드 → 프론트엔드) */
export interface LoginResponse {
  /** 유저 정보 */
  user: User;
  /** 카카오 채널 관계 */
  channel?: KakaoChannelRelation | null;
}
