'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { Loader2 } from 'lucide-react';

export function LicenseGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLicense = () => {
      const appMode = process.env.NEXT_PUBLIC_APP_MODE || 'saas';
      
      if (appMode === 'local') {
        const licenseToken = getCookie('dplog_local_license');
        
        // 무단 복제 실행 차단 (로컬 에디션 전용)
        if (!licenseToken) {
          // 키가 없으면 라이선스 입력창으로 강제 리다이렉트
          router.replace('/license');
          return;
        }
      }
      
      // SaaS 모드이거나, 로컬인데 키가 있으면 통과
      setIsChecking(false);
    };

    checkLicense();
  }, [router]);

  if (isChecking) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-[#050505]">
        <Loader2 className="size-10 font-bold text-blue-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">실행 권한을 확인하고 있습니다...</p>
      </div>
    );
  }

  return <>{children}</>;
}
