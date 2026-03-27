import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiResponse, UsageLimitMeta } from "@/types/api";
import { TrackInfo } from "@/src/model/TrackRepository";
import TrackRepository, { Shop } from '@/src/model/TrackRepository';
import { logError } from '@/src/utils/logger';
import { TrackGroup } from "@/src/types/group";
import { notifyUsageLimit } from '@/src/utils/usageLimitNotifier';
import { isUsageLimitCode } from '@/src/utils/usageLimit';

// 타입 정의


export interface RankInfo {
  rank: number;
  totalCount: number;
}

export interface nplaceRankSearchShop {
  trackInfo: TrackInfo;
  rankInfo: RankInfo;
}

export interface SearchParams {
  keyword: string;
  filterType: 'SHOP_ID' | 'COMPANY_NAME';
  filterValue: string;
  province: string;
  timestamp?: number;
}

type ErrorWithUsageMeta = Error & {
  code?: string | number;
  meta?: UsageLimitMeta;
};

export const REALTIME_USAGE_TYPE = "NPLACE_RANK_REALTIME";

const createErrorWithMeta = (
  message: string,
  code?: string | number,
  meta?: UsageLimitMeta,
): ErrorWithUsageMeta => {
  const error = new Error(message) as ErrorWithUsageMeta;
  if (code !== undefined) {
    error.code = code;
  }
  if (meta) {
    error.meta = meta;
  }
  return error;
};

export const isUsageLimitError = (
  error: unknown,
): error is ErrorWithUsageMeta => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as Partial<ErrorWithUsageMeta>;
  if (candidate.code === undefined || candidate.code === null) {
    return false;
  }

  return isUsageLimitCode(candidate.code);
};

const notifyRealtimeUsageLimit = (meta?: UsageLimitMeta) => {
  notifyUsageLimit(meta, {
    usageType: meta?.usageType ?? REALTIME_USAGE_TYPE,
    limit:
      typeof meta?.limit === "number"
        ? meta.limit
        : null,
    used:
      typeof meta?.used === "number"
        ? meta.used
        : null,
    force: true,
  });
};

// 검색 API 호출 함수
const fetchSearchResults = async (params: SearchParams): Promise<ApiResponse<{ nplaceRankSearchShopList: nplaceRankSearchShop[] }>> => {
  if (!params.filterValue.trim() || !params.keyword.trim()) {
    throw new Error("업체명/SHOP_ID와 키워드를 모두 입력해주세요.");
  }

  const query = new URLSearchParams({
    keyword: params.keyword,
    filterType: params.filterType,
    filterValue: params.filterValue,
    province: params.province
  });

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/v1/nplace/rank/realtime?${query.toString()}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const text = await response.text().catch(() => "");

  if (!text) {
    if (!response.ok) {
      throw new Error(response.statusText || "서버 오류가 발생했습니다.");
    }
    return {
      code: "0",
      data: { nplaceRankSearchShopList: [] },
      message: "",
    };
  }

  try {
    const data = JSON.parse(text);
    const payload: ApiResponse<{ nplaceRankSearchShopList: nplaceRankSearchShop[] }> = {
      code: typeof data.code === "number" ? data.code : String(data.code),
      data: data.data,
      message: data.message || "",
      meta: data.meta,
    };

    const normalizedCode = String(payload.code);
    const isSuccess = normalizedCode === "0";

    if (!response.ok || !isSuccess) {
      const errorCode = payload.code ?? response.status;
      throw createErrorWithMeta(
        payload.message || response.statusText || "검색 중 오류가 발생했습니다.",
        errorCode,
        payload.meta,
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof Error && (error as ErrorWithUsageMeta).code !== undefined) {
      throw error;
    }

    const errorObj = error instanceof Error ? error : new Error("Unknown error occurred");
    logError("응답 처리 중 에러 발생", errorObj, { operation: "fetchSearchResults" });
    throw errorObj;
  }
};

// 검색어 상태를 저장하기 위한 로컬 캐시 키
const RECENT_SEARCH_CACHE_KEY = "recentSearches";
const RECENT_RESULTS_CACHE_KEY = "recentSearchResults";

export type MembershipLevel = 0 | 1 | 2 | 3;

const HISTORY_POLICY: Record<MembershipLevel, { ttlMs: number | null; max: number }> = {
  0: { ttlMs: 24 * 60 * 60 * 1000, max: 3 },
  1: { ttlMs: 7 * 24 * 60 * 60 * 1000, max: 10 },
  2: { ttlMs: 30 * 24 * 60 * 60 * 1000, max: 30 },
  3: { ttlMs: null, max: 50 },
};

export const resolveMembershipLevel = (membershipId?: number, membershipName?: string): MembershipLevel => {
  const name = membershipName || "";
  if (membershipId === 13 || /마스터|master/i.test(name)) return 3;
  if (membershipId === 12 || /성장|growth/i.test(name)) return 2;
  if (membershipId === 11 || /실속|value/i.test(name)) return 1;
  if (membershipId === 2 || /체험|무료|free/i.test(name)) return 0;
  return 0;
};

const isSearchParamsLike = (item: unknown): item is SearchParams => {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<SearchParams>;
  const isValidFilter =
    candidate.filterType === "SHOP_ID" || candidate.filterType === "COMPANY_NAME";
  return (
    typeof candidate.keyword === "string" &&
    typeof candidate.filterValue === "string" &&
    typeof candidate.province === "string" &&
    isValidFilter
  );
};

const parseStoredSearches = (stored: string | null): SearchParams[] => {
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(isSearchParamsLike)
      .map((item) => ({
        keyword: item.keyword,
        filterType: item.filterType,
        filterValue: item.filterValue,
        province: item.province,
        timestamp:
          typeof item.timestamp === "number" ? item.timestamp : undefined,
      }));
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error("Unknown error occurred");
    logError("최근 검색어 파싱 실패", errorObj, { operation: "parseStoredSearches" });
    return [];
  }
};

