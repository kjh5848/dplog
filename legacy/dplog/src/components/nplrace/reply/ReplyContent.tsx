
"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useNplaceRankTrackViewModel } from "@/src/viewModel/nplace/track/nplaceRankTrackViewModel";
import TrackNplaceSearch from "@/src/components/nplrace/rank/track/TrackNplaceSearch";
import ReplyShopList from "./ReplyShopList";
import NaverAccountForm from "./NaverAccountForm";
import NplaceReplyRepository from "@/src/model/NplaceReplyRepository";
import { NplaceReplyInfo } from "@/src/types/nplaceReply";
import { Shop } from "@/src/model/TrackRepository";

type ToggleVariables = { placeId: string; active: boolean };

export default function ReplyContent() {
  const queryClient = useQueryClient();
  const { shopList, isLoading: isShopLoading, error: shopError } = useNplaceRankTrackViewModel();
  const [isTrackableModalOpen, setIsTrackableModalOpen] = useState(false);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<Set<string>>(new Set());
  const [isEditingAccount, setIsEditingAccount] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [pendingPlaceId, setPendingPlaceId] = useState<string | null>(null);

  const naverStatusQuery = useQuery({
    queryKey: ["nplace", "naver", "status"],
    queryFn: () => NplaceReplyRepository.getNaverStatus(),
    staleTime: 60 * 1000,
  });

  const naverExists = naverStatusQuery.data?.exists ?? false;

  const naverAccountQuery = useQuery({
    queryKey: ["nplace", "naver", "account"],
    queryFn: () => NplaceReplyRepository.getNaverAccount(),
    enabled: naverExists,
  });

  const replyListQuery = useQuery({
    queryKey: ["nplace", "reply", "list"],
    queryFn: () => NplaceReplyRepository.getReplyList(),
    enabled: naverExists,
  });

  const replyStateMap = useMemo(() => {
    const map = new Map<string, NplaceReplyInfo>();
    (replyListQuery.data || []).forEach((info) => {
      map.set(info.placeId, info);
    });
    return map;
  }, [replyListQuery.data]);

  const saveAccountMutation = useMutation({
    mutationFn: async (payload: { naverId: string; naverPw: string; mode: "create" | "update" }) => {
      await NplaceReplyRepository.saveNaverAccount(
        { naverId: payload.naverId, naverPw: payload.naverPw },
        payload.mode,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["nplace", "naver", "status"] });
      queryClient.invalidateQueries({ queryKey: ["nplace", "naver", "account"] });
      queryClient.invalidateQueries({ queryKey: ["nplace", "reply", "list"] });
      toast.success(variables.mode === "create" ? "네이버 계정을 등록했습니다" : "네이버 계정을 수정했습니다");
      setIsEditingAccount(false);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "네이버 계정 등록/수정에 실패했습니다";
      toast.error(message);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ placeId, active }: ToggleVariables) => {
      await NplaceReplyRepository.toggleReply(placeId, active);
      return { placeId, active } as ToggleVariables;
    },
    onMutate: ({ placeId }) => {
      setPendingPlaceId(placeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nplace", "reply", "list"] });
    },
    onSettled: () => {
      setPendingPlaceId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await NplaceReplyRepository.deleteReplyInfo();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nplace", "reply", "list"] });
      setSelectedPlaceIds(new Set());
      toast.success("댓글 제어 정보를 삭제했습니다");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "댓글 제어 정보 삭제에 실패했습니다";
      toast.error(message);
    },
  });

  const registerReplyMutation = useMutation({
    mutationFn: async (shop: Shop) => {
      const placeId = shop.shopId || shop.id;
      if (!placeId) {
        throw new Error("플레이스 ID를 찾을 수 없습니다");
      }
      await NplaceReplyRepository.toggleReply(placeId, true);
      return placeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nplace", "reply", "list"] });
      queryClient.invalidateQueries({ queryKey: ["nplaceRankShopList"] });
      toast.success("플레이스를 등록하고 댓글 제어를 활성화했습니다");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "플레이스 등록에 실패했습니다";
      toast.error(message);
    },
  });

  const handleShopSelect = (placeId: string) => {
    setSelectedPlaceIds((prev) => {
      const next = new Set(prev);
      if (next.has(placeId)) {
        next.delete(placeId);
      } else {
        next.add(placeId);
      }
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(
        shopList.map((shop) => shop.shopId || shop.id).filter((id): id is string => Boolean(id)),
      );
      setSelectedPlaceIds(allIds);
    } else {
      setSelectedPlaceIds(new Set());
    }
  };

  const handleToggleSingle = async (placeId: string, nextActive: boolean) => {
    if (!naverExists) {
      toast.error("네이버 계정을 먼저 등록해주세요");
      return;
    }
    try {
      await toggleMutation.mutateAsync({ placeId, active: nextActive });
      toast.success(`댓글을 ${nextActive ? "활성화" : "비활성화"}했습니다`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "댓글 제어 요청에 실패했습니다";
      toast.error(message);
    }
  };

  const handleBulkToggle = async (active: boolean) => {
    if (selectedPlaceIds.size === 0) {
      toast.error("가게를 먼저 선택해주세요");
      return;
    }
    setIsBulkProcessing(true);
    let successCount = 0;
    let failCount = 0;
    for (const placeId of Array.from(selectedPlaceIds)) {
      try {
        await toggleMutation.mutateAsync({ placeId, active });
        successCount += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : "댓글 제어 요청에 실패했습니다";
        toast.error(`${placeId}: ${message}`);
        failCount += 1;
      }
    }
    if (successCount > 0) {
      toast.success(`${successCount}개 가게의 댓글을 ${active ? "활성화" : "비활성화"}했습니다`);
      setSelectedPlaceIds(new Set());
    }
    if (failCount > 0 && successCount === 0) {
      toast.error("선택한 가게의 댓글 상태를 변경하지 못했습니다");
    }
    setIsBulkProcessing(false);
  };

  const handleDeleteAll = async () => {
    if (deleteMutation.isPending) {
      return;
    }
    const confirmed = window.confirm("댓글 제어 정보를 모두 삭제할까요? 되돌릴 수 없습니다.");
    if (!confirmed) {
      return;
    }
    await deleteMutation.mutateAsync();
  };

  const handleAccountSubmit = async (values: { naverId: string; naverPw: string }) => {
    const mode: "create" | "update" = naverExists ? "update" : "create";
    await saveAccountMutation.mutateAsync({ ...values, mode });
  };

  const handleModalAdd = async (shop?: Shop) => {
    if (!shop) {
      toast.error("플레이스 정보를 찾지 못했습니다");
      return;
    }
    await registerReplyMutation.mutateAsync(shop);
    setIsTrackableModalOpen(false);
  };

  if (naverStatusQuery.isLoading || isShopLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <span className="ml-2 text-gray-500">데이터를 불러오는 중...</span>
      </div>
    );
  }

  if (naverStatusQuery.error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="mb-2 text-lg font-medium text-red-600">네이버 계정 상태를 불러오지 못했습니다</p>
        <p className="text-sm text-red-500">
          {naverStatusQuery.error instanceof Error
            ? naverStatusQuery.error.message
            : "잠시 후 다시 시도해주세요"}
        </p>
      </div>
    );
  }

  if (shopError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 p-4">
        <p className="mb-2 text-lg font-medium text-red-600">데이터를 불러오는 중 오류가 발생했습니다</p>
        <p className="text-sm text-red-500">
          {shopError.message || "잠시 후 다시 시도해주세요"}
        </p>
      </div>
    );
  }

  const userNaver = naverAccountQuery.data?.userNaver;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-white to-blue-50 p-6 shadow-sm">
        {naverExists ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">연결된 네이버 계정</p>
                <p className="text-xl font-bold text-gray-900">{userNaver?.naverId || "확인 중"}</p>
                <p className="mt-1 text-sm text-gray-600">
                  댓글 제어 작업은 등록된 계정으로 진행됩니다. 비밀번호 수정 시 다시 입력해주세요.
                </p>
                {naverAccountQuery.error ? (
                  <p className="mt-1 text-sm text-red-500">
                    {naverAccountQuery.error instanceof Error
                      ? naverAccountQuery.error.message
                      : "네이버 계정 정보를 불러오지 못했습니다"}
                  </p>
                ) : null}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setIsEditingAccount((prev) => !prev)}
                  className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                >
                  {isEditingAccount ? "편집 닫기" : "계정 수정"}
                </button>
                <button
                  onClick={handleDeleteAll}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  제어 정보 삭제
                </button>
              </div>
            </div>
            {isEditingAccount ? (
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <NaverAccountForm
                  mode="update"
                  defaultId={userNaver?.naverId}
                  isSubmitting={saveAccountMutation.isPending}
                  onSubmit={handleAccountSubmit}
                  onCancel={() => setIsEditingAccount(false)}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-blue-700">네이버 계정이 필요합니다</p>
              <p className="mt-1 text-sm text-gray-600">
                댓글 제어 전용 네이버 계정을 등록해야 ON/OFF 제어가 가능합니다. 로그인 정보는 암호화되어 저장됩니다.
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <NaverAccountForm
                mode="create"
                isSubmitting={saveAccountMutation.isPending}
                onSubmit={handleAccountSubmit}
              />
            </div>
          </div>
        )}
      </div>

      {naverExists ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1 text-sm text-gray-600">
              <span>
                선택된 가게: <span className="font-semibold text-gray-900">{selectedPlaceIds.size}</span>개
              </span>
              <span className="text-xs text-gray-500">추가 가게 등록은 네이버 링크 또는 placeId로 검색 후 활성화하세요.</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setIsTrackableModalOpen(true)}
                className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
              >
                플레이스 등록
              </button>
              <button
                onClick={() => handleBulkToggle(true)}
                disabled={isBulkProcessing || toggleMutation.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                선택 댓글 활성화
              </button>
              <button
                onClick={() => handleBulkToggle(false)}
                disabled={isBulkProcessing || toggleMutation.isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                선택 댓글 비활성화
              </button>
            </div>
          </div>

          {replyListQuery.error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
              댓글 상태를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
            </div>
          ) : (
            <ReplyShopList
              shopList={shopList}
              selectedPlaceIds={selectedPlaceIds}
              onShopSelect={handleShopSelect}
              onSelectAll={handleSelectAll}
              replyStateMap={replyStateMap}
              onToggleStatus={handleToggleSingle}
              isToggleLoading={toggleMutation.isPending || isBulkProcessing}
              pendingPlaceId={pendingPlaceId}
              isReplyLoading={replyListQuery.isLoading}
            />
          )}
        </div>
      ) : null}

      <TrackNplaceSearch
        isOpen={isTrackableModalOpen}
        onClose={() => setIsTrackableModalOpen(false)}
        onAdd={handleModalAdd}
      />
    </div>
  );
}
