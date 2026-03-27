import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { SubscriptionService } from "@/src/lib/services/subscriptionService";
import {
  ClientApiResponse,
  SubscriptionCancelResponse,
} from "@/src/types/payment";
import { logError } from "@/src/utils/logger";
import { MEMBERSHIP_CURRENT_TAG } from "@/src/constants/cacheTags";

type CancelRouteContext = {
  params: Promise<{ subscriptionId: string }>;
};

export async function DELETE(
  request: NextRequest,
  { params }: CancelRouteContext
): Promise<
  NextResponse<ClientApiResponse<SubscriptionCancelResponse>>
> {
  let subscriptionId: string | undefined;
  const resolvedParams = await params;
  subscriptionId = resolvedParams.subscriptionId;

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
    const result = await SubscriptionService.cancel(subscriptionId, request);

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
        : "구독 해지 처리 중 오류가 발생했습니다.";

    logError("구독 해지 Route 오류", error as Error, {
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
