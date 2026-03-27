"use client";

import { UsageLimitMeta } from "@/types/api";
import { toast } from "react-hot-toast";

const USAGE_TYPE_LABELS: Record<string, string> = {
  NPLACE_RANK_REALTIME: "실시간 순위 조회",
  NPLACE_RANK_TRACK: "키워드 추적",
  NPLACE_RANK_SHOP: "상점 등록",
  NPLACE_RANK_TRACK_KEYWORD: "키워드 등록",
  NPLACE_KEYWORD: "키워드 조회",
  NPLACE_KEYWORD_RELATION: "연관 키워드",
  BLOG_QUALITY_CHECK: "블로그 품질 검사",
  NPLACE_REVIEW_REPLY: "리뷰 답글",
  NPLACE_SHOP_REGISTER: "상점 등록",
};

const CTA_URL = "/membership";
const CTA_TEXT = "업그레이드 하기";
const TOAST_COOLDOWN_MS = 15_000;
const lastToastTimestamp: Record<string, number> = {};

const buildCtaHref = (
  usageType: string,
  recommendedPlanId?: string | null,
) => {
  const params = new URLSearchParams({
    from: "usage-limit",
    usageType,
  });
  if (recommendedPlanId) {
    params.set("planId", recommendedPlanId);
  }
  const separator = CTA_URL.includes("?") ? "&" : "?";
  return `${CTA_URL}${separator}${params.toString()}`;
};

const getLabel = (usageType: string) => {
  return USAGE_TYPE_LABELS[usageType] || usageType;
};

const formatUsageText = (limit: number | null, used: number | null) => {
  if (
    typeof limit === "number" &&
    limit > 0 &&
    typeof used === "number"
  ) {
    return `${used} / ${limit}`;
  }
  if (typeof used === "number") {
    return `${used}`;
  }
  return "";
};

const CTAButton = ({
  toastId,
  href,
  usageType,
  planId,
}: {
  toastId: string;
  href: string;
  usageType: string;
  planId?: string | null;
}) => (
  <a
    href={href}
    onClick={() => toast.dismiss(toastId)}
    data-analytics="usage-limit-cta"
    data-usage-type={usageType}
    data-plan-id={planId ?? undefined}
    className="rounded-md bg-red-600 px-3 py-1 text-sm font-semibold text-white shadow hover:bg-red-700"
  >
    {CTA_TEXT}
  </a>
);

type NotifyOptions = {
  usageType?: string;
  limit?: number | null;
  used?: number | null;
  recommendedPlanId?: string | null;
  force?: boolean;
};

export function notifyUsageLimit(
  meta?: UsageLimitMeta | null,
  options: NotifyOptions = {},
) {
  const usageType = meta?.usageType || options.usageType;
  if (!usageType) {
    return;
  }

  const limit =
    options.limit ?? (typeof meta?.limit === "number" ? meta.limit : null);
  const used =
    options.used ?? (typeof meta?.used === "number" ? meta.used : null);
  const recommendedPlanId =
    options.recommendedPlanId ??
    (typeof meta?.recommendedPlanId === "string"
      ? meta.recommendedPlanId
      : null);
  const limitReached =
    options.force ||
    (typeof limit === "number" &&
      typeof used === "number" &&
      limit > 0 &&
      used >= limit);

  if (!limitReached) {
    return;
  }

  const cacheKey = `${usageType}-limit-reached`;
  const now = Date.now();
  if (
    lastToastTimestamp[cacheKey] &&
    now - lastToastTimestamp[cacheKey] < TOAST_COOLDOWN_MS
  ) {
    return;
  }
  lastToastTimestamp[cacheKey] = now;

  const label = getLabel(usageType);
  const valueText = formatUsageText(limit, used);
  const ctaHref = buildCtaHref(usageType, recommendedPlanId);

  toast.custom(
    (t) => (
      <div className="flex max-w-md min-w-[300px] items-start gap-3 rounded-xl border border-red-200 bg-gradient-to-br from-red-50 via-red-100 to-red-200 p-4 text-red-900 shadow-2xl">
        <div className="text-lg">⚠️</div>
        <div className="flex flex-1 flex-col gap-2 text-sm">
          <div className="font-semibold">
            한도 초과 · {label}
            {valueText && (
              <span className="ml-1 text-xs text-red-700">({valueText})</span>
            )}
          </div>
          <div className="text-red-800">
            등록 가능한 수량을 모두 사용했습니다. 업그레이드하면 더 이용할 수
            있어요.
          </div>
          <div className="flex justify-end">
            <CTAButton
              toastId={t.id}
              href={ctaHref}
              usageType={usageType}
              planId={recommendedPlanId}
            />
          </div>
        </div>
      </div>
    ),
    { id: cacheKey, duration: 1500 },
  );
}
