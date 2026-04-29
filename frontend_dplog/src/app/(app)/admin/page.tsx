import { AdminDashboardClient } from '@/features/admin/ui/AdminDashboardClient';

export const metadata = {
  title: '관리자 - D-PLOG',
  description: 'D-PLOG 제품키와 삭제키 관리자 모니터링',
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
