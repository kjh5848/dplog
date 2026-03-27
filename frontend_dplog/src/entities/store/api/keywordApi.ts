/**
 * 키워드 세트 API 클라이언트
 *
 * 가게별 키워드 세트 생성/조회를 처리합니다.
 * POST /v1/stores/{storeId}/keyword-sets — 키워드 세트 생성
 * GET  /v1/stores/{storeId}/keyword-sets — 키워드 세트 조회
 */
import { get, post } from '@/shared/api';
import type { KeywordSet, KeywordSetCreateRequest, KeywordSuggestResponse } from '../model/types';

/**
 * 키워드 세트 생성
 */
export async function createKeywordSet(
  storeId: number,
  request: KeywordSetCreateRequest,
): Promise<KeywordSet> {
  return post<KeywordSet>(`/v1/stores/${storeId}/keyword-sets`, request);
}

/**
 * 가게의 키워드 세트 목록 조회
 */
export async function getKeywordSets(storeId: number): Promise<KeywordSet[]> {
  return get<KeywordSet[]>(`/v1/stores/${storeId}/keyword-sets`);
}

/**
 * 연관 키워드 추천 (네이버 검색광고 API 기반)
 *
 * GET /v1/keywords/suggest?keyword={keyword}
 */
export async function suggestKeywords(keyword: string): Promise<KeywordSuggestResponse> {
  return get<KeywordSuggestResponse>('/v1/keywords/suggest', {
    params: { keyword },
  });
}
