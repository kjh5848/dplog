"use client";

import LoginForm from "@/src/components/common/auth/LoginForm";
import LoadingFallback from "@/src/components/common/LoadingFallback";
import GlobalLoadingOverlay, {
  GlobalLoadingConfig,
} from "@/src/components/common/loading/GlobalLoadingOverlay";
import { loadingUtils } from "@/src/utils/loading";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import { useRouter } from "next/navigation";
import { logInfo } from "@/src/utils/logger";

export default function LoginClientPage() {
  const { loginUser, isAuthPending } = useAuthStore();
  const router = useRouter();
  const hasRedirected = useRef(false);

  logInfo("[LoginClientPage] 상태:", {
    loginUser: loginUser
      ? `${loginUser.username || loginUser.userName}`
      : loginUser,
    loginUserType: typeof loginUser,
    isAuthPending,
    hasRedirected: hasRedirected.current,
    fullUserData: loginUser,
  });

  // 이미 로그인된 사용자는 적절한 페이지로 리다이렉트
  useEffect(() => {
    logInfo("[LoginClientPage] useEffect 실행:", {
      isAuthPending,
      hasLoginUser: !!loginUser,
      hasRedirected: hasRedirected.current,
      shouldRedirect: !isAuthPending && loginUser && !hasRedirected.current,
    });

    // 인증이 완료되고 사용자가 있으며 아직 리다이렉트하지 않았을 때
    if (!isAuthPending && loginUser && !hasRedirected.current) {
      hasRedirected.current = true;

      // URL 파라미터에서 리다이렉트 경로 확인
      const urlParams = new URLSearchParams(window.location.search);
      const redirectParam = urlParams.get("redirect");
      const decodedRedirect = redirectParam
        ? decodeURIComponent(redirectParam)
        : null;
      const isSafeRedirect = decodedRedirect?.startsWith("/") ?? false;

      logInfo("[LoginClientPage] ✅ 인증된 사용자 감지, 리다이렉트 경로:", {
        redirectParam,
        decodedRedirect,
        isSafeRedirect,
      });

      setTimeout(() => {
        if (decodedRedirect && isSafeRedirect) {
          // 리다이렉트 경로가 있으면 해당 경로로 이동
          router.replace(decodedRedirect);
        } else {
          // 기본적으로 대시보드로 이동
          router.replace("/track");
        }
      }, 100);
    }
  }, [loginUser, isAuthPending, router]);

  const renderGlobalOverlay = (
    config: GlobalLoadingConfig,
    subMessage?: string,
  ) => (
    <GlobalLoadingOverlay
      visible
      config={{ ...config, subMessage: subMessage ?? config.subMessage }}
    />
  );

  const authCheckingMessage = useMemo(() => loadingUtils.userAuth(), []);

  const redirectMessage = useMemo(() => loadingUtils.dashboardRedirect(), []);

  const fallbackMessage = useMemo(() => loadingUtils.pageStatus(), []);

  // 인증 상태 확인 중이면 로딩 표시
  if (isAuthPending) {
    return renderGlobalOverlay(
      authCheckingMessage,
      "사용자 인증을 확인하고 있습니다.",
    );
  }

  // 인증된 사용자는 리다이렉트 중 메시지 표시
  if (loginUser && !hasRedirected.current) {
    return renderGlobalOverlay(redirectMessage, "대시보드로 이동 중입니다.");
  }

  // 로그인되지 않은 사용자만 로그인 폼 표시
  if (loginUser === null) {
    logInfo("[LoginClientPage] 🔑 로그인 폼 표시");

    return (
      <div className="container mx-auto h-full px-4">
        <div className="flex h-full content-center items-center justify-center">
          <div className="w-full px-4 lg:w-6/12">
            <Suspense
              fallback={<LoadingFallback config={loadingUtils.loginForm()} />}
            >
              <LoginForm />
            </Suspense>

            <div className="relative mt-6 flex flex-wrap">
              <div className="w-1/2">
                {/* <span className="text-gray-500 text-sm">
                  비밀번호 찾기 (준비 중)
                </span> */}
              </div>
              <div className="w-1/2 text-right">
                <Link href="/join">
                  <span className="text-blueGray-500 text-sm hover:underline">
                    회원가입 &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 예상치 못한 상태 (undefined 등)
  logInfo("[LoginClientPage] ⚠️ 예상치 못한 상태, 로딩 표시");
  return renderGlobalOverlay(
    fallbackMessage,
    "사용자 상태를 확인하고 있습니다.",
  );
}
