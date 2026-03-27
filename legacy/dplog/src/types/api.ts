import { UsagePeriodType } from "./membership";

export interface UsageLimitMeta {
  /**
   * 백엔드 ServiceSort.name()에서 내려오는 사용량 구분 키
   * 예: NPLACE_RANK_REALTIME, NPLACE_RANK_TRACK, BLOG_SEARCH 등
   */
  usageType: string;
  limit?: number | null;
  used?: number | null;
  periodType?: UsagePeriodType | string | null;
  periodKey?: string | null;
  recommendedPlanId?: string | null;
}

export interface ApiResponse<T> {
  code: string | number;
  data: T;
  message: string;
  meta?: UsageLimitMeta;
}
