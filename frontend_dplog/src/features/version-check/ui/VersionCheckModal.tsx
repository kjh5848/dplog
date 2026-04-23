"use client";

import { useEffect, useState } from "react";

export function VersionCheckModal() {
  const [updateInfo, setUpdateInfo] = useState<{
    isUpdateAvailable: boolean;
    latestVersion: string;
    downloadUrl: string;
  } | null>(null);

  useEffect(() => {
    // 앱 마운트 직후 데스크탑 런처(FastAPI)의 /api/check-update 라우터를 찔러서 버전 확인
    const checkUpdate = async () => {
      try {
        const response = await fetch("/api/check-update");
        const data = await response.json();
        if (data.isUpdateAvailable) {
          setUpdateInfo(data);
        }
      } catch (error) {
        // Nuitka 패키징이 아닌 외부 웹 환경이거나 연결 실패 시 조용히 넘어감
        console.error("버전 체크 실패", error);
      }
    };
    checkUpdate();
  }, []);

  if (!updateInfo) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[400px] rounded-2xl bg-[#1A1A1A] p-6 shadow-2xl border border-white/10 text-center animate-in fade-in zoom-in duration-300">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold text-white tracking-tight">새로운 버전 출시!</h2>
        <p className="mb-6 text-sm text-gray-400">
          안정적인 사용과 새로운 기능 제공을 위해<br/>
          최신 버전({updateInfo.latestVersion})으로 업데이트해 주세요.
        </p>
        <button 
          onClick={() => window.open(updateInfo.downloadUrl, "_blank")}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white transition-all hover:opacity-90 active:scale-95"
        >
          홈페이지에서 다운로드
        </button>
      </div>
    </div>
  );
}
