import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  ClientApiResponse,
  SubscriptionCancelUndoResponse,
} from "@/src/types/payment";
import { SubscriptionService } from "@/src/lib/services/subscriptionService";
import { logError } from "@/src/utils/logger";
import { MEMBERSHIP_CURRENT_TAG } from "@/src/constants/cacheTags";

type UndoRouteContext = {
  params: Promise<{ subscriptionId: string }>;
};

export async function POST(
  request: NextRequest,
  { params }: UndoRouteContext
): Promise<
  NextResponse<ClientApiResponse<SubscriptionCancelUndoResponse>>
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
    const result = await SubscriptionService.undo(subscriptionId, request);

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
        : "구독 해지 예약 취소 중 오류가 발생했습니다.";

    logError("구독 해지 예약 취소 Route 오류", error as Error, {
      subscriptionId,
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
