import { NextRequest, NextResponse } from "next/server";
import { proxyBackendJson } from "@/src/utils/server/apiProxy";
import { debugJsonSample } from "@/src/utils/server/debugJsonSample";
import { logError } from "@/src/utils/logger";
import { BackendApiResponse, ClientApiResponse } from "@/src/types/payment";
import { InvoiceSummaryItem } from "@/src/types/invoice";

export async function GET(
  request: NextRequest
): Promise<Response | NextResponse<ClientApiResponse<InvoiceSummaryItem[]>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const allowedParams = ["from", "to", "status"] as const;
    const query = new URLSearchParams();

    for (const key of allowedParams) {
      const value = searchParams.get(key);
      if (value !== null && value !== undefined && value !== "") {
        query.set(key, value);
      }
    }

    const upstreamPath = `/v1/invoices/summary${query.toString() ? `?${query.toString()}` : ""}`;

    const result = await proxyBackendJson<
      BackendApiResponse<InvoiceSummaryItem[]>
    >(upstreamPath, {
      label: "invoices/summary",
    });

    const status = result.status ?? 500;
    const payload =
      result.data ??
      ({
        code: -1,
        message: "인보이스 요약 정보를 파싱하지 못했습니다.",
        data: null,
      } as BackendApiResponse<InvoiceSummaryItem[]>);

    const parsedCode =
      typeof payload.code === "number"
        ? payload.code
        : Number.parseInt(String(payload.code), 10);
    const resolvedCode = Number.isNaN(parsedCode) ? status : parsedCode;

    if (!result.ok || parsedCode !== 0 || !payload.data) {
      return NextResponse.json(
        {
          success: false,
          error: payload.message || result.text || "인보이스 요약 정보를 가져오지 못했습니다.",
          code: resolvedCode,
        },
        { status }
      );
    }

    const response = NextResponse.json(
      { success: true, data: payload.data },
      { status }
    );

    return debugJsonSample(request, response, {
      label: "/api/invoices/summary",
      extractSample: (parsed) => ({
        count: Array.isArray(parsed?.data) ? parsed.data.length : 0,
        sample: parsed?.data?.[0],
      }),
    });
  } catch (error) {
    logError("[API] /api/invoices/summary", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: "인보이스 요약 정보를 가져오지 못했습니다.",
        code: 502,
      },
      { status: 502 }
    );
  }
}
