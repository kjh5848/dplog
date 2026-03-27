import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { logError } from '@/src/utils/logger';
import { ClientApiResponse, BillingKeyCompleteResponse } from '@/src/types/payment';
import { PortoneService } from '@/lib/services/portoneService';
import { MEMBERSHIP_CURRENT_TAG } from '@/src/constants/cacheTags';

export async function POST(request: Request): Promise<NextResponse<ClientApiResponse<BillingKeyCompleteResponse>>> {
  try {
    const result = await PortoneService.completeBillingKey(request);

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
    const errorMessage = error instanceof Error ? error.message : '구독 활성화에 실패했습니다';
    
    logError('빌링키 완료 처리 Route 오류', error as Error, {
      url: request.url,
      method: request.method
    });
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        code: 500
      },
      { status: 500 }
    );
  }
}
