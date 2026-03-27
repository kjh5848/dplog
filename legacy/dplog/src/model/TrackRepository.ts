// 타입 정의
import { ApiResponse } from "@/types/api";
import { logInfo, logError } from '@/src/utils/logger';
import { processApiResponse } from "@/src/utils/api/responseHandler";
import { TrackGroup } from '@/types/group';
import toast from "react-hot-toast";
import { isUsageLimitCode } from '@/src/utils/usageLimit';

export type Shop = {
  id: string;
  shopId: string;
  shopName: string;
  shopImageUrl: string;
  groupName: string;
  address?: string;
  roadAddress?: string;
  visitorReviewCount?: number;
  blogReviewCount?: number;
  category?: string;
  scoreInfo?: string;
  keywordList?: string[];
  businessSector?: string;
  createDate?: string;
  nplaceRankTrackInfoList: TrackInfo[];
  nplaceRankTrackInfoMap?: {
    [key: string]: TrackInfo;
  };
};

export type TrackInfo = {
  id: string;
  keyword: string;
  province: string;
  rank: number | null;
  rankChange: number;
  shopName: string;
  shopId: string;
  shopImageUrl: string;
  roadAddress: string;
  address: string;
  category: string;
  scoreInfo:string;
  visitorReviewCount: string;
  blogReviewCount: string;
  nplaceRankTrackList?: TrackData[];
  nomadscrapNplaceRankTrackInfoId: string;
};

export type TrackData = {
  id: string;
  rank: number;
  visitorReviewCount: number;
  blogReviewCount: number;
  saveCount: number;
  scoreInfo: string;
  chartDate: string;
};

export type RankCheckData = {
  rankInfo: {
    rank: number;
  };
  trackInfo: {
    shopName: string;
    category: string;
    scoreInfo: string;
    visitorReviewCount: number;
    blogReviewCount: number;
    saveCount: number;
  };
};

class TrackRepository {
  static url = "/v1/nplace/rank";
  static apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.dplog.kr";

