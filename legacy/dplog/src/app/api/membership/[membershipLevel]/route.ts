import { NextRequest, NextResponse } from "next/server";
import { fetchMembershipDetail } from "@/lib/services/membership";
import { debugJsonSample } from "@/src/utils/server/debugJsonSample";
import { logError } from "@/src/utils/logger";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ membershipLevel: string }> }
): Promise<Response> {
  let membershipLevel = 'unknown';
  try {
    ({ membershipLevel } = await context.params);
    const result = await fetchMembershipDetail(membershipLevel);
    const status = result.status ?? 500;
    const payload = result.data ?? { code: -1, message: "응답을 파싱하지 못했습니다." };

    const response = NextResponse.json(payload, { status });

    if (!result.ok) {
      return response;
    }

    return debugJsonSample(
      request,
      response,
      {
        label: "/api/membership/[membershipLevel]",
        extractSample: (parsed) => parsed?.data ?? parsed,
      }
    );
  } catch (error) {
    logError("[API] /api/membership/[membershipLevel]", error as Error, {
      level: membershipLevel,
    });

    return NextResponse.json(
      { code: -1, message: "멤버십 상세 정보를 가져오지 못했습니다." },
      { status: 502 }
    );
  }
}
