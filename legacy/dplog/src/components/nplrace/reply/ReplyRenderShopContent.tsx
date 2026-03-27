"use client";

import Image from "next/image";
import { Shop } from "@/src/model/TrackRepository";

export type ReplyStatus = "active" | "inactive" | "unset";

interface ReplyRenderShopContentProps {
  shop: Shop;
  viewMode: "grid" | "list";
  isSelected: boolean;
  onSelect: () => void;
  status: ReplyStatus;
  onToggleStatus: () => void;
  isProcessing: boolean;
}

export default function ReplyRenderShopContent({
  shop,
  viewMode,
  isSelected,
  onSelect,
  status,
  onToggleStatus,
  isProcessing,
}: ReplyRenderShopContentProps) {
  const statusLabel =
    status === "active" ? "활성화" : status === "inactive" ? "비활성화" : "미설정";
  const statusClass =
    status === "active"
      ? "bg-green-50 text-green-700"
      : status === "inactive"
        ? "bg-gray-100 text-gray-600"
        : "bg-yellow-50 text-yellow-700";

  const toggleLabel = status === "active" ? "OFF로 전환" : "ON으로 전환";

  if (viewMode === "grid") {
    return (
      <>
        <div className="relative">
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              className="h-6 w-6 cursor-pointer rounded border-gray-300 text-blue-500 focus:ring-blue-500 sm:h-4 sm:w-4"
              checked={isSelected}
              onChange={onSelect}
              onClick={(e) => e.stopPropagation()} // Prevent card click when clicking checkbox
            />
          </div>
        </div>

        <div className="aspect-[4/3] w-full overflow-hidden">
          <Image
            src={shop.shopImageUrl || "/placeholder.jpg"}
            alt={shop.shopName}
            width={400}
            height={300}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            priority
          />
        </div>

        <div className="p-4">
          <h3 className="truncate text-lg font-semibold text-gray-900">
            {shop.shopName}
          </h3>
          <p className="mt-1 truncate text-sm text-gray-500">
            {shop.roadAddress || shop.address}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
              {isProcessing ? "처리 중..." : `댓글 ${statusLabel}`}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStatus();
              }}
              disabled={isProcessing}
              className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {toggleLabel}
            </button>
          </div>
        </div>
      </>
    );
  }

  // list view
  return (
    <div className="flex items-center p-4">
      <div className="flex h-8 w-8 items-center justify-center sm:h-4 sm:w-4">
        <input
          type="checkbox"
          className="h-6 w-6 cursor-pointer rounded border-gray-300 text-blue-500 focus:ring-blue-500 sm:h-4 sm:w-4"
          checked={isSelected}
          onChange={onSelect}
          onClick={(e) => e.stopPropagation()} // Prevent row click when clicking checkbox
        />
      </div>

      <div className="ml-4 flex-shrink-0">
        <Image
          src={shop.shopImageUrl || "/placeholder.jpg"}
          alt={shop.shopName}
          width={60}
          height={60}
          className="h-16 w-16 rounded-lg object-cover"
        />
      </div>

      <div className="ml-4 min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-gray-900">
          {shop.shopName}
        </h3>
        <p className="mt-1 truncate text-sm text-gray-500">
          {shop.roadAddress || shop.address}
        </p>
      </div>

      <div className="ml-4 flex flex-col items-end space-y-2">
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass}`}>
          {isProcessing ? "처리 중..." : `댓글 ${statusLabel}`}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleStatus();
          }}
          disabled={isProcessing}
          className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {toggleLabel}
        </button>
      </div>
    </div>
  );
}
