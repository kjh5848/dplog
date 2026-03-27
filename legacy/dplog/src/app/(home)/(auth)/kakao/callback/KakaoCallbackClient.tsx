"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import { logError, logInfo } from "@/src/utils/logger";
import AuthRepository from "@/src/model/AuthRepository";
import GlobalLoadingOverlay, {
  GlobalLoadingConfig,
} from "@/src/components/common/loading/GlobalLoadingOverlay";
import { loadingUtils } from "@/src/utils/loading";
import {
  mapKakaoDataToLoginUser,
  mapLocalUserToLoginUser,
} from "@/src/utils/auth/mapUser";
import {
  clearKakaoAutoPrompt,
  disableKakaoAutoPrompt,
} from "@/src/utils/api/kakaoSdk";

/**
 * [역할] 카카오 OAuth 콜백 처리 클라이언트 컴포넌트
 * [입력] URL 검색 파라미터 (code, state, error)
 * [출력] 로그인 처리 결과 UI
 * [NOTE] Suspense 경계 내에서 useSearchParams 사용
 */
export default function KakaoCallbackClient() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.dplog.kr"; // 기본값 제공
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(true);
  const { setLoginUser } = useAuthStore();
  const processingConfig: GlobalLoadingConfig = loadingUtils.loginProcessing();

  useEffect(() => {
    const handleKakaoCallback = async () => {
      let safeRedirectPath: string | null = null;
      let errorDescription: string | null = null;
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const error = searchParams.get("error");
        errorDescription = searchParams.get("error_description");

        let storedRedirect: string | null = null;
        let decodedRedirectPath: string | null = null;
        try {
          storedRedirect = localStorage.getItem("login_redirect_path");
          if (storedRedirect) {
            decodedRedirectPath = decodeURIComponent(storedRedirect);
            if (decodedRedirectPath.startsWith("/")) {
              safeRedirectPath = decodedRedirectPath;
            }
          }
        } catch (redirectError) {
          logError(
            "[KakaoCallback] redirect 저장값 읽기 실패",
            redirectError as Error,
          );
        }

        // 에러 처리
        if (error) {
          if (error === "consent_required") {
            disableKakaoAutoPrompt();
            // 사용자 동의 필요 시 login 페이지에서 다시 수동 로그인 진행
            throw new Error("카카오 사용자 동의가 필요합니다.");
          }
          throw new Error(`카카오 로그인 취소: ${error}`);
        }

        // 필수 파라미터 검증
        if (!code || !state) {
          throw new Error("카카오 로그인 정보가 올바르지 않습니다.");
        }

        // CSRF 검증
        const savedState = localStorage.getItem("kakao_oauth_state");
        if (state !== savedState) {
          throw new Error("보안 검증에 실패했습니다.");
        }

        // localStorage에서 state 제거
        localStorage.removeItem("kakao_oauth_state");

        // 카카오 콜백 처리 시작

        // 백엔드에 카카오 로그인 요청 (세션 쿠키 포함)
        const response = await fetch(`${apiBaseUrl}/v1/auth/kakao/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ code, state }),
        });

        const result = await response.json();
        logInfo("[KakaoCallback] callback response", {
          ok: response.ok,
          code: result?.code,
        });

        const isSuccess =
          response.ok &&
          (result?.code === 0 ||
            result?.code === "0" ||
            typeof result?.code === "undefined");
        if (!isSuccess) {
          throw new Error(result?.message || "카카오 로그인에 실패했습니다.");
        }

        // 콜백 성공 후 즉시 인증 정보 재검증 (동일 세션 보장)
        const info = await AuthRepository.checkAuth();
        logInfo("[KakaoCallback] checkAuth result", {
          code: info.code,
          hasUser: !!info.data?.user,
        });

        // 콜백 원본 보존
        const kakaoRaw =
          (result?.data && (result.data.user || result.data)) || null;

        if (info.code === "0" && info.data?.user) {
          // 표준 유저 응답. 단, provider 정보가 없거나 비어있으면 콜백 데이터와 병합
          const mappedLocal = mapLocalUserToLoginUser(info.data.user) as any;
          const needsKakaoMerge =
            (!mappedLocal?.provider || mappedLocal.provider === "LOCAL") &&
            !!kakaoRaw;

          if (needsKakaoMerge) {
            const mappedKakao = mapKakaoDataToLoginUser(kakaoRaw as any) as any;
            const merged = {
              ...mappedLocal,
              // Kakao 정보 우선 병합 (표시용 필드들)
              provider: "KAKAO",
              providerId: mappedKakao.providerId || mappedLocal.providerId,
              nickname: mappedKakao.nickname || mappedLocal.nickname,
              name: mappedKakao.name || mappedLocal.name,
              email: mappedLocal.email || mappedKakao.email,
              profileImage:
                mappedKakao.profileImage || mappedLocal.profileImage,
              profileImageUrl:
                mappedKakao.profileImageUrl || mappedLocal.profileImageUrl,
              thumbnailImageUrl:
                mappedKakao.thumbnailImageUrl || mappedLocal.thumbnailImageUrl,
            };
            // 로컬 오버레이 저장 (새로고침/재마운트 시에도 표시 유지)
            try {
              localStorage.setItem(
                "auth_display_overlay",
                JSON.stringify({
                  userId: merged.id,
                  provider: merged.provider,
                  providerId: merged.providerId,
                  nickname: merged.nickname,
                  name: merged.name,
                  email: merged.email,
                  profileImage: merged.profileImage,
                  profileImageUrl: merged.profileImageUrl,
                  thumbnailImageUrl: merged.thumbnailImageUrl,
                }),
              );
            } catch {}
            setLoginUser(merged as any);
          } else {
            setLoginUser(mappedLocal as any);
          }
          try {
            localStorage.removeItem("login_redirect_path");
          } catch {}
          clearKakaoAutoPrompt();
          router.push(safeRedirectPath ?? "/track");
          return;
        }

        // checkAuth가 비어있거나 카카오 원본만 제공 시: 콜백 데이터를 매핑하여 저장
        if (kakaoRaw) {
          const mappedKakao = mapKakaoDataToLoginUser(kakaoRaw);
          try {
            localStorage.setItem(
              "auth_display_overlay",
              JSON.stringify({
                userId: mappedKakao.id,
                provider: mappedKakao.provider,
                providerId: mappedKakao.providerId,
                nickname: mappedKakao.nickname,
                name: mappedKakao.name,
                email: mappedKakao.email,
                profileImage: mappedKakao.profileImage,
                profileImageUrl: mappedKakao.profileImageUrl,
                thumbnailImageUrl: mappedKakao.thumbnailImageUrl,
              }),
            );
          } catch {}
          setLoginUser(mappedKakao as any);
          try {
            localStorage.removeItem("login_redirect_path");
          } catch {}
          clearKakaoAutoPrompt();
          router.push(safeRedirectPath ?? "/track");
          return;
        }

        throw new Error(info.message || "인증 확인에 실패했습니다.");
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error("Unknown error occurred");
        logError(
          "카카오 로그인 처리 오류:",
          errorObj,
          errorDescription ? { errorDescription } : undefined,
        );
        // 오류 메시지는 토스트/리다이렉트로 대체

        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push(
            safeRedirectPath
              ? `/login?redirect=${encodeURIComponent(safeRedirectPath)}`
              : "/login",
          );
        }, 3000);
      } finally {
        setIsProcessing(false);
      }
    };

    handleKakaoCallback();
  }, [searchParams, router, setLoginUser, apiBaseUrl]);

  if (isProcessing) {
    return (
      <GlobalLoadingOverlay
        visible
        config={{
          ...processingConfig,
          subMessage: "카카오 인증을 처리하고 있습니다.",
        }}
      />
    );
  }
  // 처리 완료 시 즉시 라우팅되므로 아무것도 렌더링하지 않음
  return null;
}
