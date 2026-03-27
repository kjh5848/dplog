'use client';

import dynamic from 'next/dynamic';

/**
 * 대시보드 리포트 메인 컨테이너 (CSR 전용)
 * 
 * next/dynamic을 사용하여 서버렌더링을 시도하지 않고, 클라이언트에서만 렌더링되게 만듭니다.
 * 데이터 조회 전 스켈레톤을 표시하여 체감 성능을 높입니다.
 */
const DashboardClient = dynamic(
  () => import('./DashboardClient'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-8 pb-32 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-[28px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <div className="h-[220px] bg-slate-50 rounded-[24px]" />
          <div className="h-[220px] bg-slate-50 rounded-[24px]" />
          <div className="h-[220px] bg-slate-50 rounded-[24px]" />
        </div>
      </div>
    )
  }
);

export const DashboardContainer = () => {
  return <DashboardClient />;
};
