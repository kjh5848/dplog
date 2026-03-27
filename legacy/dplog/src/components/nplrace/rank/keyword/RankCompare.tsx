import React from 'react';
import { CompareKeywordData } from '@/src/viewModel/nplace/keword/nplaceRankKeywordCompareViewModel';
import { RankDataItem } from '@/src/model/RealtimeRepository';
import Image from 'next/image';

interface RankCompareProps {
  selectedKeyword: string | null;
  compareData: CompareKeywordData | null;
  getRankChangeString: (current: number, previous: number) => string;
  onRankItemClick?: (shopId: string) => void;
}

const RankCompare: React.FC<RankCompareProps> = ({
  selectedKeyword,
  compareData,
  getRankChangeString,
  onRankItemClick
}) => {
  if (!selectedKeyword || !compareData) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        데이터를 불러오는 중입니다...
      </div>
    );
  }

  // 실제 API에서 받은 순위 데이터 사용
  const rankDataList = compareData.rankDataList || [];

  // 데이터가 없는 경우 처리
  if (rankDataList.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        순위 비교 데이터가 없습니다.
      </div>
    );
  }

  // 순위 항목 클릭 핸들러
  const handleRankItemClick = (shopId: string) => {
    if (onRankItemClick) {
      onRankItemClick(shopId);
    }
  };

  return (
    <div className="h-[calc(60vh-4rem)] overflow-y-auto">
      {/* 선택된 키워드 표시 */}
      <div className="mb-4 p-2 bg-primary-50 border border-primary-100 rounded-lg">
        <p className="text-sm text-primary-700">
          <span className="font-medium">키워드:</span> {selectedKeyword}
        </p>
        <p className="text-xs text-primary-600 mt-1">
          총 {rankDataList.length > 0 ? rankDataList[0].rankInfo.totalCount : '-'}개 업체 중 상위 {rankDataList.length}곳 표시
        </p>
      </div>
      
      {/* 순위 리스트 */}
      <div className="space-y-4">
        {rankDataList.map((shop, index) => (
          <div 
            key={shop.trackInfo.shopId}
            className={`flex items-center space-x-4 p-3 rounded-lg border ${
              // 내 상점 여부에 따른 스타일 적용
              compareData.shopId === shop.trackInfo.shopId 
                ? 'bg-primary-50 border-primary-200' 
                : index === 0 
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-white border-gray-200'
            } hover:border-primary-300 transition-all cursor-pointer`}
            onClick={() => handleRankItemClick(shop.trackInfo.shopId)}
          >
            <div className="flex-none w-8 h-8 flex items-center justify-center font-semibold text-lg">
              {shop.rankInfo.rank}
            </div>
            
            <div className="w-12 h-12 relative rounded-md overflow-hidden flex-none">
              {shop.trackInfo.shopImageUrl ? (
                <Image
                  src={shop.trackInfo.shopImageUrl}
                  alt={shop.trackInfo.shopName}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">이미지 없음</span>
                </div>
              )}
            </div>
            
            <div className="flex-grow min-w-0">
              <div className="flex items-center">
                <h3 className="text-base font-medium text-gray-900 truncate">
                  {shop.trackInfo.shopName}
                  {compareData.shopId === shop.trackInfo.shopId && (
                    <span className="ml-2 text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                      내 상점
                    </span>
                  )}
                </h3>
                <span className="ml-2 text-xs text-gray-500">{shop.trackInfo.category}</span>
              </div>
              <p className="text-xs text-gray-500 truncate">{shop.trackInfo.roadAddress}</p>
              <div className="flex items-center space-x-3 mt-1 text-sm">
                <span className="flex items-center">
                  <span className="text-gray-500 mr-1">방문:</span>
                  <span>{shop.trackInfo.visitorReviewCount}</span>
                </span>
                <span className="flex items-center">
                  <span className="text-gray-500 mr-1">블로그:</span>
                  <span>{shop.trackInfo.blogReviewCount}</span>
                </span>
                {shop.trackInfo.scoreInfo !== "-" && (
                  <span className="flex items-center">
                    <span className="text-gray-500 mr-1">평점:</span>
                    <span>{shop.trackInfo.scoreInfo}</span>
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex-none">
              <div className="text-xs text-gray-500">저장</div>
              <div className="text-sm font-semibold">{shop.trackInfo.saveCount}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RankCompare;