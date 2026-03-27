import { NextRequest, NextResponse } from "next/server";
import { proxyBackendJson } from "@/src/utils/server/apiProxy";
import { debugJsonSample } from "@/src/utils/server/debugJsonSample";
import { logError } from "@/src/utils/logger";
import { BackendApiResponse, ClientApiResponse } from "@/src/types/payment";
import { InvoiceDetailResponse } from "@/src/types/invoice";

type InvoiceRouteContext = {
  params: Promise<{ invoiceId: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: InvoiceRouteContext
): Promise<Response | NextResponse<ClientApiResponse<InvoiceDetailResponse>>> {
  let invoiceId: string | undefined;

  try {
    invoiceId = (await params).invoiceId;

    if (!invoiceId) {
      return NextResponse.json(
        {
          success: false,
          error: "invoiceId가 필요합니다.",
          code: 400,
        },
        { status: 400 }
      );
    }

    const upstreamPath = `/v1/invoices/${encodeURIComponent(invoiceId)}`;
    const result = await proxyBackendJson<
      BackendApiResponse<InvoiceDetailResponse>
    >(upstreamPath, {
      label: `invoices/${invoiceId}`,
    });

    const status = result.status ?? 500;
    const payload =
      result.data ??
      ({
        code: -1,
        message: "인보이스 상세 정보를 파싱하지 못했습니다.",
        data: null,
      } as BackendApiResponse<InvoiceDetailResponse>);

    const parsedCode =
      typeof payload.code === "number"
        ? payload.code
        : Number.parseInt(String(payload.code), 10);
    const resolvedCode = Number.isNaN(parsedCode) ? status : parsedCode;

    if (!result.ok || parsedCode !== 0 || !payload.data) {
      return NextResponse.json(
        {
          success: false,
          error: payload.message || result.text || "인보이스 상세 정보를 가져오지 못했습니다.",
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
      label: "/api/invoices/[invoiceId]",
      extractSample: (parsed) => ({
        count: parsed?.data?.lines?.length,
        sample: parsed?.data?.invoice,
      }),
    });
  } catch (error) {
    logError("[API] /api/invoices/[invoiceId]", error as Error, {
      invoiceId,
    });

    return NextResponse.json(
      {
        success: false,
        error: "인보이스 상세 정보를 가져오지 못했습니다.",
        code: 502,
      },
      { status: 502 }
    );
  }
}
