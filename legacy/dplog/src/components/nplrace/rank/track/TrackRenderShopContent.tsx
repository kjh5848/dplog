import Image from "next/image";
import { Shop, TrackInfo } from "@/src/model/TrackRepository";
import React, { useState } from "react";

interface TrackRenderShopContentProps {
  shop: Shop;
  viewMode: "grid" | "list";
  selectedShopList: Set<string>;
  handleShopSelect: (shopId: string) => void;
  getRankString: (rank: number | null) => string;
  deleteShop: (shopId: string) => void;
}

export default function TrackRenderShopContent({
  shop,
  viewMode,
  selectedShopList,
  handleShopSelect,
  getRankString,
  deleteShop,
}: TrackRenderShopContentProps) {
  // 내부에서 확장 상태 관리
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // 상점 상세보기 이동 (예시: /track/{shop.id}로 이동)
  const handleShopClick = (shopId: string) => {
    window.location.href = `/track/${shopId}`;
  };

  // 확장/접기 토글
  const toggleExpanded = () => {
    setIsExpanded((prev) => !prev);
  };

  const visibleTrackList = isExpanded
    ? shop.nplaceRankTrackInfoList
    : shop.nplaceRankTrackInfoList.slice(0, 3); // 기본 3개만 보여줌
  
  const onDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteShop(shop.id);
    setIsDeleteModalOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };
    
  if (viewMode === "grid") {
    return (
      <>
        <div onClick={() => handleShopClick(shop.id)}>
          <div className="relative">
            <div className="absolute top-2 left-2 z-10">
              <div className="flex h-8 w-8 items-center justify-center sm:h-4 sm:w-4">
                <input
                  type="checkbox"
                  className="text-ablue-500 h-6 w-6 cursor-pointer rounded border-gray-300 focus:ring-blue-500 sm:h-4 sm:w-4"
                  checked={selectedShopList.has(shop.id)}
                  onChange={() => handleShopSelect(shop.id)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div>
              <div className="absolute top-2 right-2 z-10">
                <button
                  className="mt-4 rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 sm:mt-0 sm:ml-4 sm:w-auto"
                  onClick={onDelete}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="aspect-[4/3] w-full overflow-hidden">
            <Image
              src={shop.shopImageUrl || "/placeholder.jpg"}
              alt={shop.shopName}
              width={400}
              height={300}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority
            />
          </div>

          <div className="p-4">
            <div className="mb-2">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-lg font-semibold text-gray-900">
                  {shop.shopName}
                </h3>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                  {shop.groupName}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-gray-500">
                {shop.roadAddress}
              </p>
            </div>

            <div className="space-y-2">
              {shop.nplaceRankTrackInfoList &&
              shop.nplaceRankTrackInfoList.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {visibleTrackList.map((track: TrackInfo) => (
                      <div
                        key={`${shop.id}-${track.nomadscrapNplaceRankTrackInfoId}`}
                        className="flex w-full items-center sm:w-auto"
                      >
                        <span className="inline-flex w-full items-center justify-between rounded-md bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1 text-xs font-medium text-blue-800 shadow-xs sm:w-auto">
                          <span className="max-w-[200px] truncate">
                            {`[${track.province}]${track.keyword}`}
                          </span>
                          <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-md bg-gradient-to-r from-green-50 to-green-100 px-2 py-1 text-xs font-medium text-green-800 shadow-xs">
                            {getRankString(track.rank)}
                            {track.rankChange !== 0 && (
                              <span
                                className={
                                  track.rankChange < 0
                                    ? "text-red-500"
                                    : "text-blue-500"
                                }
                              >
                                {track.rankChange < 0 ? "▲" : "▼"}
                                {Math.abs(track.rankChange)}
                              </span>
                            )}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>

                  {shop.nplaceRankTrackInfoList.length > 3 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded();
                      }}
                      className="mt-2 text-xs text-blue-500 hover:underline"
                    >
                      {isExpanded ? "접기 ▲" : "더보기 ▼"}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-sm text-gray-500">
                  추적 중인 키워드가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-xs rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4 text-lg font-semibold text-gray-800">정말 삭제하시겠습니까?</div>
              <div className="flex justify-end gap-2">
                <button
                  className="rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                  onClick={handleCancelDelete}
                >
                  취소
                </button>
                <button
                  className="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  onClick={handleConfirmDelete}
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // list view
  return (
    <div className="flex flex-col items-start p-4 sm:flex-row">
      <div className="flex h-8 w-8 items-center justify-center sm:h-4 sm:w-4">
        <input
          type="checkbox"
          className="h-6 w-6 cursor-pointer rounded border-gray-300 text-blue-500 focus:ring-blue-500 sm:h-4 sm:w-4"
          checked={selectedShopList.has(shop.id)}
          onChange={() => handleShopSelect(shop.id)}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      <div className="mt-4 ml-0 hidden w-full flex-shrink-0 sm:mt-4 sm:ml-4 sm:block sm:w-auto">
        <Image
          src={shop.shopImageUrl || "/placeholder.jpg"}
          alt={shop.shopName}
          width={80}
          height={80}
          className="h-20 w-full rounded-lg object-cover sm:w-20"
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>

      <div className="mt-2 ml-0 min-w-0 flex-1 sm:mt-0 sm:ml-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-lg font-semibold text-gray-900">
            {shop.shopName}
          </h3>
          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            {shop.groupName}
          </span>
        </div>
        <p className="mt-1 truncate text-sm text-gray-500">
          {shop.roadAddress}
        </p>

        <div className="mt-3">
          {shop.nplaceRankTrackInfoList &&
          shop.nplaceRankTrackInfoList.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {visibleTrackList.map((track: TrackInfo) => (
                  <div
                    key={`${shop.id}-${track.nomadscrapNplaceRankTrackInfoId}`}
                    className="flex w-full items-center sm:w-auto"
                  >
                    <span className="inline-flex w-full items-center justify-between rounded-md bg-gradient-to-r from-blue-50 to-blue-100 px-2 py-1 text-xs font-medium text-blue-800 shadow-xs sm:w-auto">
                      <span className="max-w-[200px] truncate">
                        {`[${track.province}]${track.keyword}`}
                      </span>
                      <span className="ml-2 inline-flex shrink-0 items-center gap-1 rounded-md bg-gradient-to-r from-green-50 to-green-100 px-2 py-1 text-xs font-medium text-green-800 shadow-xs">
                        {getRankString(track.rank)}
                        {track.rankChange !== 0 && (
                          <span
                            className={
                              track.rankChange < 0
                                ? "text-red-500"
                                : "text-blue-500"
                            }
                          >
                            {track.rankChange < 0 ? "▲" : "▼"}
                            {Math.abs(track.rankChange)}
                          </span>
                        )}
                      </span>
                    </span>
                  </div>
                ))}
              </div>

              {shop.nplaceRankTrackInfoList.length > 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded();
                  }}
                  className="mt-2 text-xs text-blue-500 hover:underline"
                >
                  {isExpanded ? "접기 ▲" : "더보기 ▼"}
                </button>
              )}
            </>
          ) : (
            <div className="text-sm text-gray-500">
              추적 중인 키워드가 없습니다.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div>
          <button
            className="mt-4 ml-0 w-full flex items-center justify-center gap-1 px-3 py-1 text-blue-500 hover:text-blue-600 sm:mt-0 sm:ml-4 sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              handleShopClick(shop.id);
            }}
          >
            상세보기
          </button>
        </div>
        <div className="">
          <button
            className="mt-4 rounded bg-red-50 px-2 py-1 text-xs text-red-600 hover:bg-red-100 sm:mt-0 sm:ml-4 sm:w-auto"
            onClick={onDelete}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
