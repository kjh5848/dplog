import { Metadata } from 'next';
import { TermsPage } from '@/features/home';

export const metadata: Metadata = {
  title: '서비스 이용약관',
  description: 'D-PLOG 서비스 이용약관 - 네이버 플레이스 순위 추적 서비스',
};

export default function TermsOfServicePage() {
  return <TermsPage />;
}
