import { DownloadClient } from '@/features/license/ui/DownloadClient';

export const metadata = {
  title: '다운로드 - D-PLOG',
  description: 'D-PLOG 데스크톱 앱 다운로드와 제품키 발급',
};

export default function DownloadPage() {
  return <DownloadClient />;
}
