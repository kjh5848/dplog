import { NextResponse } from "next/server";
import { ClientApiResponse } from "@/src/types/payment";
import { NplaceReplyListResponse } from "@/src/types/nplaceReply";
import { NplaceReplyService } from "@/src/lib/services/nplaceReplyService";

export async function GET(): Promise<NextResponse<ClientApiResponse<NplaceReplyListResponse>>> {
  const result = await NplaceReplyService.getReplyList();

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
    data: result.data ?? { nplaceReplyList: [] },
  });
}

export async function POST(request: Request): Promise<NextResponse<ClientApiResponse<null>>> {
  const result = await NplaceReplyService.toggleReply(request);

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

  return NextResponse.json({ success: true });
}

export async function DELETE(): Promise<NextResponse<ClientApiResponse<null>>> {
  const result = await NplaceReplyService.deleteReplyInfo();

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

  return NextResponse.json({ success: true });
}
