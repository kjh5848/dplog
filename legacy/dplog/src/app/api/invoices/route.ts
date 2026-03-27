import { NextRequest, NextResponse } from "next/server";
import { proxyBackendJson, proxyToBackend } from "@/src/utils/server/apiProxy";
import { debugJsonSample } from "@/src/utils/server/debugJsonSample";
import { logError } from "@/src/utils/logger";
import { BackendApiResponse, ClientApiResponse } from "@/src/types/payment";
import { InvoiceListResponse } from "@/src/types/invoice";

export async function GET(
  request: NextRequest
): Promise<Response | NextResponse<ClientApiResponse<InvoiceListResponse>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const allowedParams = [
      "status",
      "from",
      "to",
      "userId",
      "subscriptionId",
      "lineType",
      "lineDescription",
      "format",
      "page",
      "size",
      "sort",
    ] as const;
    const query = new URLSearchParams();

    for (const key of allowedParams) {
      const value = searchParams.get(key);
      if (value !== null && value !== undefined && value !== "") {
        query.set(key, value);
      }
    }

    const format = (searchParams.get("format") ?? "").toLowerCase();
    const upstreamPath = `/v1/invoices${query.toString() ? `?${query.toString()}` : ""}`;

    if (format === "csv") {
      const upstream = await proxyToBackend(upstreamPath, {
        method: "GET",
        headers: { Accept: "text/plain" },
        label: "invoices/csv",
      });

      const text = await upstream.text();

      if (!upstream.ok) {
        logError("[API] /api/invoices CSV 오류", new Error(text || "CSV error"), {
          status: upstream.status,
        });

        return NextResponse.json(
          {
            success: false,
            error: text || "인보이스 CSV를 가져오지 못했습니다.",
            code: upstream.status || 500,
          },
          { status: upstream.status || 500 }
        );
      }

      const today = new Date();
      const filename = `invoices_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}.csv`;

      return new NextResponse(text, {
        status: upstream.status,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Content-Disposition": `attachment; filename=${filename}`,
        },
      });
    }

    const result = await proxyBackendJson<BackendApiResponse<InvoiceListResponse>>(
      upstreamPath,
      { label: "invoices/list" }
    );

    const status = result.status ?? 500;
    const payload =
      result.data ??
      ({
        code: -1,
        message: "인보이스 목록을 파싱하지 못했습니다.",
        data: null,
      } as BackendApiResponse<InvoiceListResponse>);

    const parsedCode =
      typeof payload.code === "number"
        ? payload.code
        : Number.parseInt(String(payload.code), 10);
    const resolvedCode = Number.isNaN(parsedCode) ? status : parsedCode;

    if (!result.ok || parsedCode !== 0 || !payload.data) {
      return NextResponse.json(
        {
          success: false,
          error: payload.message || result.text || "인보이스 목록을 가져오지 못했습니다.",
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
      label: "/api/invoices",
      extractSample: (parsed) => ({
        count: parsed?.data?.content?.length,
        sample: parsed?.data?.content?.[0],
      }),
    });
  } catch (error) {
    logError("[API] /api/invoices", error as Error);

    return NextResponse.json(
      {
        success: false,
        error: "인보이스 목록을 가져오지 못했습니다.",
        code: 502,
      },
      { status: 502 }
    );
  }
}
