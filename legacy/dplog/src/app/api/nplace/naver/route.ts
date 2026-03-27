import { NextResponse } from "next/server";
import { ClientApiResponse } from "@/src/types/payment";
import { NaverAccountResponse } from "@/src/types/nplaceReply";
import { NplaceReplyService } from "@/src/lib/services/nplaceReplyService";

export async function GET(): Promise<NextResponse<ClientApiResponse<NaverAccountResponse>>> {
  const result = await NplaceReplyService.getNaverAccount();

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
    data: result.data ?? undefined,
  });
}

export async function POST(request: Request): Promise<NextResponse<ClientApiResponse<null>>> {
  const result = await NplaceReplyService.createNaverAccount(request);

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

export async function PUT(request: Request): Promise<NextResponse<ClientApiResponse<null>>> {
  const result = await NplaceReplyService.updateNaverAccount(request);

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
