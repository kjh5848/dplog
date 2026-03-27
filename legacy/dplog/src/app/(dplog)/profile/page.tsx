import { Suspense } from 'react';
import ProfileView from '@/src/components/profile/ProfileView';

export const metadata = {
  title: "프로필",
};  

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    }>
      <ProfileView />
    </Suspense>
  );
}
