import { Metadata } from 'next';
import { MarketingPage } from '@/features/home';

export const metadata: Metadata = {
  title: '마케팅 정보활용 동의',
  description: 'D-PLOG 마케팅 정보활용 동의 - 선택 동의 항목',
};

export default function MarketingConsentPageWrapper() {
  return <MarketingPage />;
}
