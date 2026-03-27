import { DashboardContainer } from '@/features/dashboard/ui/DashboardContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '사장님 생존 대시보드 | 장사방패',
  description: 'D-PLOG 사장님 맞춤형 전체 로드맵 및 실행 미션 현황입니다.',
};

export default function DashboardPage() {
  return <DashboardContainer />;
}
