import { NextResponse } from "next/server";
import { ClientApiResponse } from "@/src/types/payment";
import { NaverStatusResponse } from "@/src/types/nplaceReply";
import { NplaceReplyService } from "@/src/lib/services/nplaceReplyService";

export async function GET(): Promise<NextResponse<ClientApiResponse<NaverStatusResponse>>> {
  const result = await NplaceReplyService.getNaverStatus();

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: result.message,
        code: result.code ?? result.status,
      },
      { status: result.status },
    );
  }

  return NextResponse.json({
    success: true,
    data: result.data ?? { exists: false },
  });
}
