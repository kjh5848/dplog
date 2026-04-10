/**
 * 순위(Ranking) 도메인 타입 정의
 *
 * Phase 3: 실제 백엔드 API DTO에 매핑되는 타입입니다.
 * 백엔드 RankingController 응답 구조와 1:1 대응됩니다.
 */

// ─── 실시간 순위 ──────────────────────────────────────────────

/** GET /v1/stores/{id}/ranking/realtime 응답 아이템 */
export interface RealtimeRank {
  /** 가게 고유 ID */
  shopId: string;
  /** 가게명 */
  shopName: string;
  /** 가게 이미지 URL */
  shopImageUrl: string;
  /** 카테고리 (예: "한식") */
  category: string;
  /** 지번 주소 */
  address: string;
  /** 도로명 주소 */
  roadAddress: string;
  /** 해당 상점 플레이스 링크 (클릭 이동용) */
  placeUrl?: string;
  /** 방문자 리뷰 수 */
  visitorReviewCount: string;
  /** 블로그 리뷰 수 */
  blogReviewCount: string;
  /** 별점 정보 */
  scoreInfo: string;
  /** 저장(찜) 수 */
  saveCount: string;
  /** 현재 순위 (광고 포함 절대순위) */
  rank: number;
  /** 자연 노출 순위 (광고 제외, 광고이면 0) */
  naturalRank: number;
  isAd?: boolean;
  /** 전체 검색 결과 수 */
  totalCount: number;
}

// ─── 트래킹 정보 ──────────────────────────────────────────────

/** GET /v1/stores/{id}/ranking/track/info 응답 아이템 / POST 등록 응답 */
export interface TrackInfo {
  /** 트래킹 ID */
  id: number;
  /** 키워드 */
  keyword: string;
  /** 지역 */
  province: string;
  /** 업종 */
  businessSector: string;
  /** 가게 ID */
  shopId: string;
  /** 순위 변동 (양수 = 상승, 음수 = 하락) */
  rankChange: number;
}

// ─── 차트 데이터 ──────────────────────────────────────────────

/** POST /v1/stores/{id}/ranking/track/chart 응답 */
export interface TrackChartResponse {
  /** 키워드별 차트 데이터 (키: 키워드명 또는 ID) */
  charts: Record<string, KeywordChart>;
}

/** 키워드별 차트 상세 */
export interface KeywordChart {
  /** 트래킹 ID */
  id: number;
  /** 키워드 */
  keyword: string;
  /** 지역 */
  province: string;
  /** 가게 ID */
  shopId: string;
  /** 순위 변동 */
  rankChange: number;
  /** 일별 순위 목록 (최대 30일) */
  dailyRanks: DailyRank[];
}

/** 일별 순위 데이터 포인트 */
export interface DailyRank {
  /** 해당일 순위 */
  rank: number;
  isAd?: boolean;
  /** 전일 순위 */
  prevRank: number;
  /** 방문자 리뷰 수 */
  visitorReviewCount: string;
  /** 블로그 리뷰 수 */
  blogReviewCount: string;
  /** 별점 */
  scoreInfo: string;
  /** 저장(찜) 수 */
  saveCount: string;
  /** 오전/오후 구분 */
  ampm: string;
  /** 유효 데이터 여부 */
  isValid: boolean;
  /** 차트 날짜 */
  chartDate: string;
}

// ─── 트래킹 상태 ──────────────────────────────────────────────

/** GET /v1/stores/{id}/ranking/track/state 응답 */
export interface TrackState {
  /** 전체 키워드 수 */
  totalCount: number;
  /** 수집 완료된 키워드 수 */
  completedCount: number;
  /** 수집 완료된 키워드 목록 */
  completedKeywords: CompletedKeyword[];
}

/** 완료 키워드 정보 */
export interface CompletedKeyword {
  /** 키워드 */
  keyword: string;
  /** 지역 */
  province: string;
}

// ─── 요청 타입 ──────────────────────────────────────────────

/** 트래킹 등록 요청 body */
export interface TrackRequest {
  keyword: string;
  province: string;
}

/** 차트 조회 요청 body */
export interface TrackChartRequest {
  trackInfoIds: number[];
  startDate: string | null;
}
