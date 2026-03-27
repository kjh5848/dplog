import React, { Dispatch, SetStateAction } from 'react';
import { Shop } from '@/src/model/TrackRepository';
import Link from 'next/link';
import { LayoutGrid, List, FileText } from 'lucide-react';
import LoadingFallback from '@/src/components/common/LoadingFallback';
import KeywordShopCard from './KeywordShopCard';
import { useViewModeStore } from '@/src/store/useViewModeStore';
import Image from 'next/image';

export interface KeywordShopListProps {
  shops: Shop[];
  isLoading: boolean;
  selectedShop: Shop | null;
  onSelectShop: (shop: Shop) => void;
}

export default function KeywordShopList({
  shops,
  isLoading,
  selectedShop,
  onSelectShop
}: KeywordShopListProps) {
  // 전역 상태 관리를 위한 useViewModeStore 사용
  const viewMode = useViewModeStore((state) => state.viewMode);
  const setViewMode = useViewModeStore((state) => state.setViewMode);

  if (isLoading) {
    return <LoadingFallback message="상점 목록 로딩 중..." />;
  }
  
  const handleViewModeChange = (mode: "grid" | "list" | "report") => {
    setViewMode(mode);
  };
  
  const shopList = shops.map((shop) => {
    return {
      nplaceRankShop: shop,
      nplaceRankTrackInfoMap: shop.nplaceRankTrackInfoMap,
    }
  })

  return (
    <div className="card-keyword flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
        <h2 className="mb-0 text-xl font-semibold">상점 목록</h2>

        <div className="flex space-x-1 divide-x divide-gray-200 rounded-lg p-1">
          <div className="flex">
            <button
              type="button"
              onClick={() => handleViewModeChange("grid")}
              className={`rounded-md p-2 ${
                viewMode === "grid"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <LayoutGrid size={16} />
            </button>

            <button
              type="button"
              onClick={() => handleViewModeChange("list")}
              className={`rounded-md p-2 ${
                viewMode === "list"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="h-[calc(40vh-4rem)] flex-1 overflow-y-auto p-4">
        {isLoading && <LoadingFallback message="상점 정보 로딩 중..." />}

        {!isLoading && shops.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p>등록된 상점이 없습니다.</p>
          </div>
        )}

        {!isLoading && shops.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-3 gap-4">
            {shops.map((shop) => (
              <KeywordShopCard
                key={shop.id}
                shop={shop}
                isSelected={selectedShop?.id === shop.id}
                viewMode={viewMode}
                onSelect={onSelectShop}
              />
            ))}
          </div>
        )}

        {!isLoading && shops.length > 0 && viewMode === "list" && (
          <div className="space-y-2">
            {shops.map((shop) => (
              <div
                key={shop.id}
                className={`hover:border-primary-300 flex cursor-pointer items-center space-x-4 rounded-lg border p-3 ${
                  selectedShop?.id === shop.id
                    ? "bg-primary-50 border-primary-300"
                    : "bg-white"
                }`}
                onClick={() => onSelectShop(shop)}
              >
                <div className="relative h-12 w-12 flex-shrink-0 rounded-md bg-gray-200">
                  {shop.shopImageUrl && (
                    <Image
                      src={shop.shopImageUrl}
                      alt={shop.shopName}
                      className="h-full w-full rounded-md object-cover"
                    />
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="font-medium text-gray-900">{shop.shopName}</h3>
                  <p className="text-xs text-gray-500">{shop.address}</p>
                  <div className="mt-1 flex items-center space-x-4">
                    <span className="text-xs text-gray-500">
                      {shop.category}
                    </span>
                    <span className="text-primary-700 text-xs">
                      {Object.keys(shop.nplaceRankTrackInfoList || {}).length}{" "}
                      키워드
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && shops.length > 0 && viewMode === "report" && (
          <div className="p-4 text-center text-gray-500">
            <p>리포트 뷰는 키워드 선택 후 활성화됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};
