/**
 * 가게 API 클라이언트
 *
 * 백엔드 StoreController와 통신합니다.
 * POST /v1/stores         — 가게 등록
 * GET  /v1/stores/{id}    — 가게 조회
 * PUT  /v1/stores/{id}    — 가게 수정
 * GET  /v1/stores/me      — 내 가게 목록
 */
import { get, post, put } from '@/shared/api';
import type {
  Store,
  StoreCreateRequest,
} from '../model/types';

/**
 * 가게 등록
 */
export async function createStore(request: StoreCreateRequest): Promise<Store> {
  return post<Store>('/v1/stores', request);
}

/**
 * 가게 단건 조회
 */
export async function getStore(storeId: number): Promise<Store> {
  return get<Store>(`/v1/stores/${storeId}`);
}

/**
 * 가게 최신 데이터로 동기화 (딥 스크래핑 갱신)
 */
export async function syncStore(
  storeId: number,
): Promise<Store> {
  return post<Store>(`/v1/stores/${storeId}/sync`, {});
}

/**
 * 내 가게 목록 조회
 */
export async function getMyStores(): Promise<Store[]> {
  return get<Store[]>('/v1/stores/me');
}

/**
 * 황금키워드 발굴 시작
 */
export async function discoverKeywords(
  storeId: number,
  seedKeyword: string,
): Promise<{ task_id: string; message: string }> {
  // Python 백엔드 엔드포인트 규격 (POST /v1/stores/{store_id}/keywords/discover)
  return post<{ task_id: string; message: string }>(`/v1/stores/${storeId}/keywords/discover`, {
    seed_keyword: seedKeyword,
  });
}

/**
 * 황금키워드 모듈 상태 폴링
 */
export async function getKeywordStatus(
  storeId: number,
): Promise<{
  status: string;
  task_id: string;
  seed_keyword: string;
  result: any;
  error: string | null;
}> {
  return get<any>(`/v1/stores/${storeId}/keywords/status`);
}

