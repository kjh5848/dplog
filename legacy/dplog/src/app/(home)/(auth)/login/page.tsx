import LoginClientPage from '@/src/components/common/auth/LoginClientPage';

export default async function LoginPage() {
  // 서버사이드 자동 리다이렉트 제거 - 클라이언트에서 처리
  // 모든 사용자에게 로그인 페이지 표시하고, 클라이언트에서 인증 상태 확인
  return <LoginClientPage />;
} 