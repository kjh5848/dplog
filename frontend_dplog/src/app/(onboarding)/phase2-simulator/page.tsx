import { Phase2SimulatorContainer } from '@/features/onboarding/ui/phase2/Phase2SimulatorContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '팩트폭행 생존 시뮬레이터 | 장사방패',
  description: '자본금과 마진을 냉정하게 분석해 드립니다.',
};

export default function Phase2SimulatorPage() {
  return <Phase2SimulatorContainer />;
}
