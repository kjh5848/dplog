import { NextRequest, NextResponse } from "next/server";
import { proxyBackendJson } from "@/src/utils/server/apiProxy";
import { debugJsonSample } from "@/src/utils/server/debugJsonSample";
import { logError } from "@/src/utils/logger";
import { MembershipProfileSummaryResponse } from "@/types/membership";

export async function GET(
  request: NextRequest
): Promise<Response> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const allowedParams = ["userId", "historyLimit", "historyCursor"] as const;
    const query = new URLSearchParams();

    for (const key of allowedParams) {
      const value = searchParams.get(key);
      if (value !== null && value !== undefined && value !== "") {
        query.set(key, value);
      }
    }

    const upstreamPath = `/v1/membership/profile-summary${query.toString() ? `?${query.toString()}` : ""}`;

    const result = await proxyBackendJson<MembershipProfileSummaryResponse>(upstreamPath, {
      label: "membership/profile-summary",
    });

    const status = result.status ?? 500;
    const payload =
      result.data ??
      ({
        code: -1,
        message: "멤버십 프로필 요약 정보를 파싱하지 못했습니다.",
        data: null,
      } as MembershipProfileSummaryResponse);

    const response = NextResponse.json(payload, { status });

    if (!result.ok) {
      return response;
    }

    return debugJsonSample(request, response, {
      label: "/api/membership/profile-summary",
      extractSample: (parsed) => parsed?.data ?? parsed,
    });
  } catch (error) {
    logError("[API] /api/membership/profile-summary", error as Error);

    return NextResponse.json(
      {
        code: -1,
        message: "멤버십 프로필 요약 정보를 가져오지 못했습니다.",
        data: null,
      },
      { status: 502 }
    );
  }
}
