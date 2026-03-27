import { Phase1SetupContainer } from '@/features/onboarding/ui/phase1/Phase1SetupContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '창업 준비 - 초기 세팅 | 장사방패',
  description: '성공적인 창업을 위한 첫 걸음, 필수 정보를 입력해주세요.',
};

export default function Phase1SetupPage() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4">
      <Phase1SetupContainer />
    </main>
  );
}
