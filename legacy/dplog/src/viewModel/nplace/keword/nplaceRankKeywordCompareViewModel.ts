import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TrackRepository, { Shop, TrackInfo, TrackData } from '@/src/model/TrackRepository';
import { ApiResponse } from '@/types/api';
import { useState, useEffect } from 'react';
import RealtimeRepository, { 
  RankCompareResponse, 
  RankDataItem 
} from '@/src/model/RealtimeRepository';
import { logInfo, logError, logWarn, logApiResponse } from '@/src/utils/logger';
import { TrackGroup } from "@/src/types/group";
import { notifyUsageLimit } from '@/src/utils/usageLimitNotifier';
import { isUsageLimitCode } from '@/src/utils/usageLimit';

export interface CompareKeywordData {
  keyword: string;
  shopName: string;
  shopId: string;
  currentRank: number;
  previousRank: number;
  trackList: TrackData[];
  rankDataList?: RankDataItem[];  // 순위 비교 데이터 추가
  competitors: {
    name: string;
    currentRank: number;
    previousRank: number;
  }[];
}

// 최근 비교 정보를 저장하기 위한 로컬 스토리지 키
const RECENT_COMPARE_CACHE_KEY = "recentCompareData";

export const useNplaceRankKeywordCompareViewModel = () => {
  const queryClient = useQueryClient();
  
  // 로컬 상태
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [compareData, setCompareData] = useState<CompareKeywordData | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "report">("grid");
  const [isGridItemLoading, setIsGridItemLoading] = useState<boolean>(false); // 그리드 아이템 클릭 로딩 상태
  
  // 상점 목록 조회
  const {
    data: shopListResult,
    error: shopListError,
    isLoading: isLoadingShopList,
    refetch: refetchShopList,
  } = useQuery<ApiResponse<{ nplaceRankShopList: Shop[] }>>({
    queryKey: ["nplaceRankShopList"],
    queryFn: () => TrackRepository.getShopList(),
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false,
  });

  // 선택된 상점의 상세 정보 조회
  const {
    data: shopDetailResult,
    error: shopDetailError,
    isLoading: isLoadingShopDetail,
    refetch: refetchShopDetail,
  } = useQuery<ApiResponse<{ nplaceRankShop: Shop }>>({
    queryKey: ["nplaceRankShop", selectedShop?.id],
    queryFn: async () => {
      if (!selectedShop?.id) {
        throw new Error("상점이 선택되지 않았습니다");
      }
      logInfo('상점 상세 정보 조회 시작', { shopId: selectedShop.id });
      const response = await TrackRepository.getShopDetail(selectedShop.id);
      logApiResponse('상점 상세 정보 조회', response, { shopId: selectedShop.id });
      
      // nplaceRankTrackInfoMap의 province 정보 확인
      const shop = response.data?.nplaceRankShop;
      if (shop?.nplaceRankTrackInfoMap) {
        logInfo('TrackInfoMap 키워드별 province 정보', { 
          trackInfoMap: Object.entries(shop.nplaceRankTrackInfoMap).map(([key, trackInfo]) => ({
            keyword: trackInfo.keyword,
            province: trackInfo.province
          }))
        });
      }
      
      return response;
    },
    enabled: !!selectedShop?.id && selectedShop.id !== undefined,
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false,
  });
  
  // 순위 비교 데이터 조회
  const {
    data: rankCompareResult,
    error: rankCompareError,
    isLoading: isLoadingRankCompare,
    refetch: refetchRankCompare,
  } = useQuery<ApiResponse<RankCompareResponse>>({
    queryKey: ["rankCompare", selectedShop?.id, selectedKeyword],
    queryFn: async () => {
      if (!selectedKeyword) {
        throw new Error("키워드가 선택되지 않았습니다");
      }
      
      // shopDetail에서 선택된 키워드의 province 정보 가져오기
      let province = "서울시"; // 기본값
      if (shopDetailResult?.data?.nplaceRankShop?.nplaceRankTrackInfoMap) {
        const trackInfoEntry = Object.entries(shopDetailResult.data.nplaceRankShop.nplaceRankTrackInfoMap).find(
          ([key, trackInfo]) => trackInfo.keyword === selectedKeyword
        );
        if (trackInfoEntry) {
          const [_, trackInfo] = trackInfoEntry;
          province = trackInfo.province || "서울시";
        }
      }
      
      logInfo('실시간 순위 데이터 조회', { keyword: selectedKeyword, province });
      
      // RealtimeRepository를 통해 API 호출 (실시간 데이터 - searchDate 없음)
      const result = await RealtimeRepository.fetchRealtimeData(selectedKeyword, province);
      
      if (isUsageLimitCode(result.code)) {
        const meta = result.meta;
        notifyUsageLimit(meta, {
          usageType: meta?.usageType ?? "NPLACE_RANK_REALTIME",
          limit: typeof meta?.limit === "number" ? meta.limit : null,
          used: typeof meta?.used === "number" ? meta.used : null,
          recommendedPlanId: meta?.recommendedPlanId ?? null,
          force: true,
        });
      }
      
      // 데이터가 없는 경우 로그 출력
      if (!result.data?.nplaceRankDataList || result.data.nplaceRankDataList.length === 0) {
        logWarn('오늘의 순위 데이터가 없습니다', { keyword: selectedKeyword, province });
      }
      
      return result;
    },
    enabled: !!selectedKeyword && !!shopDetailResult?.data?.nplaceRankShop, // 키워드와 상점 상세 정보가 있을 때 활성화
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false,
  });

  // 그룹 목록 조회
  const {
    data: groupListResult,
    error: groupListError,
    isLoading: isLoadingGroupList,
    } = useQuery<ApiResponse<{ groupList: TrackGroup[] }>>({
    queryKey: ["groupList"],
    queryFn: () => TrackRepository.getGroupList(),
    staleTime: 1000 * 60 * 5, // 5분
    refetchOnWindowFocus: false,
  });

  // 상점 선택 처리
  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
    setSelectedKeyword(null);
    setCompareData(null);
  };

  // 키워드 선택 처리
  const handleKeywordSelect = async (keyword: string) => {
    // 이전 데이터를 완전히 초기화
    setCompareData(null);
    
    // 이전 키워드의 React Query 캐시 무효화
    if (selectedKeyword) {
      queryClient.removeQueries({
        queryKey: ["rankCompare", selectedShop?.id, selectedKeyword]
      });
    }
    
    setSelectedKeyword(keyword);
    
    // 실제 추적 데이터 조회 - shopDetail 데이터 사용
    if (selectedShop && shopDetailResult?.data?.nplaceRankShop) {
      const shop = shopDetailResult.data.nplaceRankShop;
      generateRealCompareData(shop, keyword);
      
      // 실시간 데이터 자동 로드 추가
      logInfo('키워드 선택 - 실시간 데이터 로드 시작', { keyword });
      
      // React Query로 실시간 데이터 조회 트리거
      setTimeout(() => {
        refetchRankCompare();
      }, 100); // 약간의 지연을 두어 상태 업데이트 후 실행
    }
  };
  
  // 순위 비교 데이터가 로드되면 compareData에 추가
  useEffect(() => {
    // selectedKeyword와 compareData가 모두 있고, 같은 키워드일 때만 업데이트
    if (rankCompareResult?.data?.nplaceRankDataList && 
        compareData && 
        selectedKeyword &&
        compareData.keyword === selectedKeyword && // 키워드 일치 확인 추가
        !compareData.rankDataList) {  // 이미 rankDataList가 있으면 업데이트하지 않음
      setCompareData({
        ...compareData,
        rankDataList: rankCompareResult.data.nplaceRankDataList
      });
    }
  }, [rankCompareResult, compareData, selectedKeyword]); // selectedKeyword 의존성 추가

  // 실제 비교 데이터 생성 (실제 TrackRepository 데이터 사용)
  const generateRealCompareData = (shop: Shop, keyword: string) => {
    // 선택된 키워드에 해당하는 TrackInfo 찾기
    const trackInfoMap = shop.nplaceRankTrackInfoMap;
    if (!trackInfoMap) {
      logError("추적 정보가 없습니다", undefined, { shopId: shop.id });
      setCompareData(null);
      return;
    }

    // 키워드로 해당하는 TrackInfo 찾기
    const trackInfoEntry = Object.entries(trackInfoMap).find(
      ([key, trackInfo]) => trackInfo.keyword === keyword
    );

    if (!trackInfoEntry) {
      logError(`키워드 "${keyword}"에 대한 추적 정보를 찾을 수 없습니다`, undefined, { keyword });
      setCompareData(null);
      return;
    }

    const [trackInfoKey, trackInfo] = trackInfoEntry;
    const trackList = trackInfo.nplaceRankTrackList || [];

    // 날짜 기준으로 최신 순으로 정렬
    const sortedTrackList = [...trackList].sort((a, b) => 
      new Date(b.chartDate).getTime() - new Date(a.chartDate).getTime()
    );

    // 추적 데이터가 없으면 null 설정
    if (sortedTrackList.length === 0) {
      logInfo(`키워드 "${keyword}"에 대한 추적 데이터가 없습니다`, { keyword });
      setCompareData(null);
      return;
    }

    // 현재 순위와 이전 순위 계산
    const currentRank = sortedTrackList.length > 0 ? sortedTrackList[0].rank || 0 : 0;
    const previousRank = sortedTrackList.length > 1 ? sortedTrackList[1].rank || 0 : 0;
    
    const realData: CompareKeywordData = {
      keyword,
      shopName: shop.shopName,
      shopId: shop.shopId,
      currentRank,
      previousRank,
      trackList: sortedTrackList,
      competitors: [] // 경쟁업체 모의 데이터 제거
    };
    
    setCompareData(realData);
    saveRecentCompareData(realData);
  };

  // 최근 비교 데이터 저장
  const saveRecentCompareData = (data: CompareKeywordData) => {
    try {
      const recentData = localStorage.getItem(RECENT_COMPARE_CACHE_KEY);
      const compareList = recentData ? JSON.parse(recentData) : [];
      
      // 중복 제거
      const filteredData = compareList.filter(
        (item: CompareKeywordData) => 
          !(item.shopId === data.shopId && item.keyword === data.keyword)
      );
      
      // 최대 5개까지 저장
      const updatedData = [data, ...filteredData].slice(0, 5);
      localStorage.setItem(RECENT_COMPARE_CACHE_KEY, JSON.stringify(updatedData));
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("최근 비교 데이터 저장 실패", errorObj, { operation: 'saveRecentCompareData' });
    }
  };

  // 최근 비교 데이터 조회
  const getRecentCompareData = (): CompareKeywordData[] => {
    try {
      const recentData = localStorage.getItem(RECENT_COMPARE_CACHE_KEY);
      return recentData ? JSON.parse(recentData) : [];
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("최근 비교 데이터 조회 실패", errorObj, { operation: 'getRecentCompareData' });
      return [];
    }
  };

  // 순위 변동 문자열 반환
  const getRankChangeString = (current: number, previous: number) => {
    if (current < previous) {
      return `▲${previous - current}`;
    } else if (current > previous) {
      return `▼${current - previous}`;
    } else {
      return "-";
    }
  };

  // 선택된 상점의 키워드 목록 반환
  const getKeywordsFromSelectedShop = (): string[] => {
    if (!shopDetailResult?.data?.nplaceRankShop?.nplaceRankTrackInfoMap) {
      return [];
    }
    
    return Object.values(shopDetailResult.data.nplaceRankShop.nplaceRankTrackInfoMap)
      .map(info => info.keyword);
  };

  // 특정 날짜의 순위 비교 데이터 조회 함수
  const fetchRankCompareDataForDate = async (trackData: TrackData) => {
    if (!selectedKeyword || !selectedShop) {
      logError("키워드 또는 상점이 선택되지 않았습니다", undefined, { selectedKeyword, selectedShop });
      return null;
    }

    // shopDetail에서 상세 정보 가져오기 (province 정보가 있는 정확한 데이터)
    const shopDetailData = shopDetailResult?.data?.nplaceRankShop;
    if (!shopDetailData) {
      logError("상점 상세 정보가 없습니다", undefined, { selectedShop });
      return null;
    }

    let province = "서울시"; // 기본값으로 초기화

    try {
      // shopDetail에서 선택된 키워드의 지역 정보 가져오기
      const trackInfoMap = shopDetailData.nplaceRankTrackInfoMap;
      const trackInfoEntry = Object.entries(trackInfoMap || {}).find(
        ([key, trackInfo]) => trackInfo.keyword === selectedKeyword
      );

      if (!trackInfoEntry) {
        logError(`키워드 "${selectedKeyword}"에 대한 추적 정보를 찾을 수 없습니다`, undefined, { selectedKeyword });
        return null;
      }

      const [_, trackInfo] = trackInfoEntry;
      logInfo("trackInfo", { province: trackInfo.province });
      province = trackInfo.province || "서울시";

      // 날짜 형식 확인 및 변환
      let searchDate = trackData.chartDate;
      
      // chartDate가 ISO 형식이 아닌 경우 변환
      if (!searchDate.includes('T')) {
        // YYYY-MM-DD 형식인 경우 ISO 형식으로 변환
        const date = new Date(searchDate + 'T00:00:00.000Z');
        searchDate = date.toISOString();
      }

      // 이전 날짜 계산 (compareData의 trackList에서 이전 데이터 찾기)
      let previousDate: string | undefined;
      if (compareData?.trackList) {
        const currentIndex = compareData.trackList.findIndex(
          track => track.chartDate === trackData.chartDate
        );
        
        if (currentIndex !== -1 && currentIndex < compareData.trackList.length - 1) {
          const previousTrack = compareData.trackList[currentIndex + 1];
          let prevDate = previousTrack.chartDate;
          
          // 이전 날짜도 ISO 형식으로 변환
          if (!prevDate.includes('T')) {
            const date = new Date(prevDate + 'T00:00:00.000Z');
            prevDate = date.toISOString();
          }
          previousDate = prevDate;
        }
      }

      logInfo(`fetchRankCompareDataForDate 호출`, {
        keyword: selectedKeyword,
        province: province,
        originalDate: trackData.chartDate,
        searchDate: searchDate,
        previousDate: previousDate,
        currentRank: trackData.rank
      });

      // 순위 비교 데이터 조회 (이전 날짜 포함)
      const result = await RealtimeRepository.fetchRankCompareData(
        selectedKeyword,
        province,
        searchDate,
        previousDate
      );

      logInfo(`API 응답`, {
        code: result.code,
        dataLength: result.data?.nplaceRankDataList?.length || 0,
        message: result.message
      });

      if (Number(result.code) !== 0) {
        logError("순위 비교 데이터 조회 실패", undefined, { message: result.message, code: result.code });
        return null;
      }

      // 지역별 데이터 검증
      if (result.data?.nplaceRankDataList && result.data.nplaceRankDataList.length > 0) {
        logInfo(`받은 데이터 검증`, { 
          province, 
          dataCount: result.data.nplaceRankDataList.length,
          firstData: result.data.nplaceRankDataList[0]
        });
        
        // 이전 날짜 데이터가 있는 경우 이전 순위 정보 추가
        if (previousDate) {
          try {
            const previousResult = await RealtimeRepository.fetchRankCompareData(
              selectedKeyword,
              province,
              previousDate
            );
            
            if (Number(previousResult.code) === 0 && previousResult.data?.nplaceRankDataList) {
              // 현재 데이터에 이전 순위 정보 매핑
              const updatedRankDataList = result.data.nplaceRankDataList.map(currentItem => {
                const previousItem = previousResult.data.nplaceRankDataList.find(
                  prevItem => prevItem.trackInfo.shopId === currentItem.trackInfo.shopId
                );
                
                return {
                  ...currentItem,
                  previousRank: previousItem ? previousItem.rankInfo.rank : undefined
                };
              });
              
              // compareData 업데이트 (이전 순위 정보 포함)
              if (compareData) {
                setCompareData({
                  ...compareData,
                  rankDataList: updatedRankDataList
                });
              }
              
              logInfo(`이전 순위 데이터 매핑 완료`, { companyCount: updatedRankDataList.length });
              return updatedRankDataList;
            }
                  } catch (error) {
          const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
          logError("이전 날짜 순위 데이터 조회 실패", errorObj, { keyword: selectedKeyword, province });
        }
        }
              } else {
          logWarn(`데이터 없음`, { keyword: selectedKeyword, province, searchDate });
        }

      // compareData 업데이트 (이전 순위 정보 없이)
      if (compareData) {
        setCompareData({
          ...compareData,
          rankDataList: result.data.nplaceRankDataList
        });
      }

      return result.data.nplaceRankDataList;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("순위 비교 데이터 조회 중 오류", errorObj, { keyword: selectedKeyword, province });
      return null;
    }
  };

  return {
    // 상점 데이터
    shopList: shopListResult?.data?.nplaceRankShopList || [],
    isLoadingShopList,
    shopListError,
    refetchShopList,

    // 상점 상세 데이터
    shopDetail: shopDetailResult?.data?.nplaceRankShop,
    isLoadingShopDetail,
    shopDetailError,

    // 그룹 데이터
    groupList: groupListResult?.data?.groupList || [],
    isLoadingGroupList,
    groupListError,

    // 순위 비교 데이터
    rankCompareData: rankCompareResult?.data,
    isLoadingRankCompare,
    rankCompareError,
    refetchRankCompare,

    // 선택된 데이터
    selectedShop,
    selectedKeyword,
    compareData,

    // 키워드 목록
    keywords: getKeywordsFromSelectedShop(),

    // 뷰 모드
    viewMode,
    setViewMode,

    // 액션 핸들러
    handleShopSelect,
    handleKeywordSelect,
    getRankChangeString,
    getRecentCompareData,
    getRankString: (rank: number | null): string => {
      if (rank == null) {
        return "추적 대기";
      } else if (rank === -1) {
        return "순위권 이탈";
      } else {
        return `${rank}위`;
      }
    },
    fetchRankCompareDataForDate,
    
    // 상태 정보 추가
    hasRealtimeData: !!rankCompareResult?.data?.nplaceRankDataList && rankCompareResult.data.nplaceRankDataList.length > 0,
    realtimeDataError: rankCompareError,
    isRealtimeDataLoading: isLoadingRankCompare,

    // 그리드 아이템 클릭 로딩 상태
    isGridItemLoading,
    setIsGridItemLoading,
  };
}; 
