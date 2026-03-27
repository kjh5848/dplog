import PaymentClientPage from "./PaymentClientPage";
import {
  MembershipCatalogItem,
  MembershipCatalogResponse,
  CurrentMembershipResponse,
} from "@/types/membership";
import { BillingCycleType } from "@/src/types/payment";
import type { Subscription } from "@/src/model/PriceRepository";
import { buildCookieHeader } from "@/utils/server/buildCookieHeader";
import { MEMBERSHIP_CURRENT_TAG } from "@/src/constants/cacheTags";
import { logError } from "@/src/utils/logger";

const ONE_HOUR = 60 * 60;
const MEMBERSHIP_CURRENT_REVALIDATE_SECONDS = 60 * 5;

type Nullable<T> = T | null;

type MembershipCurrentApiData = CurrentMembershipResponse & {
  billingCycle?: string | null;
  billingCycleType?: string | null;
  period?: string | null;
  priceMonthly?: number | null;
  priceYearly?: number | null;
  price?: number | null;
  currentMembershipPrice?: number | null;
  currentMembershipPriceMonthly?: number | null;
  currentMembershipPriceYearly?: number | null;
  nextBillingDate?: string | null;
  paymentMethod?: string | null;
  autoRenewal?: boolean | null;
  pendingDowngrade?: Subscription["pendingDowngrade"];
  pendingCancel?: Subscription["pendingCancel"];
  updatedAt?: string | null;
};

interface MembershipCurrentApiResponse {
  code?: number;
  message?: string;
  data?: Nullable<MembershipCurrentApiData>;
}

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
};

const fetchMembershipCatalog = async (): Promise<MembershipCatalogItem[]> => {
  try {
    const response = await fetch(`${getBaseUrl()}/api/membership/list`, {
      next: { revalidate: ONE_HOUR },
    });

    if (!response.ok) {
      console.error("[payment] 멤버십 목록 응답 오류", {
        status: response.status,
        text: await response.text().catch(() => ""),
      });
      return [];
    }

    const payload = (await response.json()) as MembershipCatalogResponse;
    const list = Array.isArray(payload?.data?.membershipList)
      ? [...payload.data.membershipList].sort(
          (a, b) => a.sortOrder - b.sortOrder,
        )
      : [];

    if (list.length === 0) {
      console.warn("[payment] 멤버십 목록이 비어 있습니다.");
    }

    return list;
  } catch (error) {
    console.error("[payment] 멤버십 목록 fetch 실패", error);
    return [];
  }
};

const normalizeBillingCycle = (value?: string | null): BillingCycleType => {
  if (typeof value !== "string") {
    return "MONTHLY";
  }
  return value.toUpperCase() === "YEARLY" ? "YEARLY" : "MONTHLY";
};

const mapCurrentMembershipToSubscription = (
  data: MembershipCurrentApiData,
): Subscription => {
  const membershipId =
    typeof data.membershipId === "number" ? data.membershipId : 0;
  const period = normalizeBillingCycle(
    data.billingCycle ?? data.billingCycleType ?? data.period ?? "MONTHLY",
  );
  const monthlyPrice =
    data.priceMonthly ??
    data.currentMembershipPriceMonthly ??
    data.price ??
    data.currentMembershipPrice ??
    0;
  const yearlyPrice =
    data.priceYearly ??
    data.currentMembershipPriceYearly ??
    (monthlyPrice ? monthlyPrice * 12 : null);
  const resolvedPrice =
    period === "YEARLY" ? yearlyPrice ?? monthlyPrice : monthlyPrice;
  const startDate =
    data.startDate ?? new Date().toISOString().slice(0, 19) + "Z";
  const endDate =
    data.endDate ??
    data.nextBillingDate ??
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const status =
    data.membershipState === "ACTIVATE"
      ? "ACTIVE"
      : data.membershipState === "PENDING_CANCEL"
        ? "PENDING_CANCEL"
        : "EXPIRED";

  return {
    id: `membership_${membershipId || "unknown"}`,
    userId: "current_user",
    planId: membershipId ? String(membershipId) : "unknown",
    plan: {
      id: membershipId ? String(membershipId) : "unknown",
      name: data.membershipName ?? "현재 구독",
      price: resolvedPrice ?? 0,
      originalPrice: resolvedPrice ?? 0,
      period,
      features: [],
      isActive: status === "ACTIVE" || status === "PENDING_CANCEL",
      createdDate: startDate,
      updatedDate: data.updatedAt ?? startDate,
    },
    status,
    period,
    startDate,
    endDate,
    amount: resolvedPrice ?? undefined,
    nextBillingDate: data.nextBillingDate ?? data.endDate ?? undefined,
    autoRenewal:
      typeof data.autoRenewal === "boolean" ? data.autoRenewal : true,
    paymentMethod: data.paymentMethod ?? "CARD",
    billingKey: undefined,
    createdDate: startDate,
    updatedDate: data.updatedAt ?? startDate,
    pendingDowngrade: data.pendingDowngrade ?? null,
    pendingCancel: data.pendingCancel ?? null,
  };
};

const fetchCurrentSubscriptionForPayment =
  async (): Promise<Subscription | null> => {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiBaseUrl) {
      logError(
        "[payment] NEXT_PUBLIC_API_URL 미설정으로 현재 구독 정보를 불러오지 못했습니다.",
        new Error("API base URL missing"),
      );
      return null;
    }

    const cookieHeader = await buildCookieHeader();

    if (!cookieHeader) {
      return null;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/v1/membership/current`, {
        headers: {
          Accept: "application/json",
          Cookie: cookieHeader,
        },
        next: {
          revalidate: MEMBERSHIP_CURRENT_REVALIDATE_SECONDS,
          tags: [MEMBERSHIP_CURRENT_TAG],
        },
      });

      if (!response.ok) {
        if ([401, 403, 404].includes(response.status)) {
          return null;
        }
        console.error("[payment] 현재 구독 응답 오류", {
          status: response.status,
          text: await response.text().catch(() => ""),
        });
        return null;
      }

      const payload =
        (await response.json()) as MembershipCurrentApiResponse;

      if (payload.code !== 0 || !payload.data) {
        return null;
      }

      return mapCurrentMembershipToSubscription(payload.data);
    } catch (error) {
      console.error("[payment] 현재 구독 fetch 실패", error);
      return null;
    }
  };

type PaymentPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";

export default async function PaymentPage({
  searchParams,
}: PaymentPageProps) {
  const [membershipPlans, initialCurrentSubscription] = await Promise.all([
    fetchMembershipCatalog(),
    fetchCurrentSubscriptionForPayment(),
  ]);
  const resolvedSearchParams = (await searchParams) ?? {};
  const planIdParam = resolvedSearchParams?.planId;
  const planId =
    typeof planIdParam === "string" && planIdParam.length > 0
      ? planIdParam
      : null;

  const periodParam = resolvedSearchParams?.period;
  const initialPeriod: BillingCycleType =
    periodParam === "YEARLY" ? "YEARLY" : "MONTHLY";

  return (
    <PaymentClientPage
      initialMembershipPlans={membershipPlans}
      initialPlanId={planId}
      initialPeriod={initialPeriod}
      initialCurrentSubscription={initialCurrentSubscription}
    />
  );
}
