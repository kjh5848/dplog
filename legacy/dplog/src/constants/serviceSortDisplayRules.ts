import {
  KnownExtrasServiceSortKey,
  KnownServiceSortKey,
  UsagePeriodType,
} from "@/types/membership";

export type ServiceSortDisplayKey =
  | KnownServiceSortKey
  | KnownExtrasServiceSortKey
  | (string & {});

export interface ServiceSortDisplayRule {
  key: ServiceSortDisplayKey;
  label: string;
  description?: string;
  limitUnit: UsagePeriodType;
  approxMonthlyHint?: string;
  serviceSortCode?: string;
}

const baseRules = {
  trackKeywords: {
    key: "trackKeywords",
    label: "순위추적",
    description: "월간 기준으로 제공되는 추적 슬롯",
    limitUnit: "MONTHLY",
    serviceSortCode: "NPLACE_RANK_TRACK",
  },
  realtimeQueries: {
    key: "realtimeQueries",
    label: "순위조회",
    description: "실시간 순위 조회 호출 수",
    limitUnit: "DAILY",
    approxMonthlyHint: "≈월간 호출량(참고용)",
    serviceSortCode: "NPLACE_RANK_REALTIME",
  },
  relationKeywords: {
    key: "relationKeywords",
    label: "연관 키워드",
    description: "연관 키워드 탐색 횟수",
    limitUnit: "DAILY",
    approxMonthlyHint: "≈월간 호출량(참고용)",
    serviceSortCode: "NPLACE_KEYWORD_RELATION",
  },
  keywordLookups: {
    key: "keywordLookups",
    label: "키워드 조회",
    description: "키워드 검색/조회 횟수",
    limitUnit: "DAILY",
    approxMonthlyHint: "≈월간 호출량(참고용)",
    serviceSortCode: "NPLACE_KEYWORD",
  },
  shopRegistrations: {
    key: "shopRegistrations",
    label: "상점 등록",
    description: "월간 기준 상점 등록 슬롯",
    limitUnit: "MONTHLY",
    serviceSortCode: "NPLACE_SHOP_REGISTER",
  },
  blogQualityChecks: {
    key: "blogQualityChecks",
    label: "블로그 품질 검사",
    description: "블로그 저품질 검사 횟수",
    limitUnit: "DAILY",
    approxMonthlyHint: "≈월간 호출량(참고용)",
    serviceSortCode: "BLOG_QUALITY_CHECK",
  },
  reviewReplies: {
    key: "reviewReplies",
    label: "리뷰 답글",
    description: "리뷰 답글 자동 작성",
    limitUnit: "DAILY",
    serviceSortCode: "NPLACE_REVIEW_REPLY",
  },
} satisfies Record<string, ServiceSortDisplayRule>;

export const SERVICE_SORT_DISPLAY_RULES: Record<
  string,
  ServiceSortDisplayRule
> = baseRules;

export const getServiceSortDisplayRule = (
  key: string,
): ServiceSortDisplayRule | undefined => {
  if (!key) {
    return undefined;
  }
  const normalizedKey = key.replace(/^extras\./, "");
  return SERVICE_SORT_DISPLAY_RULES[normalizedKey];
};
