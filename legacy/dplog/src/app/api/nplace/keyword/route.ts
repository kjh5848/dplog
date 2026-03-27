import { NextResponse } from "next/server";
import { ClientApiResponse } from "@/src/types/payment";
import { KeywordToolListResponse } from "@/src/types/nplaceKeyword";
import { NplaceKeywordService } from "@/src/lib/services/nplaceKeywordService";

export async function POST(request: Request): Promise<NextResponse<ClientApiResponse<KeywordToolListResponse>>> {
  const result = await NplaceKeywordService.getKeywordList(request);

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
    data: result.data ?? { keywordToolList: [] },
  });
}
