import { redirect } from 'next/navigation';

import RealtimeClientPage from '@/src/components/nplrace/rank/realtime/RealtimeClientPage';

export const metadata = {
  title: "실시간 순위",
};

export default async function RealtimePage() {
  
  // 인증된 사용자만 클라이언트 컴포넌트 렌더링
  return <RealtimeClientPage />;
}