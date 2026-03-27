import React from 'react';
import { CompareKeywordData } from '@/src/viewModel/nplace/keword/nplaceRankKeywordCompareViewModel';
import Image from 'next/image';

interface KeywordCompareViewProps {
  data: CompareKeywordData | null;
  getRankChangeString: (current: number, previous: number) => string;
  getRankString: (rank: number | null) => string;
  isLoading?: boolean;
}

export default function KeywordCompareView({
  data,
  getRankChangeString,
  getRankString,
  isLoading = false,
}: KeywordCompareViewProps) {
  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-gray-600 text-lg font-medium mb-2">📊</div>
          <p className="text-gray-500">조회된 순위비교 데이터가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">키워드를 선택하여 순위를 확인해보세요.</p>
        </div>
      </div>
    );
  }

  // 실제 순위 비교 데이터가 있는지 확인
  const hasRankData = data.rankDataList && data.rankDataList.length > 0;

  return (
    <div className="h-full flex flex-col min-h-[600px] md:min-h-[700px] relative">
      {/* 로딩 상태 표시 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-sm text-gray-600 font-medium">순위 비교 데이터를 불러오는 중...</p>
          </div>
        </div>
      )}
      
      {hasRankData ? (
        // 실제 순위 비교 데이터 표시
        <>
          {/* 내 상점 정보 찾기 */}
          {(() => {
            const myShopData = data.rankDataList?.find(
              item => item.trackInfo.shopId === data.shopId
            );
            
            return myShopData ? (
              <div className="mb-3 md:mb-4 rounded-lg bg-yellow-50 border border-yellow-200 p-3 md:p-4 flex-shrink-0">
                <h3 className="mb-2 text-sm md:text-base font-medium text-gray-900">
                  {myShopData.trackInfo.shopName} (내 상점)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                  <div>
                    <span className="font-medium text-gray-700">순위:</span>
                    <span className="ml-2 text-base md:text-lg font-bold text-blue-600">
                      {myShopData.rankInfo.rank}위
                    </span>
                    <span className="ml-2 text-xs md:text-sm text-gray-500">
                      / {myShopData.rankInfo.totalCount}곳
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">카테고리:</span>
                    <span className="ml-2">{myShopData.trackInfo.category}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">평점:</span>
                    <span className="ml-2">{myShopData.trackInfo.scoreInfo}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">방문자 리뷰:</span>
                    <span className="ml-2">{myShopData.trackInfo.visitorReviewCount}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">블로그 리뷰:</span>
                    <span className="ml-2">{myShopData.trackInfo.blogReviewCount}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">저장수:</span>
                    <span className="ml-2">{myShopData.trackInfo.saveCount}</span>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
          
          {/* 전체 순위 리스트 */}
          <div className="mb-2 md:mb-3 flex-shrink-0">
            <h3 className="text-sm md:text-base font-medium text-gray-900">
              전체 순위 ({data.rankDataList?.length || 0}개 표시)
            </h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              총 {data.rankDataList?.[0]?.rankInfo?.totalCount || 0}개 업체 중 상위 순위
            </p>
          </div>
          
          {/* 테이블을 별도 스크롤 영역으로 분리 - 모바일에서 더 큰 높이 확보 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden flex-1 min-h-[400px] md:min-h-[500px]">
            <div className="h-full overflow-y-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-2 md:px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      순위
                    </th>
                    <th className="px-2 md:px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      업체명
                    </th>
                    <th className="hidden sm:table-cell px-2 md:px-3 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      카테고리
                    </th>
                    <th className="px-1 md:px-2 py-2 md:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      평점
                    </th>
                    <th className="px-1 md:px-2 py-2 md:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      방문자
                    </th>
                    <th className="hidden md:table-cell px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      블로그
                    </th>
                    <th className="hidden lg:table-cell px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      저장수
                    </th>
                    <th className="hidden sm:table-cell px-1 md:px-2 py-2 md:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {data.rankDataList?.map((item, index) => {
                    const isMyShop = item.trackInfo.shopId === data.shopId;
                    
                    return (
                      <tr
                        key={item.trackInfo.shopId}
                        className={`transition-all hover:bg-gray-50 ${
                          isMyShop
                            ? "border-l-4 border-blue-500 bg-blue-50"
                            : index < 3
                              ? "bg-yellow-50"
                              : "bg-white"
                        }`}
                      >
                        <td className="px-2 py-3 whitespace-nowrap md:px-3 md:py-4">
                          <div className="flex items-center">
                            <span
                              className={`text-sm font-bold md:text-base ${
                                index === 0
                                  ? "text-yellow-600"
                                  : index === 1
                                    ? "text-gray-600"
                                    : index === 2
                                      ? "text-amber-600"
                                      : isMyShop
                                        ? "text-blue-600"
                                        : "text-gray-900"
                              }`}
                            >
                              {item.rankInfo.rank}
                            </span>

                            {/* 순위 변동 표시 - 순위 숫자 옆에 표시 */}
                            {item.previousRank &&
                              item.rankInfo.rank !== item.previousRank && (
                                <span
                                  className={`ml-2 inline-flex items-center rounded px-1.5 py-0.5 text-xs font-semibold ${
                                    item.rankInfo.rank < item.previousRank
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {item.rankInfo.rank < item.previousRank
                                    ? `${item.previousRank - item.rankInfo.rank} ▲`
                                    : `${item.rankInfo.rank - item.previousRank} ▼`}
                                </span>
                              )}

                            {index < 3 && (
                              <span className="ml-1 text-xs md:text-sm">
                                {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                              </span>
                            )}
                            {isMyShop && (
                              <span className="ml-1 hidden rounded bg-blue-100 px-1 text-xs text-blue-600 sm:inline">
                                내 상점
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-2 py-3 whitespace-nowrap md:px-3 md:py-4">
                          <div className="flex items-center">
                            {item.trackInfo.shopImageUrl && (
                              <Image
                                src={item.trackInfo.shopImageUrl}
                                alt={item.trackInfo.shopName}
                                className="mr-2 h-8 w-8 flex-shrink-0 rounded-md object-cover md:h-10 md:w-10"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center">
                                <div className="truncate text-sm font-medium text-gray-900 md:text-base">
                                  {item.trackInfo.shopName}
                                </div>
                                <button
                                  onClick={() =>
                                    window.open(
                                      `https://map.naver.com/v5/search/${encodeURIComponent(item.trackInfo.shopName)}`,
                                      "_blank",
                                    )
                                  }
                                  className="cursor-pointer ml-2 flex-shrink-0  text-blue-600 hover:text-blue-800 hover:underline"
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
                                      d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z"
                                    />
                                  </svg>
                                </button>
                              </div>
                              {item.trackInfo.address && (
                                <div className="hidden truncate text-xs text-gray-500 sm:block">
                                  {item.trackInfo.address}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="hidden px-2 py-3 text-xs whitespace-nowrap text-gray-900 sm:table-cell md:px-3 md:py-4 md:text-sm">
                          <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs leading-5 font-semibold text-gray-800">
                            {item.trackInfo.category || "-"}
                          </span>
                        </td>

                        <td className="px-1 py-3 text-center text-xs whitespace-nowrap text-gray-900 md:px-2 md:py-4 md:text-sm">
                          <div className="flex flex-col items-center">
                            <span className="text-sm font-medium md:text-base">
                              {item.trackInfo.scoreInfo || "-"}
                            </span>
                            {item.trackInfo.scoreInfo && (
                              <div className="mt-1 h-1.5 w-12 rounded-full bg-gray-200 md:h-2 md:w-16">
                                <div
                                  className="h-1.5 rounded-full bg-yellow-400 md:h-2"
                                  style={{
                                    width: `${(parseFloat(item.trackInfo.scoreInfo) / 5) * 100}%`,
                                  }}
                                ></div>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="px-1 py-3 text-right text-xs whitespace-nowrap text-gray-900 md:px-2 md:py-4 md:text-sm">
                          <div className="font-medium">
                            {item.trackInfo.visitorReviewCount === null || item.trackInfo.visitorReviewCount === undefined
                              ? "0"
                              : typeof item.trackInfo.visitorReviewCount === "string"
                                ? item.trackInfo.visitorReviewCount === "null" ? "0" : item.trackInfo.visitorReviewCount
                                : Number(item.trackInfo.visitorReviewCount).toLocaleString()}
                          </div>
                        </td>

                        <td className="hidden px-2 py-3 text-right text-sm whitespace-nowrap text-gray-900 md:table-cell md:py-4">
                          <div className="font-medium">
                            {item.trackInfo.blogReviewCount === null || item.trackInfo.blogReviewCount === undefined
                              ? "0"
                              : typeof item.trackInfo.blogReviewCount === "string"
                                ? item.trackInfo.blogReviewCount === "null" ? "0" : item.trackInfo.blogReviewCount
                                : Number(item.trackInfo.blogReviewCount).toLocaleString()}
                          </div>
                        </td>

                        <td className="hidden px-2 py-3 text-right text-sm whitespace-nowrap text-gray-900 md:py-4 lg:table-cell">
                          <div className="font-medium">
                            {item.trackInfo.saveCount === null || item.trackInfo.saveCount === undefined
                              ? "0"
                              : typeof item.trackInfo.saveCount === "string"
                                ? item.trackInfo.saveCount === "null" ? "0" : item.trackInfo.saveCount
                                : Number(item.trackInfo.saveCount).toLocaleString()}
                          </div>
                        </td>

                        <td className="hidden px-1 py-3 text-center whitespace-nowrap sm:table-cell md:px-2 md:py-4">
                          <div className="flex flex-col items-center space-y-1">
                            {/* 상태 표시 */}
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs leading-5 font-semibold ${
                                index < 5
                                  ? "bg-green-100 text-green-800"
                                  : index < 10
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }`}
                            >
                              {index < 5
                                ? "상위권"
                                : index < 10
                                  ? "중위권"
                                  : "하위권"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        // 기존 모의 데이터 표시 (순위 비교 데이터가 없을 때)
        <div className="h-full flex flex-col min-h-[500px]">
          {/* 데이터 없음 안내 */}
          <div className="mb-4 rounded-lg bg-orange-50 border border-orange-200 p-4">
            <div className="flex items-center">
              <div className="text-orange-600 mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-orange-800">
                  오늘의 순위 데이터가 없습니다
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  선택한 키워드 "{data.keyword}"에 대한 최신 순위 정보를 찾을 수 없습니다. 
                  그리드에서 다른 날짜를 선택하여 해당 날짜의 순위를 확인해보세요.
                </p>
              </div>
            </div>
          </div>
          
          {/* 내 상점 순위 정보 */}
          <div className="mb-4 md:mb-6 rounded-lg bg-primary-50 p-3 md:p-4 flex-shrink-0">
            <h3 className="mb-2 text-sm md:text-base font-medium text-gray-900">
              {data.shopName}
            </h3>
            <div className="flex items-center space-x-3">
              <span className="text-xl md:text-2xl font-bold text-gray-900">
                {getRankString(data.currentRank)}
              </span>
              <span className={`flex items-center text-xs md:text-sm font-medium ${
                data.currentRank < data.previousRank
                  ? 'text-green-600'
                  : data.currentRank > data.previousRank
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {getRankChangeString(data.currentRank, data.previousRank)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * 추적 데이터 기준 순위입니다. 실시간 순위와 다를 수 있습니다.
            </p>
          </div>
          
          {/* 경쟁 업체 순위 */}
          <div className="flex flex-col flex-1 min-h-[350px]">
            <h3 className="mb-3 text-sm md:text-base font-medium text-gray-900 flex-shrink-0">
              추적 데이터 기반 정보
            </h3>
            <div className="space-y-2 md:space-y-3 flex-1 overflow-y-auto">
              {data.competitors.length > 0 ? (
                data.competitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-primary-100 bg-white p-3 md:p-4"
                  >
                    <div className="mr-2">
                      <span className="text-sm md:text-base font-medium text-gray-900">
                        {competitor.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-base md:text-lg font-bold text-gray-900">
                        {getRankString(competitor.currentRank)}
                      </span>
                      <span className={`text-sm md:text-base ${
                        competitor.currentRank < competitor.previousRank
                          ? 'text-green-600'
                          : competitor.currentRank > competitor.previousRank
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}>
                        {getRankChangeString(competitor.currentRank, competitor.previousRank)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-500">
                  <div className="text-center">
                    <p className="text-sm">경쟁 업체 데이터가 없습니다.</p>
                    <p className="text-xs mt-1">그리드에서 날짜를 선택하여 해당 날짜의 순위를 확인해보세요.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};