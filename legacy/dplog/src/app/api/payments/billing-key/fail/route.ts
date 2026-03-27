import { NextResponse } from 'next/server';
import { logError } from '@/src/utils/logger';
import { ClientApiResponse, BillingKeyFailResponse } from '@/src/types/payment';
import { PortoneService } from '@/lib/services/portoneService';

export async function POST(request: Request): Promise<NextResponse<ClientApiResponse<BillingKeyFailResponse>>> {
  try {
    const result = await PortoneService.recordFailure(request);

    if (!result.ok) {
      logError('빌링키 실패 기록 Route 경고', new Error(result.message), {
        status: result.status,
      });

      return NextResponse.json({
        success: true,
        data: {
          retryAvailable: false,
          remainingRetries: 0,
          message: '실패가 기록되었습니다',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    // 실패 기록이 실패해도 사용자에게는 성공으로 응답
    // (실패 기록은 내부 로깅 용도)
    const errorMessage = error instanceof Error ? error.message : '실패 기록 중 오류 발생';
    
    logError('빌링키 실패 기록 Route 오류', error as Error, {
      url: request.url,
      method: request.method
    });
    
    // 사용자에게는 성공으로 응답하되, 재시도 불가로 설정
    return NextResponse.json({ 
      success: true,
      data: {
        retryAvailable: false,
        remainingRetries: 0,
        message: '실패가 기록되었습니다'
      }
    });
  }
}
