import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import TrackRepository, { Shop } from '@/src/model/TrackRepository';
import { ApiResponse } from '@/types/api';
import { logError } from '@/src/utils/logger';
import { TrackGroup } from '@/types/group';
import { notifyUsageLimit } from '@/src/utils/usageLimitNotifier';
import { isUsageLimitCode } from '@/src/utils/usageLimit';

export const useNplaceRankTrackViewModel = () => {
  const queryClient = useQueryClient();

  // 상점 목록 조회
  const {
    data: shopListResult,
    error,
    isLoading,
    refetch: refetchShopList,
  } = useQuery<ApiResponse<{ nplaceRankShopList: Shop[] }>>({
    queryKey: ["nplaceRankShopList"],
    queryFn: async () => {
      try {
        return await TrackRepository.getShopList();
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError("상점 목록 조회 중 오류 발생", errorObj, { operation: "getShopList" });
        throw errorObj;
      }
    },
    staleTime: 5 * 60 * 1000, // 5분 동안 데이터를 'fresh'하게 유지
    gcTime: 30 * 60 * 1000, // 30분 동안 캐시 유지
    retry: 2, // 최대 2번까지만 재시도
    refetchOnWindowFocus: false, // 창 포커스 시 자동 재요청 비활성화
  });

  // 그룹 목록 조회
  const {
    data: groupListResult,
    error: groupListError,
    isLoading: isLoadingGroupList,
  } = useQuery<ApiResponse<{ groupList: TrackGroup[] }>>({
    queryKey: ["groupList"],
    queryFn: async () => {
      try {
        return await TrackRepository.getGroupList();
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError("그룹 목록 조회 중 오류 발생", errorObj, { operation: "getGroupList" });
        throw errorObj;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: deleteShop } = useMutation<ApiResponse<void>, Error, string>({
    mutationFn: async (shopId: string) => {
      return await TrackRepository.deleteShop(shopId);
    },
  onSuccess: async () => {
    // 쿼리 무효화 후 이전 페이지로 이동
    await queryClient.invalidateQueries({ queryKey: ["nplaceRankShop"] });
    // 데이터가 업데이트될 때까지 잠시 대기
    // await new Promise((resolve) => setTimeout(resolve, 100));
    // if (typeof window !== "undefined") {
    //   window.history.back();
    // }
  },
  onError: (error) => {
    logError("플레이스 삭제 중 오류", error, { operation: "deleteShop" });
  },
});

  // 추적 가능한 플레이스 검색
  const trackableMutation = useMutation<ApiResponse<{ nplaceRankShop: Shop }>, Error, string>({
    mutationFn: (url: string) => TrackRepository.searchTrackable(url),
  });

  // 상점 추가
  const addShopMutation = useMutation<ApiResponse<Shop>, Error, Shop>({
    mutationFn: (shop: Shop) => TrackRepository.addShop(shop),
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

  // 그룹 변경
  const updateGroupMutation = useMutation<
    ApiResponse<void>,
    Error,
    { shopIds: string[]; group: TrackGroup }
  >({
    mutationFn: (params: { shopIds: string[]; group: TrackGroup }) =>
      TrackRepository.updateGroup(params.shopIds, params.group),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nplaceRankShopList"] });
    },
  });

  return {
    shopList: shopListResult?.data?.nplaceRankShopList || [],
    isLoading,
    error,
    refetchShopList,

    groupList: groupListResult?.data?.groupList || [],
    groupListError,
    isLoadingGroupList,

    // 추적 가능한 플레이스 검색
    fetchTrackable: trackableMutation.mutateAsync,
    isFetchingTrackable: trackableMutation.isPending,

    // 상점 추가
    addShop: addShopMutation.mutateAsync,
    isAddingShop: addShopMutation.isPending,

    // 그룹 변경
    updateGroup: (shopIds: string[], group: TrackGroup) =>
      updateGroupMutation.mutateAsync({ shopIds, group }),
    isUpdatingGroup: updateGroupMutation.isPending,

    // 상점 삭제
    deleteShop,
    getRankString: (rank: number | null): string => {
      if (rank == null) {
        return "추적 대기";
      } else if (rank === -1) {
        return "순위권 이탈";
      } else {
        return `${rank}위`;
      }
    },
  };
};  
