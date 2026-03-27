import { NextResponse } from "next/server";
import { fetchMembershipCatalog } from "@/lib/services/membership";
import { logInfo, logError } from "@/src/utils/logger";
import { debugJsonSample } from "@/utils/server/debugJsonSample";

export async function GET(request: Request) {
  try {
    logInfo("[API] /api/membership/list → fetchMembershipCatalog start", { url: request.url });

    const result = await fetchMembershipCatalog();

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
        label: "/api/membership/list",
        extractSample: (parsed) => {
          const list = Array.isArray(parsed?.data?.membershipList)
            ? parsed.data.membershipList
            : [];
          return {
            count: list.length,
            sample: list[0],
          };
        },
      }
    );
  } catch (error) {
    logError("[API] /api/membership/list", error as Error, { url: request.url });

    return NextResponse.json(
      { code: -1, message: "멤버십 목록을 가져오지 못했습니다." },
      { status: 502 }
    );
  }
}
