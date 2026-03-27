"use client";
import { Suspense, useEffect, useMemo } from "react";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import LoadingFallback from "@/src/components/common/LoadingFallback";
import { loadingUtils } from "@/src/utils/loading";
import TrackContent from "@/src/components/nplrace/rank/track/TrackContent";
import { useAuthGuard } from "@/src/utils/auth";
import { useRouter } from "next/navigation";
import { useNplaceRankTrackViewModel } from "@/src/viewModel/nplace/track/nplaceRankTrackViewModel";
import toast from "react-hot-toast";

export default function TrackClientPage() {
  const router = useRouter();
  const { isLoading, isGuest, isLogoutPending } = useAuthGuard();
  const authConfig = useMemo(() => loadingUtils.userAuth(), []);
  const guestConfig = useMemo(() => loadingUtils.loginRedirect(), []);
  const logoutConfig = useMemo(() => loadingUtils.logoutAuth(), []);

  // ViewModel에서 직접 데이터 상태 및 에러 확인 - 모든 Hook을 최상단에서 호출
  const { error, refetchShopList } = useNplaceRankTrackViewModel();

  // 에러 발생 시 토스트 메시지 표시
  useEffect(() => {
    if (error) {
      toast.error(
        "데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      );
    }
  }, [error]);

  // 게스트 사용자 처리
  useEffect(() => {
    if (isGuest && !isLogoutPending) {
      toast.error("로그인 후 이용해주세요.", {
        id: "guest-redirect",
        duration: 3000,
      });
      router.push("/login");
    }
  }, [isGuest, isLogoutPending, router]);

  // 인증 상태에 따른 로딩 처리 - Hook 호출 후에 조건부 렌더링
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

  return (
    <main className="container min-h-screen">
      <Suspense fallback={<LoadingFallback config={loadingUtils.pageLoad()} />}>
        <TrackContent />
      </Suspense>
    </main>
  );
}
