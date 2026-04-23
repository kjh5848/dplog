'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, KeyRound, ArrowRight, Loader2, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { setCookie } from 'cookies-next';

export default function LicenseAuthPage() {
  const router = useRouter();
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const isDevMode = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_MODE === 'local';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseKey.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    // [로컬 환경(Dev) 우회 로직]
    // 정적 빌드 시 NODE_ENV는 'production'이 되므로 NEXT_PUBLIC_APP_MODE도 함께 체크합니다.
    if (isDevMode && licenseKey === 'dev') {
      setCookie('dplog_local_license', 'dev-bypass-token', { maxAge: 60 * 60 * 24 * 365, path: '/' });
      router.replace('/dashboard');
      return;
    }

    try {
      // 오프라인 파이썬 백엔드 라이선스 검증 API 호출
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/v1/auth/verify-license`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: licenseKey.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || '유효하지 않은 라이선스 키입니다.');
      }

      const data = await response.json();
      
      // JWT 토큰 혹은 성공 정보를 로컬 쿠키에 영구 저장 (1년)
      // 로컬 앱이므로 탈취에 대한 쿠키 보안 설정(httpOnly 등)보다는 클라이언트 앱 구속력이 목적입니다.
      setCookie('dplog_local_license', licenseKey, { maxAge: 60 * 60 * 24 * 365, path: '/' });
      
      // 성공 애니메이션을 잠시 보여준 후 리다이렉트
      setTimeout(() => {
        router.replace('/dashboard');
      }, 500);
      
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-indigo-500/5 text-center relative overflow-hidden ring-1 ring-slate-100">
          
          <div className="flex justify-center mb-6 relative">
            <div className="absolute inset-0 bg-blue-100/50 rounded-full blur-xl scale-150" />
            <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 relative z-10">
              <ShieldCheck className="size-8" />
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            제품키 인증
          </h2>
          <p className="text-sm text-slate-500 mb-8 font-medium">
            발급받으신 D-PLOG 시리얼 키를 입력해주세요.
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="size-5" />
              </div>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="DPLOG-..."
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-2xl pl-11 pr-4 py-4 text-[15px] font-medium outline-none transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                spellCheck={false}
                autoFocus
              />
            </div>
            
            {errorMsg && (
              <motion.p 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="text-red-500 text-[13px] font-medium text-left px-1"
              >
                {errorMsg}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={!licenseKey.trim() || isLoading}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl py-4 text-[15px] font-bold transition-all disabled:cursor-not-allowed group active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  인증하고 시작하기
                  <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
            
            {/* 개발 모드 팁 */}
            {isDevMode && (
              <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-amber-600 bg-amber-50 py-2.5 px-3 rounded-xl">
                <Info className="size-4" />
                <span>[개발 모드] 키에 'dev'를 입력하면 우회 통과됩니다.</span>
              </div>
            )}
          </form>
          
        </div>
        
        <div className="mt-8 text-center text-[13px] text-slate-400 font-medium">
          D-PLOG Local Edition Security Guard
        </div>
      </motion.div>
    </div>
  );
}
