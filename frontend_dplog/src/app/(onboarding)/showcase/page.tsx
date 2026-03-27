import { FeatureShowcaseContainer } from '@/features/onboarding/ui/showcase/FeatureShowcaseContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'D-PLOG 핵심 기능 잠금 해제 | 장사방패',
  description: '상권 진단, AI 특약 스캔, 그리고 창업 로드맵까지. D-PLOG의 팩트폭행 생존 도구들을 지금 바로 만나보세요.',
};

export default function FeatureShowcasePage() {
  return <FeatureShowcaseContainer />;
}
