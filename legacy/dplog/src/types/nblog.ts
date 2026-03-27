/**
 * [Role]   N-BLOG 타입 정의
 * [Input]  -
 * [Output] N-BLOG 관련 인터페이스 및 타입
 * [NOTE]   Pure Fn · Sync
 */

// N-BLOG 검색 요청 타입
export interface NBlogSearchRequest {
  nblog: {
    url: string;
  };
}

// N-BLOG 검색 응답 타입
export interface NBlogSearchResponse {
  nblog: {
    url: string;
    searchable: boolean;
    reason: string | null;
  };
}

// N-BLOG 배치 요청 타입
export interface NBlogBatchRequest {
  urls: string[];
}

// N-BLOG 배치 응답 타입
export interface NBlogBatchResponse {
  results: NBlogSearchResponse[];
}

// 검색 결과 타입 (UI용)
export interface NBlogSearchResult {
  url: string;
  searchable: boolean;
  reason: string | null;
  isLoading?: boolean;
  error?: string;
}

// 검색 상태 타입
export type NBlogSearchStatus = 'idle' | 'loading' | 'success' | 'error';

// 검색 옵션 타입
export interface NBlogSearchOptions {
  batchSize?: number;
  delayBetweenRequests?: number;
  retryCount?: number;
} 