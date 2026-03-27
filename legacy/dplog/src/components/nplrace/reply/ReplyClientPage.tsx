"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import DplogHeader from "@/src/components/common/Headers/DplogHeader";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import { loadingUtils } from "@/src/utils/loading";
import { useAuthGuard } from "@/src/utils/auth";

import ReplyContent from "@/src/components/nplrace/reply/ReplyContent";

export default function ReplyClientPage() {
  const router = useRouter();
  const { isLoading, isGuest, isLogoutPending } = useAuthGuard();
  const authConfig = useMemo(() => loadingUtils.userAuth(), []);
  const guestConfig = useMemo(() => loadingUtils.loginRedirect(), []);
  const logoutConfig = useMemo(() => loadingUtils.logoutAuth(), []);

  // 게스트 사용자 처리: 토스트 후 로그인으로 이동
  useEffect(() => {
    if (isGuest && !isLogoutPending) {
      toast.error("로그인 후 이용해주세요.", {
        id: "guest-redirect",
        duration: 3000,
      });
      router.push("/login");
    }
  }, [isGuest, isLogoutPending, router]);

  if (isLoading) {
    const config = isLogoutPending ? logoutConfig : authConfig;
    const subMessage = isLogoutPending
      ? "로그아웃을 처리하고 있습니다."
      : "사용자 인증을 확인하고 있습니다.";
    return (
      <GlobalLoadingOverlay visible config={{ ...config, subMessage }} />
    );
  }

  if (isGuest) {
    return (
      <GlobalLoadingOverlay
        visible
        config={{
          ...guestConfig,
          subMessage: "로그인 페이지로 이동합니다.",
        }}
      />
    );
  }

  return (
    <div className="mx-auto min-h-screen px-4 py-6">
      <DplogHeader title="N-PLACE" message="리뷰 요청" />
      <div className="mt-6">
        <ReplyContent />
      </div>
    </div>
  );
}
