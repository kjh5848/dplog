import React from "react";
import { Shop } from "@/src/model/TrackRepository";
import Image from "next/image";

interface KeywordShopCardProps {
  shop: Shop;
  isSelected: boolean;
  viewMode: "grid" | "list" | "report";
  onSelect: (shop: Shop) => void;
}

export default function KeywordShopCard({
  shop,
  isSelected,
  viewMode,
  onSelect,
}: KeywordShopCardProps) {
  const keywordList = shop.keywordList || [];

  if (viewMode === "grid") {
    return (
      <div
        className={`cursor-pointer rounded-lg border transition-all hover:shadow-md ${
          isSelected
            ? "border-primary-500 bg-primary-50"
            : "border-gray-200 bg-white"
        }`}
        onClick={() => onSelect(shop)}
      >
        <div className="flex items-start p-4">
          {shop.shopImageUrl && (
            <div className="mr-3 flex-shrink-0">
              <Image
                src={shop.shopImageUrl}
                alt={shop.shopName}
                width={64}
                height={64}
                className="h-16 w-16 rounded-md object-cover"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-medium text-gray-900">
              {shop.shopName}
            </h3>
            <p className="mt-1 truncate text-sm text-gray-500">
              {shop.address || shop.roadAddress}
            </p>
            {shop.category && (
              <p className="mt-1 text-xs text-gray-500">{shop.category}</p>
            )}
            {keywordList.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {keywordList.slice(0, 3).map((keyword, i) => (
                  <span
                    key={i}
                    className="bg-primary-100 text-primary-600 rounded-full px-2 py-1 text-xs"
                  >
                    {keyword}
                  </span>
                ))}
                {keywordList.length > 3 && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    +{keywordList.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div
      className={`cursor-pointer rounded-lg border transition-all ${
        isSelected
          ? "border-primary-500 bg-primary-50"
          : "border-gray-200 bg-white"
      }`}
      onClick={() => onSelect(shop)}
    >
      <div className="flex items-center justify-between p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            {shop.shopImageUrl && (
              <Image
                src={shop.shopImageUrl}
                alt={shop.shopName}
                className="mr-3 h-10 w-10 rounded-md object-cover"
              />
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {shop.shopName}
              </h3>
              <p className="text-xs text-gray-500">
                {shop.address || shop.roadAddress}
              </p>
            </div>
          </div>
        </div>
        <div className="ml-2 flex flex-shrink-0 flex-wrap justify-end gap-1">
          {keywordList.slice(0, 2).map((keyword, i) => (
            <span
              key={i}
              className="bg-primary-100 text-primary-600 rounded-full px-2 py-1 text-xs"
            >
              {keyword}
            </span>
          ))}
          {keywordList.length > 2 && (
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
              +{keywordList.length - 2}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
