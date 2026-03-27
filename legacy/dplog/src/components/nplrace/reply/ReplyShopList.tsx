"use client";

import { useRouter } from "next/navigation";
import { Shop } from "@/src/model/TrackRepository";
import ReplyRenderShopContent, { ReplyStatus } from "./ReplyRenderShopContent";
import { useViewModeStore } from "@/src/store/useViewModeStore";
import { NplaceReplyInfo } from "@/src/types/nplaceReply";

interface ReplyShopListProps {
  shopList: Shop[];
  selectedPlaceIds: Set<string>;
  onShopSelect: (placeId: string) => void;
  onSelectAll: (checked: boolean) => void;
  replyStateMap: Map<string, NplaceReplyInfo>;
  onToggleStatus: (placeId: string, nextActive: boolean) => void;
  isToggleLoading: boolean;
  pendingPlaceId: string | null;
  isReplyLoading: boolean;
}

export default function ReplyShopList({
  shopList,
  selectedPlaceIds,
  onShopSelect,
  onSelectAll,
  replyStateMap,
  onToggleStatus,
  isToggleLoading,
  pendingPlaceId,
  isReplyLoading,
}: ReplyShopListProps) {
  const router = useRouter();
  const viewMode = useViewModeStore((state) => state.viewMode) as "grid" | "list";
  const setViewMode = useViewModeStore((state) => state.setViewMode);

  const getPlaceId = (shop: Shop) => shop.shopId || shop.id;

  const handleViewModeChange = (mode: "grid" | "list") => {
    setViewMode(mode);
    const params = new URLSearchParams(window.location.search);
    params.set("view", mode);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  if (isReplyLoading) {
    return (
      <div className="flex h-32 items-center justify-center bg-gray-50">
        <p className="text-gray-500">댓글 상태를 불러오는 중...</p>
      </div>
    );
  }

  if (!shopList || shopList.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center bg-gray-50">
        <p className="text-gray-500">등록된 가게가 없습니다.</p>
      </div>
    );
  }

  const isAllSelected =
    shopList.length > 0 &&
    shopList.every((shop) => {
      const placeId = getPlaceId(shop);
      return placeId ? selectedPlaceIds.has(placeId) : false;
    });

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex flex-col items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2 sm:flex-row">
        <div className="flex w-full items-center justify-between space-x-4 sm:w-auto sm:justify-start">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center sm:h-4 sm:w-4">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="h-6 w-6 cursor-pointer rounded border-gray-300 text-blue-500 focus:ring-blue-500 sm:h-4 sm:w-4"
              />
            </div>
            <span className="ml-2 text-sm text-gray-600">전체 선택</span>
          </div>
          <span className="text-sm text-gray-400">
            총 {shopList.length}개
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewModeChange("grid")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="그리드 보기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => handleViewModeChange("list")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "list"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="리스트 보기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`${viewMode === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "divide-y divide-gray-100"} max-h-[calc(100vh-8rem)] overflow-auto`}
      >
        {shopList.map((shop) => {
          const placeId = getPlaceId(shop);
          const replyInfo = placeId ? replyStateMap.get(placeId) : undefined;
          const status: ReplyStatus = !replyInfo
            ? "unset"
            : replyInfo.active
              ? "active"
              : "inactive";
          const isSelected = placeId ? selectedPlaceIds.has(placeId) : false;

          return (
            <div
              key={shop.id}
              className={`group relative cursor-pointer overflow-hidden rounded-lg border bg-white transition-all hover:shadow-lg ${
                isSelected ? "border-blue-500 ring-1 ring-blue-500" : "border-gray-200"
              }`}
              onClick={() => placeId && onShopSelect(placeId)}
            >
              <ReplyRenderShopContent
                shop={shop}
                viewMode={viewMode}
                isSelected={isSelected}
                onSelect={() => placeId && onShopSelect(placeId)}
                status={status}
                onToggleStatus={() =>
                  placeId && onToggleStatus(placeId, status === "active" ? false : true)
                }
                isProcessing={isToggleLoading && pendingPlaceId === placeId}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
