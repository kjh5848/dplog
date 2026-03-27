"use server";

import { fetchMembershipDetail } from "@/lib/services/membership";
import { MembershipDetail } from "@/types/membership";
import { logInfo } from "@/src/utils/logger";

export async function getMembershipDetailAction(
  membershipLevel: number | string
): Promise<MembershipDetail> {
  const level = String(membershipLevel);
  const result = await fetchMembershipDetail(level);

  if (!result.ok || !result.data) {
    const message =
      (result.data as any)?.message ||
      "멤버십 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.";
    throw new Error(message);
  }

  const payload = result.data;

  if (!payload?.data) {
    throw new Error(
      payload?.message || "멤버십 상세 정보를 가져오지 못했습니다."
    );
  }

  logInfo("[Payment] membership detail fetched for action", {
    membershipLevel: level,
    detail: payload.data,
  });

  return payload.data;
}
