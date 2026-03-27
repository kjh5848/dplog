import { Shop } from "@/src/model/TrackRepository";
import { ApiResponse } from "@/src/types/api";
import Image from "next/image";
export default function TrackShopHeader({
  shop,
  isUpdatingKeywords,
  updateKeywords,
}: {
  shop: Shop;
  isUpdatingKeywords: boolean;
  updateKeywords: () => Promise<ApiResponse<void>>;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
          <div className="h-full w-full overflow-hidden rounded-lg sm:h-20 sm:w-20">
            <Image
              src={shop.shopImageUrl || "/img/nplace/shop.png"}
              alt="상점 이미지"
              width={100}
              height={100}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              {shop.shopName}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {shop.roadAddress || shop.address}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {shop.keywordList?.map((keyword, i) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => updateKeywords()}
            disabled={isUpdatingKeywords}
            className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              className={`mr-2 h-4 w-4 ${isUpdatingKeywords ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {isUpdatingKeywords ? "갱신 중..." : "갱신"}
          </button>
        </div>
      </div>
    </div>
  );
}
