import { NextResponse } from 'next/server';
import { logError } from '@/src/utils/logger';
import { ClientApiResponse, PaymentPreRegisterResponse } from '@/src/types/payment';
import { PaymentService } from '@/lib/services/paymentService';

export async function POST(
  request: Request
): Promise<NextResponse<ClientApiResponse<PaymentPreRegisterResponse>>> {
  try {
    const result = await PaymentService.preRegister(request);

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

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '서버 오류가 발생했습니다';

    logError('결제 사전등록 Route 오류', error as Error, {
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