type StoredSearchResult = {
  params: SearchParams;
  results: nplaceRankSearchShop[];
  timestamp: number;
};

const isStoredResultLike = (item: unknown): item is StoredSearchResult => {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Partial<StoredSearchResult>;
  return (
    isSearchParamsLike(candidate.params) &&
    Array.isArray(candidate.results) &&
    typeof candidate.timestamp === "number"
  );
};

const parseStoredSearchResults = (stored: string | null): StoredSearchResult[] => {
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(isStoredResultLike)
      .map((item) => ({
        params: {
          keyword: item.params.keyword,
          filterType: item.params.filterType,
          filterValue: item.params.filterValue,
          province: item.params.province,
          timestamp:
            typeof item.params.timestamp === "number" ? item.params.timestamp : undefined,
        },
        results: Array.isArray(item.results) ? item.results : [],
        timestamp: typeof item.timestamp === "number" ? item.timestamp : Date.now(),
      }));
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error("Unknown error occurred");
    logError("최근 검색 결과 파싱 실패", errorObj, {
      operation: "parseStoredSearchResults",
    });
    return [];
  }
};

const cleanupWithPolicy = <T extends { timestamp?: number }>(
  items: T[],
  level: MembershipLevel,
): T[] => {
  const { ttlMs, max } = HISTORY_POLICY[level];
  const now = Date.now();
  const filtered = ttlMs
    ? items.filter((item) => typeof item.timestamp === "number" && now - (item.timestamp || 0) <= ttlMs)
    : items;
  const deduped: T[] = [];
  for (const item of filtered) {
    const key = JSON.stringify(item);
    if (!deduped.some((d) => JSON.stringify(d) === key)) {
      deduped.push(item);
    }
  }
  return deduped.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)).slice(0, max);
};

// 최근 검색어 저장 (멤버십 정책 적용)
const saveRecentSearch = (params: SearchParams, level: MembershipLevel) => {
  try {
    const searches = parseStoredSearches(
      localStorage.getItem(RECENT_SEARCH_CACHE_KEY),
    );
    
    // 중복 제거
    const filteredSearches = searches.filter(
      (search: SearchParams) =>
        !(
          search.filterValue === params.filterValue &&
          search.filterType === params.filterType &&
          search.keyword === params.keyword &&
          search.province === params.province
        )
    );
    
    const updatedSearches = cleanupWithPolicy(
      [params, ...filteredSearches].map((s) => ({ ...s, timestamp: Date.now() })),
      level,
    );
    localStorage.setItem(RECENT_SEARCH_CACHE_KEY, JSON.stringify(updatedSearches));
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    logError("최근 검색어 저장 실패", errorObj, { operation: 'saveRecentSearch' });
  }
};

