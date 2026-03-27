import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logError, logInfo } from "@/src/utils/logger";
import {
  ClientApiResponse,
  SubscriptionStatusResponse,
  BackendApiResponse,
} from "@/src/types/payment";
import { proxyBackendJson } from "@/src/utils/server/apiProxy";

export async function GET(
  request: Request
): Promise<NextResponse<ClientApiResponse<SubscriptionStatusResponse>>> {
  try {
    const cookieStore = await cookies();
    const hasSession = Boolean(cookieStore.get("JSESSIONID"));

    if (!hasSession) {
      logInfo("구독 상태 조회 실패: 세션 없음");
      return NextResponse.json(
        {
          success: false,
          error: "로그인이 필요합니다",
          code: 401,
        },
        { status: 401 }
      );
    }

    const upstream = await proxyBackendJson<
      BackendApiResponse<SubscriptionStatusResponse>
    >("/v1/payments/subscriptions/status", {
      method: "GET",
      label: "subscription-status",
    });

    if (!upstream.ok || !upstream.data) {
      const message =
        (upstream.data as any)?.message ||
        upstream.text ||
        "구독 상태 조회에 실패했습니다";

      logError(
        "구독 상태 조회 백엔드 호출 실패",
        new Error(message),
        {
          status: upstream.status,
          response: upstream.text,
        }
      );

      return NextResponse.json(
        {
          success: false,
          error: message,
          code: upstream.status || 500,
        },
        { status: upstream.status || 500 }
      );
    }

    type RawSubscriptionStatusResponse = {
      hasActiveSubscription?: boolean;
      subscription?:
        | SubscriptionStatusResponse['subscriptions'][number]
        | null;
      subscriptions?: SubscriptionStatusResponse['subscriptions'];
    } & Record<string, unknown>;

    const payload =
      upstream.data as BackendApiResponse<unknown>;
    const rawData = (payload?.data ?? null) as RawSubscriptionStatusResponse | null;
    const subscriptionsFromRaw: SubscriptionStatusResponse['subscriptions'] =
      Array.isArray(rawData?.subscriptions)
        ? rawData.subscriptions
        : rawData?.subscription
          ? [rawData.subscription]
          : [];

    const normalized: SubscriptionStatusResponse = {
      hasActiveSubscription:
        typeof rawData?.hasActiveSubscription === "boolean"
          ? rawData.hasActiveSubscription
          : subscriptionsFromRaw.some(
              (item) =>
                item?.status === "ACTIVE" ||
                item?.status === "PENDING_CANCEL",
            ),
      subscriptions: subscriptionsFromRaw,
    };

    logInfo("구독 상태 조회 성공", {
      hasActiveSubscription: normalized.hasActiveSubscription,
      subscriptionCount: normalized.subscriptions.length,
    });

    return NextResponse.json({
      success: true,
      data: normalized,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "구독 상태 조회에 실패했습니다";

    logError("구독 상태 조회 Route 오류", error as Error, {
      url: request.url,
      method: request.method,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: 500,
      },
      { status: 500 }
    );
  }
}
