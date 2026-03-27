import { useRouter, useSearchParams } from "next/navigation";
import { Shop } from "@/src/model/TrackRepository";
import { useState } from "react";
import TrackRenderShopContent from "./TrackRenderShopContent";
import { useViewModeStore } from "@/src/store/useViewModeStore";

interface TrackListProps {
  filteredShopList: Shop[];
  selectedShopList: Set<string>;
  handleShopSelect: (shopId: string) => void;
  handleSelectAll: (checked: boolean) => void;
  getRankString: (rank: number | null) => string;
  deleteShop: (shopId: string) => void;
}

export default function TrackList({
  filteredShopList,
  selectedShopList,
  handleShopSelect,
  handleSelectAll,
  getRankString,
  deleteShop,
}: TrackListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialViewMode = searchParams.get("view") === "list" ? "list" : "grid";
  const globalViewMode = useViewModeStore((state) => state.viewMode);
  const setGlobalViewMode = useViewModeStore((state) => state.setViewMode);
  
  const viewMode: "grid" | "list" = globalViewMode === "report" ? "grid" : globalViewMode as "grid" | "list";
  
  const [expandedShops, setExpandedShops] = useState<Set<string>>(new Set());

  if (!filteredShopList || filteredShopList.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center bg-gray-50">
        <p className="text-gray-500">해당 그룹에 속한 상점이 없습니다.</p>
      </div>
    );
  }

  const isAllSelected =
    filteredShopList.length > 0 &&
    filteredShopList.every((shop) => selectedShopList.has(shop.id));

  const handleViewModeChange = (mode: "grid" | "list") => {
    setGlobalViewMode(mode);
    const params = new URLSearchParams(window.location.search);
    params.set("view", mode);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex flex-col items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-2 sm:flex-row">
        <div className="flex w-full items-center justify-between space-x-4 sm:w-auto sm:justify-start">
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center sm:h-4 sm:w-4">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-6 w-6 cursor-pointer rounded border-gray-300 text-blue-500 focus:ring-blue-500 sm:h-4 sm:w-4"
              />
            </div>
            <span className="ml-2 text-sm text-gray-600">전체 선택</span>
          </div>
          <span className="text-sm text-gray-400">
            총 {filteredShopList.length}개
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* 그리드 보기 */}
          <button
            onClick={() => handleViewModeChange("grid")}
            className={`rounded-md p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-500 hover:bg-gray-100"
            }`}
            title="그리드 보기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              />
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 상점 리스트 보기 */}
      <div
        className={`${viewMode === "grid" ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "divide-y divide-gray-100"} max-h-[calc(100vh-8rem)] overflow-auto`}
      >
        {filteredShopList.map((shop) => (
          <div
            key={shop.id}
            className={
              viewMode === "grid"
                ? `group relative overflow-hidden rounded-lg border bg-white transition-all hover:shadow-lg ${
                    selectedShopList.has(shop.id)
                      ? "border-blue-500 ring-1 ring-blue-500"
                      : "border-gray-200"
                  }`
                : `bg-white transition-all hover:bg-gray-50 ${
                    selectedShopList.has(shop.id) ? "bg-blue-50" : ""
                  }`
            }
          >
            {/* 상점 컨텐츠 */}
            <TrackRenderShopContent
              deleteShop={deleteShop}
              shop={shop}
              viewMode={viewMode}
              selectedShopList={selectedShopList}
              handleShopSelect={handleShopSelect}
              getRankString={getRankString}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