// 최근 검색어 불러오기
export const getRecentSearches = (level: MembershipLevel): SearchParams[] => {
  try {
    const parsed = parseStoredSearches(
      localStorage.getItem(RECENT_SEARCH_CACHE_KEY),
    );
    const cleaned = cleanupWithPolicy(parsed, level);
    localStorage.setItem(RECENT_SEARCH_CACHE_KEY, JSON.stringify(cleaned));
    return cleaned;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    logError("최근 검색어 불러오기 실패", errorObj, { operation: 'getRecentSearches' });
    return [];
  }
};

// 검색 결과 저장 (멤버십 정책 적용)
const saveSearchResults = (
  params: SearchParams,
  results: ApiResponse<{ nplaceRankSearchShopList: nplaceRankSearchShop[] }>,
  level: MembershipLevel,
) => {
  try {
    const cachedResults = parseStoredSearchResults(
      localStorage.getItem(RECENT_RESULTS_CACHE_KEY),
    );
    
    // 새 결과 아이템 생성
    const newResultItem = {
      params,
      results: results.data.nplaceRankSearchShopList,
      timestamp: new Date().getTime(),
    };
    
    // 중복 제거 (같은 검색 파라미터가 있으면 제거)
    const filteredResults = cachedResults.filter(
      (item: any) =>
        !(
          item.params.filterValue === params.filterValue &&
          item.params.filterType === params.filterType &&
          item.params.keyword === params.keyword &&
          item.params.province === params.province
        )
    );
    
    const updatedResults = cleanupWithPolicy([newResultItem, ...filteredResults], level);
    localStorage.setItem(RECENT_RESULTS_CACHE_KEY, JSON.stringify(updatedResults));
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    logError("최근 검색 결과 저장 실패", errorObj, { operation: 'saveSearchResults' });
  }
};

// 최근 검색 결과 불러오기
export const getRecentSearchResults = (
  level: MembershipLevel,
): { params: SearchParams; results: nplaceRankSearchShop[]; timestamp: number }[] => {
  try {
    const parsed = parseStoredSearchResults(
      localStorage.getItem(RECENT_RESULTS_CACHE_KEY),
    );
    const cleaned = cleanupWithPolicy(parsed, level);
    localStorage.setItem(RECENT_RESULTS_CACHE_KEY, JSON.stringify(cleaned));
    return cleaned;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    logError("최근 검색 결과 불러오기 실패", errorObj, { operation: 'getRecentSearchResults' });
    return [];
  }
};

// React Query 캐싱을 위한 쿼리 키 생성 함수
const getSearchQueryKey = (params: SearchParams) => [
  'nplaceSearch',
  params.province,
  params.filterType,
  params.filterValue,
  params.keyword
];

// 커스텀 훅: 검색 결과 캐싱 및 조회
export const useNplaceSearch = (params: SearchParams) => {
  return useQuery<ApiResponse<{ nplaceRankSearchShopList: nplaceRankSearchShop[] }>, Error>({
    queryKey: getSearchQueryKey(params),
    queryFn: () => fetchSearchResults(params),
    enabled: false, // 자동으로 쿼리를 실행하지 않음 (수동 트리거)
    staleTime: 1000 * 60 * 5, // 5분
    retry: 1 // 재시도 1회
  });
};

// 커스텀 훅: 검색 실행 및 결과 업데이트
export const useExecuteSearch = (level: MembershipLevel = 0) => {
  const queryClient = useQueryClient();
  const [usageLimitReached, setUsageLimitReached] = useState(false);
  const [usageLimitMeta, setUsageLimitMeta] = useState<UsageLimitMeta | null>(
    null,
  );

  const markUsageLimitReached = useCallback(
    (meta?: UsageLimitMeta | null) => {
      setUsageLimitReached(true);
      setUsageLimitMeta(meta ?? null);
    },
    [],
  );
  
  const mutation = useMutation<
    ApiResponse<{ nplaceRankSearchShopList: nplaceRankSearchShop[] }>,
    Error,
    SearchParams
  >({
    mutationFn: (params: SearchParams) => {
      saveRecentSearch(params, level);
      return fetchSearchResults(params);
    },
    onSuccess: (data, params) => {
      // 쿼리 캐시 업데이트
      queryClient.setQueryData(getSearchQueryKey(params), data);
      // 검색 결과 로컬 스토리지에 저장
      saveSearchResults(params, data, level);
      setUsageLimitReached(false);
      setUsageLimitMeta(null);
    },
    onError: (error) => {
      if (isUsageLimitError(error)) {
        markUsageLimitReached(error.meta ?? null);
        notifyRealtimeUsageLimit(error.meta);
      }
    },
  });

  const resetUsageLimit = useCallback(() => {
    setUsageLimitReached(false);
    setUsageLimitMeta(null);
  }, []);

  return {
    ...mutation,
    usageLimitReached,
    usageLimitMeta,
    markUsageLimitReached,
    resetUsageLimit,
  };
};

