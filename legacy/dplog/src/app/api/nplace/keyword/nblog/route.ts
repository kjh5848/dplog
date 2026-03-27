import { NextResponse } from "next/server";
import { ClientApiResponse } from "@/src/types/payment";
import { NplaceKeywordService } from "@/src/lib/services/nplaceKeywordService";

export async function GET(request: Request): Promise<NextResponse<ClientApiResponse<any>>> {
  const result = await NplaceKeywordService.getNblogInfo(request);

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
    data: result.data ?? null,
  });
}
