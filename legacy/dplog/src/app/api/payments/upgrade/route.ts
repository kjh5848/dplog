import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { logError } from '@/src/utils/logger';
import {
  ClientApiResponse,
  SubscriptionUpgradeResponse,
} from '@/src/types/payment';
import { PaymentService } from '@/src/lib/services/paymentService';
import { MEMBERSHIP_CURRENT_TAG } from '@/src/constants/cacheTags';

export async function POST(
  request: Request
): Promise<NextResponse<ClientApiResponse<SubscriptionUpgradeResponse>>> {
  try {
    const result = await PaymentService.upgrade(request);

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
    const errorMessage =
      error instanceof Error ? error.message : '구독 업그레이드에 실패했습니다';

    logError('구독 업그레이드 Route 오류', error as Error, {
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
