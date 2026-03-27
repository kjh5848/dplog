"use client";
import { Suspense, useEffect, useMemo } from "react";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import LoadingFallback from "@/src/components/common/LoadingFallback";
import { loadingUtils } from "@/src/utils/loading";
import { useAuthGuard } from "@/src/utils/auth";
import { useRouter } from "next/navigation";
import DplogHeader from "@/src/components/common/Headers/DplogHeader";
import { logInfo, logWarn } from "@/src/utils/logger";
import { toast } from "react-hot-toast";
import RealtimeForm from "./RealtimeForm";

export default function RealtimeClientPage() {
  const router = useRouter();
  const { isLoading, isGuest, isAuthenticated, isLogoutPending } =
    useAuthGuard();
  const authConfig = useMemo(() => loadingUtils.userAuth(), []);
  const guestConfig = useMemo(() => loadingUtils.loginRedirect(), []);
  const logoutConfig = useMemo(() => loadingUtils.logoutAuth(), []);

  // 게스트 사용자 처리 (항상 동일한 순서로 호출)
  useEffect(() => {
    if (isGuest && !isLogoutPending) {
      toast.error("로그인 후 이용해주세요.", {
        id: "guest-redirect",
        duration: 3000,
      });
      router.push("/login");
    }
  }, [isGuest, isLogoutPending, router]);

  // 인증 상태에 따른 로딩 처리
  if (isLoading) {
    const config = isLogoutPending ? logoutConfig : authConfig;
    const subMessage = isLogoutPending
      ? "로그아웃을 처리하고 있습니다."
      : "사용자 인증을 확인하고 있습니다.";
    return (
      <>
        <GlobalLoadingOverlay visible config={{ ...config, subMessage }} />
      </>
    );
  }

  if (isGuest) {
    return (
      <>
        <GlobalLoadingOverlay
          visible
          config={{
            ...guestConfig,
            subMessage: "로그인 페이지로 이동합니다.",
          }}
        />
      </>
    );
  }

  // 인증된 사용자
  if (isAuthenticated) {
    logInfo("[RealtimeClientPage] ✅ 인증된 사용자");

    return (
      <main className="container mx-auto min-h-screen">
        <DplogHeader title="N-PLACE" message="실시간 순위조회" />
        <Suspense
          fallback={<LoadingFallback config={loadingUtils.pageLoad()} />}
        >
          <RealtimeForm />
        </Suspense>
      </main>
    );
  }

  // 예상치 못한 상태 (fallback)
  logWarn("[RealtimeClientPage] ⚠️ 예상치 못한 상태");
  return (
    <>
      <GlobalLoadingOverlay
        visible
        config={{
          ...authConfig,
          subMessage: "페이지 상태를 확인하고 있습니다.",
        }}
      />
    </>
  );
}