export const useNplaceRankReailTimeViewModel = () => {
  const queryClient = useQueryClient();

  // 1. 실시간 검색 (mutateAsync로 export)
  const realtimeSearchMutation = useMutation<
    ApiResponse<{ nplaceRankSearchShopList: nplaceRankSearchShop[] }>,
    Error,
    SearchParams
  >({
    mutationFn: async (params) => {
      saveRecentSearch(params, 0);
      const result = await fetchSearchResults(params);
      saveSearchResults(params, result, 0);
      return result;
    },
    onSuccess: (data, params) => {
      queryClient.setQueryData(getSearchQueryKey(params), data);
    },
    onError: (error) => {
      if (isUsageLimitError(error)) {
        notifyRealtimeUsageLimit(error.meta);
      }
    },
  });
  const { mutateAsync: executeSearch, isPending: isSearching } =
    realtimeSearchMutation;

  // 2. 상점 목록 조회
  const {
    data: shopListResult,
    isLoading: isLoadingShopList,
    error: shopListError,
    refetch: refetchShopList,
  } = useQuery<ApiResponse<{ nplaceRankShopList: Shop[] }>>({
    queryKey: ["nplaceRankShopList"],
    queryFn: () => TrackRepository.getShopList(),
  });

  // 3. 그룹 목록 조회
  const {
    data: groupListResult,
    isLoading: isLoadingGroupList,
    error: groupListError,
    refetch: refetchGroupList,
  } = useQuery<ApiResponse<{ groupList: TrackGroup[] }>>({
    queryKey: ["groupList"],
    queryFn: () => TrackRepository.getGroupList(),
  });

  // 4. 상점 삭제
  const { mutateAsync: deleteShop, isPending: isDeletingShop } = useMutation<
    ApiResponse<void>,
    Error,
    string
  >({
    mutationFn: (shopId) => TrackRepository.deleteShop(shopId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nplaceRankShopList"] }),
  });

  // 5. 상점 추가
  const { mutateAsync: addShop, isPending: isAddingShop } = useMutation<
    ApiResponse<any>,
    Error,
    Shop
  >({
    mutationFn: (shop) => TrackRepository.addShop(shop),
    onSuccess: (data) => {
      const meta = data?.meta;
      if (isUsageLimitCode(data?.code)) {
        notifyUsageLimit(meta, {
          usageType: meta?.usageType ?? "NPLACE_RANK_SHOP",
          limit: typeof meta?.limit === "number" ? meta.limit : null,
          used: typeof meta?.used === "number" ? meta.used : null,
          recommendedPlanId: meta?.recommendedPlanId ?? null,
          force: true,
        });
      }
      if (data?.code === "0" || data?.code === 0) {
        queryClient.invalidateQueries({ queryKey: ["nplaceRankShopList"] });
      }
    },
  });

  // 6. 그룹 변경
  const { mutateAsync: updateGroup, isPending: isUpdatingGroup } = useMutation<
    ApiResponse<any>,
    Error,
    { shopIds: string[]; group: any }
  >({
    mutationFn: ({ shopIds, group }) => TrackRepository.updateGroup(shopIds, group),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["nplaceRankShopList"] }),
  });

  // 7. 추적 가능한 플레이스 검색
  const { mutateAsync: fetchTrackable, isPending: isFetchingTrackable } = useMutation<
    ApiResponse<any>,
    Error,
    string
  >({
    mutationFn: (url) => TrackRepository.searchTrackable(url),
  });

  // --- 반환: 뷰에서 필요한 데이터/액션만 export ---
  return {
    // 실시간 검색
    executeSearch, isSearching,
    // 상점/그룹 목록
    shopList: shopListResult?.data?.nplaceRankShopList ?? [],
    isLoadingShopList, shopListError, refetchShopList,
    groupList: groupListResult?.data?.groupList ?? [],
    isLoadingGroupList, groupListError, refetchGroupList,
    // 상점/그룹 액션
    addShop, isAddingShop,
    deleteShop, isDeletingShop,
    updateGroup, isUpdatingGroup,
    // 기타
    fetchTrackable, isFetchingTrackable,
  };
}; 
