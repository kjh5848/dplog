/**
 * 순위 API 클라이언트
 *
 * 백엔드 RankingController 6개 엔드포인트에 대응합니다.
 * shared/api 의 Axios 래퍼를 사용하여 ResDTO 자동 언래핑됩니다.
 */
import { get, post, del } from '@/shared/api';
import type {
  RealtimeRank,
  TrackInfo,
  TrackChartResponse,
  TrackState,
} from '../model/types';

// ─── #1 실시간 순위 조회 ──────────────────────────────────────

/**
 * 실시간 순위 조회
 * GET /v1/stores/{storeId}/ranking/realtime?keyword=...&province=...
 */
export async function getRealtime(
  storeId: number,
  keyword: string,
  province: string = '서울',
): Promise<RealtimeRank[]> {
  return get<RealtimeRank[]>(`/v1/stores/${storeId}/ranking/realtime`, {
    params: { keyword, province },
  });
}

// ─── #2 트래킹 등록 ──────────────────────────────────────────

/**
 * 순위 트래킹 등록
 * POST /v1/stores/{storeId}/ranking/track
 */
export async function registerTrack(
  storeId: number,
  keyword: string,
  province: string,
): Promise<TrackInfo> {
  return post<TrackInfo>(`/v1/stores/${storeId}/ranking/track`, {
    keyword,
    province,
  });
}

// ─── #3 순위 차트 (30일) ─────────────────────────────────────

/**
 * 순위 차트 조회
 * POST /v1/stores/{storeId}/ranking/track/chart
 */
export async function getTrackChart(
  storeId: number,
  trackInfoIds: number[],
  startDate: string | null = null,
): Promise<TrackChartResponse> {
  return post<TrackChartResponse>(
    `/v1/stores/${storeId}/ranking/track/chart`,
    { trackInfoIds, startDate },
  );
}

// ─── #4 트래킹 정보 목록 ─────────────────────────────────────

/**
 * 등록된 트래킹 키워드 목록 조회
 * GET /v1/stores/{storeId}/ranking/track/info
 */
export async function getTrackInfoList(
  storeId: number,
): Promise<TrackInfo[]> {
  return get<TrackInfo[]>(`/v1/stores/${storeId}/ranking/track/info`);
}

// ─── #5 트래킹 상태 ──────────────────────────────────────────

/**
 * 순위 수집 완료 상태 조회
 * GET /v1/stores/{storeId}/ranking/track/state
 */
export async function getTrackState(
  storeId: number,
): Promise<TrackState> {
  return get<TrackState>(`/v1/stores/${storeId}/ranking/track/state`);
}

// ─── #6 트래킹 삭제 ──────────────────────────────────────────

/**
 * 트래킹 삭제
 * DELETE /v1/stores/{storeId}/ranking/track/{trackInfoId}
 */
export async function deleteTrack(
  storeId: number,
  trackInfoId: number,
): Promise<{ deleted: boolean }> {
  return del<{ deleted: boolean }>(
    `/v1/stores/${storeId}/ranking/track/${trackInfoId}`,
  );
}
