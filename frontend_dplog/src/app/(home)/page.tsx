import { Metadata } from 'next';
import { HomeClient } from '@/features/home';

export const metadata: Metadata = {
  title: 'D-PLOG - AI 기반 오프라인 매장 진단 솔루션',
  description: 'AI로 매장을 진단하고 매출 상승을 위한 최적의 액션 플랜을 제안합니다.',
};

export default function MarketingPage() {
  return <HomeClient />;
}
