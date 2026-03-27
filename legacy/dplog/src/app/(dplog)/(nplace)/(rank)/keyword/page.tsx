import { redirect } from 'next/navigation';

import KeywordClientPage from '@/src/components/nplrace/rank/keyword/KeywordClientPage';
export const metadata = {
  title: "순위 비교",
};
export default async function KeywordPage() {

  // 인증된 사용자만 클라이언트 컴포넌트 렌더링
  return <KeywordClientPage />;
}