  // 상점 목록 조회
  static async getShopList(): Promise<ApiResponse<{ nplaceRankShopList: Shop[] }>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/shop`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error('상점 목록을 불러오는데 실패했습니다.');
    }
    return processApiResponse(response);
  }

  // 그룹 목록 조회
  static async getGroupList(): Promise<ApiResponse<{ groupList: TrackGroup[] }>> {
    const response = await fetch(`${this.apiBaseUrl}/v1/group/list`, {
      credentials: "include",
    });
  
    if (!response.ok) {
      throw new Error('그룹 목록을 불러오는데 실패했습니다.');
    }
    return processApiResponse(response);
  }



  // 추적 가능한 플레이스 검색
  static async searchTrackable(url: string): Promise<ApiResponse<{ nplaceRankShop: Shop }>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/trackable?url=${encodeURIComponent(url)}`, {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error('검색에 실패했습니다.');
    }
    return processApiResponse(response);
  }

  // 상점 추가
  static async addShop(shop: Shop): Promise<ApiResponse<Shop>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/shop`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nplaceRankShop: shop
      })
    });
    const result = await processApiResponse<Shop>(response);

    if (!response.ok && !isUsageLimitCode(result.code)) {
      throw new Error(result.message || '상점 추가에 실패했습니다.');
    }

    return result;
  }

  // 그룹 변경
  static async updateGroup(shopIds: string[], group: TrackGroup): Promise<ApiResponse<void>> {
    const response = await fetch(`${this.apiBaseUrl}${this.url}/shop/group`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nplaceRankShopList: shopIds,
        group: group
      })
    });
    if (!response.ok) {
      throw new Error('그룹 변경에 실패했습니다.');
    }
    return processApiResponse(response);
  }

  // 상점 상세 정보 조회
  static async getShopDetail(id: string): Promise<ApiResponse<{ nplaceRankShop: Shop }>> {
    // URL에 직접 id 값을 삽입
    const url = `${this.apiBaseUrl}${this.url}/shop/${id}`;
    
    logInfo('TrackRepository.getShopDetail - URL', { url });
    
    const response = await fetch(url, {
      credentials: "include",
    });
    
          logInfo('TrackRepository.getShopDetail - Response status', { status: response.status, ok: response.ok });
    
    if (!response.ok) {
      const errorText = await response.text();
      logError('TrackRepository.getShopDetail - Error response', undefined, { errorText });
      throw new Error(`상점 정보를 불러오는데 실패했습니다. (Status: ${response.status})`);
    }
    
    const result = await processApiResponse(response) as ApiResponse<{ nplaceRankShop: Shop }>;
          logInfo('TrackRepository.getShopDetail - Success result', { result });
    return result;
  }

  // 상점 삭제
  static async deleteShop(id: string): Promise<ApiResponse<void>> {
    const url = `${this.apiBaseUrl}${this.url}/shop/${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: "include",
    });
          
    if (!response.ok) {
      throw new Error('상점 삭제에 실패했습니다.');
    }
    return processApiResponse(response);
  }

  // 키워드 추적 상태 없데이트
  static async updateTrackStatus(trackId: string, status: 'RUNNING' | 'STOP'): Promise<ApiResponse<void>> {
    // URL에 직접 keywordId 값을 삽입
    const url = `${this.apiBaseUrl}${this.url}/track/${trackId}`;

    const response = await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nplaceRankTrackInfoStatus: {
          status,
          id: trackId,
        },
      }),
    });

    if (!response.ok) {
      
      throw new Error("상태 변경에 실패했습니다.");
    }
    return processApiResponse(response);
  }

  // 키워드 목록 갱신
  static async updateKeywords(id: string): Promise<ApiResponse<void>> {
    const url = `${this.apiBaseUrl}${this.url}/shop/${id}/keyword`;

    const response = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nplaceRankShop: {
          id: id
        }
      })
    });

    const result = await processApiResponse(response);

    if (!response.ok || result.code !== "0") {
      const errorMessage = result.message || "키워드 목록 갱신에 실패했습니다.";
      logError(
        "키워드 목록 갱신 중 오류 발생",
        new Error(errorMessage),
        { shopId: id, code: result.code }
      );
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // 성공 시 백엔드 메시지 표시
    if (result.message) {
      toast.success(result.message);
    }

    // ApiResponse<void>를 반환해야 하므로 result의 타입을 명확히 void로 지정
    return {
      ...result,
      data: undefined
    };
  }

    // 키워드 추가
  static async addTrack(trackInfo: {
    keyword: string;
    province: string;
    shopId: string;
    businessSector: string;
  }): Promise<ApiResponse<TrackInfo>> {
    
    // 요청 데이터 구조 확인
    const requestBody = {
      nplaceRankTrackInfo: {
        keyword: trackInfo.keyword,
        province: trackInfo.province,
        shopId: trackInfo.shopId,
        businessSector: trackInfo.businessSector || ''
      }
    };
    
    const response = await fetch(`${this.apiBaseUrl}${this.url}/track`, {
      method: 'POST',
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    return processApiResponse(response);
  }

  // 키워드 삭제
  static async deleteTrack(id: string): Promise<ApiResponse<void>> {
    // URL에 직접 id 값을 삽입
    const url = `${this.apiBaseUrl}${this.url}/track/${id}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error('트랙 삭제에 실패했습니다.');
    }
    return processApiResponse(response);
  }

  // // 순위 체크 데이터 조회
  // static async getRankCheckData(shopId: string, searchType: string, searchKeyword: string): Promise<ApiResponse<RankCheckData>> {
  //   // 확인: 파라미터 순서가 id, type, keyword 순서인지 확인 필요
  //   const response = await fetch(`${this.apiBaseUrl}${this.url}/check?shopId=${shopId}&searchType=${searchType}&searchKeyword=${searchKeyword}`, {
  //     credentials: "include",
  //   });
  //   if (!response.ok) {
  //     throw new Error('순위 체크 데이터 조회에 실패했습니다.');
  //   }
  //   return this.processResponse(response);
  // }
}

export default TrackRepository; 
