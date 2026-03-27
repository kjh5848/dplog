import { redirect } from 'next/navigation';

import TrackDetailClientPage from '@/src/components/nplrace/rank/track/id/TrackDetailClientPage';
export const metadata = {
  title: "추적 상세",
};

interface TrackDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function TrackDetailPage({ params, searchParams }: TrackDetailPageProps) {

  // params와 searchParams를 await로 처리
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  // 인증된 사용자만 클라이언트 컴포넌트 렌더링
  return <TrackDetailClientPage params={resolvedParams} searchParams={resolvedSearchParams} />;
}
