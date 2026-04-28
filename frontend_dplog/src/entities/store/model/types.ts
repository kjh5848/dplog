/**
 * 가게(Store) 도메인 타입 정의
 *
 * 백엔드 StoreController API 응답과 1:1 대응됩니다.
 */

// ─── 가게 관련 타입 ──────────────────────────────────────────

export interface StoreReviewTag {
  id: number;
  category: string;
  name: string;
  count: number;
}

export interface StoreRecentReview {
  id: number;
  snippet: string;
}

export interface StoreMenu {
  id: number;
  name: string;
  price: string;
  description?: string;
  imgUrl?: string;
  /** 대표메뉴 여부 */
  is_representative?: boolean;
}

/** 가게 정보 */
export interface Store {
  /** 가게 고유 ID */
  id: number;
  /** 가게명 */
  name: string;
  /** 카테고리 (예: '음식점', '카페', '미용실') */
  category: string;
  /** 주소 */
  address: string;
  /** 네이버 플레이스 URL */
  placeUrl?: string;
  /** 전화번호 */
  phone?: string;
  /** 가게 위도 */
  latitude?: number;
  /** 가게 경도 */
  longitude?: number;
  /** 가게 이미지 URL (내순이 연동 시 자동 수집) */
  shopImageUrl?: string;
  /** 정규화/썸네일 적용된 로컬 이미지 캐시 URL */
  shopImageThumbUrl?: string;
  /** 네이버 공식/설정 키워드 콤마 구문 */
  keywords?: string;
  /** 방문자 리뷰 수 */
  visitor_reviews?: number;
  /** 블로그 리뷰 수 */
  blog_reviews?: number;
  /** 저장(북마크) 수 */
  saves?: number;
  /** 평점 */
  rating?: number;
  /** 스크래핑 상태 (PENDING, COMPLETED, FAILED) */
  scrape_status?: string;
  /** 생성일 */
  createdAt: string;
  /** 수정일 */
  updatedAt: string;
  /** 리뷰 분석 태그 목록 */
  review_tags?: StoreReviewTag[];
  /** 최근 텍스트 리뷰 말풍선 목록 */
  recent_reviews?: StoreRecentReview[];
  /** 메뉴 목록 (딥스크래핑 수집) */
  menus?: StoreMenu[];
  /** 추출된 다중 이미지 URL 목록 */
  images?: string[];
}

/** 가게 등록 요청 */
export interface StoreCreateRequest {
  /** 가게명 (필수, 100자 이내) */
  name: string;
  /** 카테고리 (필수, 50자 이내) */
  category: string;
  /** 주소 (필수, 300자 이내) */
  address: string;
  /** 네이버 플레이스 URL (선택, 500자 이내) */
  placeUrl?: string;
  /** 전화번호 (선택, 20자 이내) */
  phone?: string;
  /** 가게 위도 */
  latitude?: number;
  /** 가게 경도 */
  longitude?: number;
}

/** 가게 수정 요청 (부분 수정 지원 — null 필드는 기존 값 유지) */
export interface StoreUpdateRequest {
  /** 가게명 */
  name?: string;
  /** 카테고리 */
  category?: string;
  /** 주소 */
  address?: string;
  /** 네이버 플레이스 URL */
  placeUrl?: string;
  /** 전화번호 */
  phone?: string;
  /** 가게 위도 */
  latitude?: number;
  /** 가게 경도 */
  longitude?: number;
}

// ─── 키워드 관련 타입 ──────────────────────────────────────────

/** 키워드 세트 */
export interface KeywordSet {
  /** 키워드 세트 ID */
  id: number;
  /** 가게 FK */
  storeId: number;
  /** 키워드 목록 (백엔드 List<String> 대응) */
  keywords: string[];
  /** 유효성 검증 정보 (JSON) */
  validationInfo?: string;
  /** 생성일 */
  createdAt: string;
}

/** 키워드 세트 생성 요청 */
export interface KeywordSetCreateRequest {
  /** 키워드 목록 (백엔드 List<String> 대응) */
  keywords: string[];
}

// ─── 키워드 추천 관련 타입 ────────────────────────────────────

/** 연관 키워드 추천 응답 (백엔드 KeywordSuggestResponse 대응) */
export interface KeywordSuggestResponse {
  /** 힌트 키워드 (사용자 입력) */
  hintKeyword: string;
  /** 추천 키워드 목록 */
  keywords: KeywordSuggestion[];
}

/** 추천 키워드 개별 항목 (백엔드 SuggestedKeyword 대응) */
export interface KeywordSuggestion {
  /** 연관 키워드 */
  keyword: string;
  /** 월간 PC 검색량 */
  monthlyPcSearchCount: string;
  /** 월간 모바일 검색량 */
  monthlyMobileSearchCount: string;
  /** 경쟁 지수 (높음/중간/낮음) */
  competitionIndex: string;
}

// ─── 카테고리 옵션 ──────────────────────────────────────────

/** 가게 카테고리 목록 */
export const STORE_CATEGORIES = [
  '음식점',
  '카페',
  '미용실',
  '병원',
  '약국',
  '학원',
  '헬스장',
  '숙박',
  '편의점',
  '기타',
] as const;

export type StoreCategory = typeof STORE_CATEGORIES[number];
