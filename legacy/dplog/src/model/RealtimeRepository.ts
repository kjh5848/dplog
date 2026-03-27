import { ApiResponse } from "@/types/api";
import { logInfo, logError } from '@/src/utils/logger';
import { processApiResponse } from "@/src/utils/api/responseHandler";
import { isUsageLimitCode } from '@/src/utils/usageLimit';

// API 요청 인터페이스
export interface NplaceRankCheckData {
  keyword: string;
  province: string;
  searchDate: string; // ISO 포맷 날짜 문자열
  previousDate?: string; // 이전 날짜 비교를 위한 옵셔널 필드
}

export interface RealtimeRankRequest {
  nplaceRankCheckData: NplaceRankCheckData;
}

// 순위 비교 결과의 shop 정보 인터페이스
export interface RankShopInfo {
  shopId: string;
  shopName: string;
  shopImageUrl: string;
  category: string;
  address: string;
  roadAddress: string;
  visitorReviewCount: string;
  blogReviewCount: string;
  scoreInfo: string;
  saveCount: string;
}

// 순위 정보 인터페이스
export interface RankInfo {
  rank: number;
  totalCount: number;
}

// 순위 비교 결과 항목 인터페이스
export interface RankDataItem {
  trackInfo: RankShopInfo;
  rankInfo: RankInfo;
  previousRank?: number; // 이전 순위 비교를 위한 옵셔널 필드
}

// 순위 비교 API 응답 인터페이스
export interface RankCompareResponse {
  nplaceRankDataList: RankDataItem[];
}


class RealtimeRepository {
  static apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api.dplog.kr";

  // 순위 비교 데이터 조회 (통합된 메서드)
  static async fetchRankCompareData(
    keyword: string,
    province: string,
    searchDate?: string, // 옵셔널: 없으면 현재 시간 사용
    previousDate?: string, // 이전 날짜 비교를 위한 옵셔널 필드
  ): Promise<ApiResponse<RankCompareResponse>> {
    try {
      const currentDate = searchDate || new Date().toISOString();

      // 이전 날짜가 제공되지 않은 경우, searchDate의 하루 전으로 설정
      let prevDate = previousDate;
      if (!prevDate && searchDate) {
        const date = new Date(searchDate);
        date.setDate(date.getDate() - 1);
        prevDate = date.toISOString();
      }

      const requestData: RealtimeRankRequest = {
        nplaceRankCheckData: {
          keyword,
          province,
          searchDate: currentDate,
          previousDate: prevDate,
        },
      };

      logInfo("순위 비교 데이터 요청", {
        keyword,
        province,
        searchDate: currentDate,
        previousDate: prevDate,
        isRealtime: !searchDate,
      });

      const response = await fetch(
        `${this.apiBaseUrl}/v1/nplace/rank/realtime/list`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestData),
        },
      );

      const result = await processApiResponse<RankCompareResponse>(response);

      if (!response.ok && !isUsageLimitCode(result.code)) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("순위 비교 데이터 조회 실패", errorObj, { keyword, province });
      throw error;
    }
  }

  // 실시간 순위 데이터 조회 (편의 메서드)
  static async fetchRealtimeData(
    keyword: string,
    province: string,
  ): Promise<ApiResponse<RankCompareResponse>> {
    return this.fetchRankCompareData(keyword, province); // searchDate 없이 호출
  }

  // 클릭한 상점의 상세 정보 조회
  static async getShopDetail(
    shopId: string,
  ): Promise<ApiResponse<RankDataItem>> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/v1/nplace/rank/shop/${shopId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );

      const result = await processApiResponse<RankDataItem>(response);

      if (!response.ok && !isUsageLimitCode(result.code)) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("상점 상세 데이터 조회 실패", errorObj, { shopId });
      throw error;
    }
  }
}

export default RealtimeRepository;
