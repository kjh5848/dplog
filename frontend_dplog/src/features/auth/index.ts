/**
 * features/auth 배럴 export
 */

// UI 컴포넌트
export { LoginForm } from './ui/LoginForm';
export { SignupForm } from './ui/SignupForm';
export { LoginClient } from './ui/LoginClient';
export { SignupClient } from './ui/SignupClient';
export { SocialLoginButtons } from './ui/SocialLoginButtons';
export { default as KakaoCallbackClient } from './ui/KakaoCallbackClient';

// ViewModel / 모델
export { useLoginViewModel } from './model/useLoginViewModel';
export { useSignupViewModel } from './model/useSignupViewModel';
export { loginSchema, signupSchema } from './model/schemas';
export type { LoginFormValues, SignupFormValues } from './model/schemas';

// 타입
export type {
  User,
  TokenPair,
  LoginResponse,
  KakaoLoginRequest,
  AuthProvider,
} from '@/entities/auth/model/types';

// API
export * as authApi from '@/entities/auth/api/authApi';

// 스토어
export { useAuthStore } from '@/entities/auth/model/useAuthStore';
