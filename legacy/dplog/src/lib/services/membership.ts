import { proxyBackendJson } from "@/utils/server/apiProxy";
import {
  MembershipCatalogResponse,
  MembershipDetailResponse,
  MembershipProfileSummaryResponse,
} from "@/types/membership";

/**
 * 특정 멤버십 레벨에 대한 상세 정보를 백엔드에서 가져옵니다.
 * @param membershipLevel 조회할 멤버십 레벨 식별자
 */
export async function fetchMembershipDetail(
  membershipLevel: string
) {
  return proxyBackendJson<MembershipDetailResponse>(
    `/v1/membership/${membershipLevel}`,
    {
      label: `membership/${membershipLevel}`,
    }
  );
}


/**
 * 모든 멤버십 카탈로그 목록을 백엔드에서 가져옵니다.
 * @returns 멤버십 카탈로그 응답 (MembershipCatalogResponse)
 */
export async function fetchMembershipCatalog() {
  return proxyBackendJson<MembershipCatalogResponse>("/v1/membership/list", {
    label: "membership/list",
  });
}

interface FetchProfileSummaryParams {
  userId?: string | number;
  historyLimit?: number;
  historyCursor?: string;
}

export async function fetchMembershipProfileSummary(
  params: FetchProfileSummaryParams = {}
) {
  const query = new URLSearchParams();

  if (params.userId !== undefined && params.userId !== null) {
    query.set("userId", String(params.userId));
  }

  if (typeof params.historyLimit === "number" && !Number.isNaN(params.historyLimit)) {
    query.set("historyLimit", String(params.historyLimit));
  }

  if (params.historyCursor) {
    query.set("historyCursor", params.historyCursor);
  }

  const path = `/v1/membership/profile-summary${query.toString() ? `?${query.toString()}` : ""}`;

  return proxyBackendJson<MembershipProfileSummaryResponse>(path, {
    label: "membership/profile-summary",
  });
}
