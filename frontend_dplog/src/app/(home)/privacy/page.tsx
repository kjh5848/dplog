import { Metadata } from 'next';
import { PrivacyPage } from '@/features/home';

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'D-PLOG 개인정보처리방침 - 카카오 싱크 및 마케팅 활용 포함',
};

export default function PrivacyPolicyPageWrapper() {
  return <PrivacyPage />;
}
