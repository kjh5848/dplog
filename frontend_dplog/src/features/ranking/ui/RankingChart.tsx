'use client';

import dynamic from 'next/dynamic';
import { SkeletonChart } from './components/SkeletonChart';
import type { TrackChartResponse } from '../model/types';

interface RankingChartProps {
  chartData: TrackChartResponse | null;
  isLoading: boolean;
}

/**
 * 30일 순위 추이 차트 (CSR 전용)
 * 
 * next/dynamic을 사용하여 서버에서 렌더링되지 않도록(SSR 강제 제외) 합니다.
 * 로딩 중에는 SkeletonChart가 표시됩니다.
 */
const RankingChartClient = dynamic(
  () => import('./RankingChartClient'),
  {
    ssr: false,
    loading: () => <SkeletonChart />
  }
);

export const RankingChart = (props: RankingChartProps) => {
  return <RankingChartClient {...props} />;
};
