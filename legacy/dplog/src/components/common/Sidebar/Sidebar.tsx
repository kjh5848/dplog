"use client";

import Link from "next/link";
import Image from "next/image";
import { redirect, usePathname, useRouter } from "next/navigation";
import UserDropdown from "@/src/components/common/Dropdowns/UserDropdown";
import { useState, useEffect, useMemo } from "react";
import { Menu, X, User, LogOut, Users, Settings, Receipt } from "lucide-react";
import { useViewModeStore } from "@/src/store/useViewModeStore";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import { logInfo } from "@/src/utils/logger";
import { deriveDisplayName, deriveAvatar } from "@/src/utils/auth/mapUser";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import { loadingUtils } from "@/src/utils/loading";

export default function Sidebar() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const viewMode = useViewModeStore((state) => state.viewMode);
  const setViewMode = useViewModeStore((state) => state.setViewMode);
  const { loginUser, logout, forceRecheck, isLogoutPending } = useAuthStore();
  const logoutConfig = useMemo(() => loadingUtils.logoutAuth(), []);

  // 디버깅용 로그
  useEffect(() => {
    logInfo('[Sidebar] 현재 상태:', {
      loginUser: loginUser ? `${loginUser.username || loginUser.userName}` : loginUser,
      hasLogoutButton: !!loginUser,
      fullUserData: loginUser
    });
  }, [loginUser]);

  const hasAdminRole = useMemo(() => {
    const roles = [
      ...(loginUser?.authority ?? []),
      ...(loginUser?.roleList ?? []),
    ];
    return roles.some((role) =>
      typeof role === "string" ? role.toUpperCase().includes("ADMIN") : false,
    );
  }, [loginUser]);

  /* 라우트가 바뀌면 자동으로 드로어 닫기 */
  useEffect(() => setIsOpen(false), [pathname]);

  const toggleSidebar = () => setIsOpen(prev => !prev);

  const handleLogout = async () => {
    try {
      if (isLogoutPending) return;
      await logout();
      setIsOpen(false);
      // AuthStore.logout()에서 자동으로 리디렉션 처리됨
    } catch (error) {
      console.error('로그아웃 오류:', error);
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
      {/* ────────── 컨테이너 (xl 이상 고정) ────────── */}
      <nav className="bg-rank-sidebar relative z-40 flex flex-wrap items-center justify-between px-4 py-3 shadow-xl md:px-6 md:py-4 xl:fixed xl:top-0 xl:bottom-0 xl:left-0 xl:block xl:w-56 xl:overflow-hidden">
        <div className="mx-auto flex w-full flex-wrap items-center justify-between px-0 xl:flex-col xl:items-stretch">
          {/* 모바일/태블릿/데스크톱 토글 버튼 */}
          <button
            aria-label="Toggle sidebar"
            aria-expanded={isOpen}
            onClick={toggleSidebar}
            className="from-rank-primary to-rank-secondary flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r text-white shadow-lg transition-all duration-200 hover:scale-105 md:h-10 md:w-10 xl:hidden"
          >
            {isOpen ? (
              <X size={20} className="md:size-6" />
            ) : (
              <Menu size={20} className="md:size-6" />
            )}
          </button>

          {/* 브랜드 */}
          <Link href="/" className="flex items-center">
            <Image
              src="/img/brand/dplog_logo_v2.png"
              alt="dplog"
              width={150}
              height={40}
              priority
              sizes="(max-width: 768px) 100px, (max-width: 1024px) 120px, 150px"
              className="h-10 w-auto md:h-14 xl:h-20"
            />
          </Link>

          {/* 모바일/태블릿/데스크톱 사용자 메뉴 */}
          <ul className="flex items-center xl:hidden">
            <li>{/* <UserDropdown /> */}</li>
          </ul>

          {/* ────────── 드로어 ────────── */}
          <div
            className={`bg-rank-sidebar fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 xl:static xl:translate-x-0 xl:shadow-none ${isOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            {/* 드로어 헤더 (모바일/태블릿/데스크톱용) */}
            <div className="flex items-center justify-between p-3 md:p-4 xl:hidden">
              <Image
                src="/img/brand/dplog_logo_v2.png"
                alt="dplog"
                width={100}
                height={32}
                className="h-10 w-auto object-contain md:h-14"
              />
              <button
                aria-label="Close menu"
                onClick={toggleSidebar}
                className="from-rank-primary to-rank-secondary flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r text-white shadow-md"
              >
                <X size={20} />
              </button>
            </div>

            <hr className="my-3 border-blue-100 md:my-4" />

            {/* N-Place 도구 타이틀 */}
            <h6 className="text-rank-primary px-2 pb-2 text-xs font-semibold tracking-widest uppercase md:px-2 md:pb-3">
              N-Place 도구
            </h6>

            {/* N-Place 네비게이션 */}
            <ul className="flex flex-col gap-1 px-4 md:px-6">
              <li>
                <Link
                  href={{ pathname: "/track", query: { view: viewMode } }}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded px-2 py-1.5 text-sm font-semibold md:py-2 ${pathname.startsWith("/track")
                    ? "from-rank-primary to-rank-secondary bg-gradient-to-r bg-clip-text text-transparent"
                    : "text-white/75 hover:text-white"
                    }`}
                >
                  순위추적
                </Link>
              </li>
              <li>
                <Link
                  href="/realtime"
                  onClick={() => setIsOpen(false)}
                  className={`block rounded px-2 py-1.5 text-sm font-semibold md:py-2 ${pathname.startsWith("/realtime")
                    ? "from-rank-primary to-rank-secondary bg-gradient-to-r bg-clip-text text-transparent"
                    : "text-white/75 hover:text-white"
                    }`}
                >
                  순위조회
                </Link>
              </li>

              <li>
                <Link
                  href={{ pathname: "/keyword", query: { view: viewMode } }}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded px-2 py-1.5 text-sm font-semibold md:py-2 ${pathname === ("/keyword")
                    ? "from-rank-primary to-rank-secondary bg-gradient-to-r bg-clip-text text-transparent"
                    : "text-white/75 hover:text-white"
                    }`}
                >
                  순위비교
                </Link>
              </li>

              <li>
                <Link
                  href={{ pathname: "/keyword-search" }}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded px-2 py-1.5 text-sm font-semibold md:py-2 ${pathname === ("/keyword-search")
                    ? "from-rank-primary to-rank-secondary bg-gradient-to-r bg-clip-text text-transparent"
                    : "text-white/75 hover:text-white"
                    }`}
                >
                  키워드 조회
                </Link>
              </li>

              <li>
                <Link
                  href={{ pathname: "/reply", query: { view: viewMode } }}
                  onClick={() => setIsOpen(false)}
                  className={`block rounded px-2 py-1.5 text-sm font-semibold md:py-2 ${pathname.startsWith("/reply")
                    ? "from-rank-primary to-rank-secondary bg-gradient-to-r bg-clip-text text-transparent"
                    : "text-white/75 hover:text-white"
                    }`}
                >
                  AI 리뷰답글
                </Link>
              </li>

            </ul>

            <hr className="my-3 border-blue-100 md:my-4" />

            {/* N-BLOG 타이틀 */}
            <h6 className="text-rank-primary px-2 pb-2 text-xs font-semibold tracking-widest uppercase md:px-2 md:pb-3">
              N-BLOG 도구
            </h6>

            {/* N-BLOG 네비게이션 */}
            <ul className="flex flex-col gap-1 px-4 md:px-6">
              <li>
                <Link
                  href="/searchable"
                  onClick={() => setIsOpen(false)}
                  className={`block rounded px-2 py-1.5 text-sm font-semibold md:py-2 ${pathname.startsWith("/searchable")
                    ? "from-rank-primary to-rank-secondary bg-gradient-to-r bg-clip-text text-transparent"
                    : "text-white/75 hover:text-white"
                    }`}
                >
                  노출조회
                </Link>
              </li>
            </ul>

            <hr className="my-3 border-blue-100 md:my-4" />

            {/* 사용자 정보 및 로그아웃 (하단 고정) */}
            <ul className="flex flex-col gap-1">
              {/* 사용자 정보 - 로그인된 경우에만 표시 */}
              {loginUser && (
                <li className="mb-3 rounded-lg bg-white/10 p-3">
                  <div className="flex items-center gap-3">
                    {/* 아바타 */}
                    <div className="from-rank-primary to-rank-secondary flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r overflow-hidden">
                      {(() => {
                        const avatarUrl = deriveAvatar(loginUser as any);
                        if (avatarUrl) {
                          return (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={avatarUrl}
                              alt="프로필 이미지"
                              className="h-full w-full object-cover"
                            />
                          );
                        }
                        return <User size={16} className="text-white" />;
                      })()}
                    </div>
                    {/* 사용자 정보 */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white flex items-center gap-2">
                        {deriveDisplayName(loginUser as any)}
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[10px] font-medium ${(loginUser as any)?.provider === 'KAKAO'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                          aria-label={(loginUser as any)?.provider === 'KAKAO' ? '카카오 로그인' : '일반 로그인'}
                        >
                          {(loginUser as any)?.provider === 'KAKAO' ? '카카오 로그인' : '일반 로그인'}
                        </span>
                      </p>
                      <p className="truncate text-xs text-white/70">
                        {loginUser.authority?.join(", ") ||
                          loginUser.roleList?.join(", ") ||
                          "사용자"}
                      </p>
                    </div>
                  </div>
                </li>
              )}

              {/* 세션관리 - ADMIN 권한자만 노출 */}
              {hasAdminRole && (
                <>
                  <li>
                    <Link
                      href="/session"
                      onClick={() => setIsOpen(false)}
                      className={`sidebar-admin-link ${pathname.startsWith("/session")
                        ? "sidebar-admin-link-active"
                        : ""
                        }`}
                    >
                      <Settings size={16} />
                      세션관리
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/invoices"
                      onClick={() => setIsOpen(false)}
                      className={`sidebar-admin-link ${pathname.startsWith("/invoices")
                        ? "sidebar-admin-link-active"
                        : ""
                        }`}
                    >
                      <Receipt size={16} />
                      인보이스
                      <span className="sidebar-admin-pill">admin</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/user/list"
                      onClick={() => setIsOpen(false)}
                      className={`sidebar-admin-link ${pathname.startsWith("/user/list")
                        ? "sidebar-admin-link-active"
                        : ""
                        }`}
                    >
                      <Users size={16} />
                      회원관리
                    </Link>
                  </li>
                </>
              )}

              <li>
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm font-semibold md:py-2 ${pathname.startsWith("/profile")
                    ? "from-rank-primary to-rank-secondary bg-gradient-to-r bg-clip-text text-transparent"
                    : "text-white/75 hover:text-white"
                    }`}
                >
                  <User size={16} />
                  내정보
                </Link>
              </li>

              {/* 디버깅 정보 */}
              {/* <li className="mb-2 rounded-lg bg-red-500/20 p-2">
                <p className="text-xs text-white/90">
                  DEBUG: {loginUser ? `로그인됨 (${loginUser.username || loginUser.userName})` : `loginUser: ${String(loginUser)}`}
                </p>
                <p className="text-xs text-white/70">
                  localStorage ID: {typeof window !== 'undefined' ? localStorage.getItem('rememberId') || 'none' : 'loading'}
                </p>
                <button
                  onClick={forceRecheck}
                  className="mt-1 text-xs text-white/70 hover:text-white underline"
                >
                  🔄 재인증 체크
                </button>
              </li> */}

              {/* 로그아웃 버튼 - 항상 표시하되 상태에 따라 다른 동작 */}
              <li>
                <button
                  onClick={handleLogout}
                  disabled={isLogoutPending}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm font-medium transition-colors ${isLogoutPending
                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  <LogOut size={16} />
                  {isLogoutPending ? "로그아웃 중..." : loginUser ? "로그아웃" : "세션 정리"}
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* 오버레이 (모바일/태블릿/데스크톱) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-sm xl:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}
