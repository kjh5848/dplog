import { UsageLimitMeta } from '@/types/api';

const LIMIT_RESPONSE_CODES = new Set(['-9']);

export const isUsageLimitCode = (code: string | number | null | undefined) => {
  if (code === undefined || code === null) return false;
  return LIMIT_RESPONSE_CODES.has(String(code));
};

export const hasReachedUsageLimit = (meta?: UsageLimitMeta | null) => {
  if (!meta) return false;
  if (typeof meta.limit !== 'number' || typeof meta.used !== 'number') {
    return false;
  }
  if (meta.limit <= 0) {
    return false;
  }
  return meta.used >= meta.limit;
};
