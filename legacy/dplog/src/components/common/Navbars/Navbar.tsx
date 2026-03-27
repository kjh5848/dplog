"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import { logError } from "@/src/utils/logger";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import { loadingUtils } from "@/src/utils/loading";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { loginUser, logout, isLogoutPending } = useAuthStore(); // 로그인 상태 확인
  const [loginStatus, setLoginStatus] = useState(false);
  const logoutConfig = useMemo(
    () => loadingUtils.logoutAuth(),
    []
  );

  // 클라이언트 사이드 렌더링 확인
  useEffect(() => {
    setIsClient(true);
  }, []);

  // loginUser 상태 변화 감지하여 상태 업데이트
  useEffect(() => {
    if (isClient) {
      setLoginStatus(!!loginUser);
    }
  }, [loginUser, isClient]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("로그아웃 오류:", errorObj);
    }
  };
  
  return (
    <>
      {isLogoutPending && (
        <GlobalLoadingOverlay
          visible
          config={{
            ...logoutConfig,
            subMessage: "로그아웃을 처리하고 있습니다.",
          }}
        />
      )}
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="bg-white shadow-lg rounded-full max-w-7xl w-full">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image
                  src="/img/brand/dplog_logo.png"
                  alt="dplog"
                  width={100}
                  height={100}
                  className="object-contain w-auto h-12"
                  priority
                />
              </Link>
            </div>

            {/* 데스크탑 메뉴 */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/membership">
                <span className="text-rank-dark px-4 py-2 rounded-full text-sm font-medium hover:text-rank-primary transition-colors">
                  멤버십
                </span>
              </Link>
              {isClient && loginStatus ? (
                /* 로그인 상태: 대시보드와 로그아웃 버튼만 표시 */
                <>
                  <Link href="/track">
                    <span className="text-rank-dark px-4 py-2 rounded-full text-sm font-medium hover:text-rank-primary transition-colors">
                      순위추적하기
                    </span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    disabled={isLogoutPending}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isLogoutPending
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-rank-dark hover:text-rank-primary"
                    }`}
                  >
                    {isLogoutPending ? "로그아웃 중..." : "로그아웃"}
                  </button>
                </>
              ) : (
                /* 비로그인 상태: 로그인과 회원가입 버튼 표시 */
                <>
                  <Link href="/login">
                    <span className="text-rank-dark px-4 py-2 rounded-full text-sm font-medium hover:text-rank-primary transition-colors">
                      로그인
                    </span>
                  </Link>
                  <Link href="/join">
                    <span className="bg-rank-secondary text-gray-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors">
                      회원가입
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden flex items-center">
              {isClient && !loginStatus && (
                <Link href="/login" className="block">
                  <span className="block px-3 py-2 text-rank-dark hover:text-rank-primary text-sm font-medium transition-colors">
                    로그인
                  </span>
                </Link>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-rank-dark hover:text-rank-primary p-2"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isOpen && (
          <div className="md:hidden bg-white rounded-3xl mt-2 shadow-lg absolute w-full">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/membership" onClick={() => setIsOpen(false)}>
                <span className="block px-3 py-2 text-gray-900 hover:bg-rank-secondary text-sm font-medium rounded-md transition-colors">
                  멤버십
                </span>
              </Link>
              {isClient && loginStatus ? (
                /* 로그인 상태: 대시보드와 로그아웃 옵션 */
                <>
                  <Link href="/realtime" onClick={() => setIsOpen(false)}>
                    <span className="block px-3 py-2 text-gray-900 hover:bg-rank-secondary text-sm font-medium rounded-md transition-colors">
                      순위추적하기
                    </span>
                  </Link>
                  <button 
                    onClick={() => {
                      if (!isLogoutPending) {
                        handleLogout();
                        setIsOpen(false);
                      }
                    }}
                    disabled={isLogoutPending}
                    className={`w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isLogoutPending
                        ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                        : "text-gray-900 hover:bg-rank-secondary"
                    }`}
                  >
                    {isLogoutPending ? "로그아웃 중..." : "로그아웃"}
                  </button>
                </>
              ) : (
                /* 비로그인 상태: 회원가입 옵션 */
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <span className="block px-3 py-2 text-gray-900 hover:bg-rank-secondary text-sm font-medium rounded-md transition-colors">
                      로그인
                    </span>
                  </Link>
                  <Link href="/join" onClick={() => setIsOpen(false)}>
                    <span className="block px-3 py-2 text-gray-900 hover:bg-rank-secondary text-sm font-medium rounded-md transition-colors">
                      회원가입
                    </span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
    </>
  );
}
