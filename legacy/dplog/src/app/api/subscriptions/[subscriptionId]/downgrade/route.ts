import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  ClientApiResponse,
  SubscriptionDowngradeResponse,
} from "@/src/types/payment";
import {
  SubscriptionDowngradeService,
} from "@/src/lib/services/subscriptionService";
import { logError } from "@/src/utils/logger";
import { MEMBERSHIP_CURRENT_TAG } from "@/src/constants/cacheTags";

type DowngradeRouteContext = {
  params: Promise<{ subscriptionId: string }>;
};

export async function POST(
  request: NextRequest,
  { params }: DowngradeRouteContext
): Promise<NextResponse<ClientApiResponse<SubscriptionDowngradeResponse>>> {
  const { subscriptionId } = await params;

  if (!subscriptionId) {
    return NextResponse.json(
      {
        success: false,
        error: "구독 ID가 필요합니다.",
        code: 400,
      },
      { status: 400 }
    );
  }

  try {
    const result = await SubscriptionDowngradeService.schedule(
      subscriptionId,
      request
    );

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          code: result.status,
        },
        { status: result.status }
      );
    }

    revalidateTag(MEMBERSHIP_CURRENT_TAG);

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "다운그레이드 예약 중 오류가 발생했습니다.";

    logError("구독 다운그레이드 Route 오류", error as Error, {
      subscriptionId,
      method: request.method,
      url: request.url,
    });

    return NextResponse.json(
      {
        success: false,
        error: message,
        code: 500,
      },
      { status: 500 }
    );
  }
}
