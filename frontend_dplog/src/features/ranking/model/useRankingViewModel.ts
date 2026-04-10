'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import type {
  RealtimeRank,
  TrackInfo,
  TrackChartResponse,
  TrackState,
} from './types';
import * as rankingApi from '../api/rankingApi';
import { mockTrackInfoList, mockTrackState, mockRealtimeRanks, generateMockChartData } from './mockData';

/**
 * 순위 대시보드 통합 ViewModel (SWR 적용됨)
 *
 * 외부 컴포넌트에선 데이터와 로딩, 에러, 돌연변이 액션을 제공받습니다.
 */
export function useRankingViewModel(storeId: number) {
  // ─── 검색 조건 상태 ─────────────────────────────────────────
  const [realtimeKeyword, setRealtimeKeyword] = useState('');
  const [realtimeProvince, setRealtimeProvince] = useState('서울');
  const [realtimeLat, setRealtimeLat] = useState<number | undefined>();
  const [realtimeLon, setRealtimeLon] = useState<number | undefined>();
  const [cachedRealtimeData, setCachedRealtimeData] = useState<RealtimeRank[] | undefined>();

  // 페이지 진입 시 로컬 스토리지의 실시간 조회 캐시 상태 복원
  useEffect(() => {
    if (storeId > 0) {
      const savedKw = localStorage.getItem(`dplog_rt_kw_${storeId}`);
      const savedProv = localStorage.getItem(`dplog_rt_prov_${storeId}`);
      const savedData = localStorage.getItem(`dplog_rt_data_${storeId}`);
      
      if (savedKw) setRealtimeKeyword(savedKw);
      if (savedProv) setRealtimeProvince(savedProv);
      if (savedData) {
        try {
          setCachedRealtimeData(JSON.parse(savedData));
        } catch(e) {
          console.error("캐시 파싱 에러:", e);
        }
      }
    }
  }, [storeId]);


  // ─── SWR 1: 트래킹 정보 목록 & 수집 상태 (병렬 Fetch) ─────────
  const trackInfoKey = storeId > 0 ? `/ranking/track/info/${storeId}` : null;

  const {
    data: trackData,
    error: trackError,
    isLoading: isLoadingTrack,
    mutate: mutateTrackData,
  } = useSWR(trackInfoKey, async () => {
    // 실제 API 호출 연동
    const result = await rankingApi.getTrackInfoList(storeId);
    // API 응답 형태가 {"info": [...], "state": {...}} 임
    return result as any; // Type override
  }, { revalidateOnFocus: false });

  const trackInfoList: TrackInfo[] = trackData?.info ?? [];
  const trackState: TrackState | null = trackData?.state ?? null;

  // ─── SWR 2: 실시간 순위 조회 ──────────────────────────────────
  const realtimeKey =
    storeId > 0 && realtimeKeyword.trim()
      ? `/ranking/realtime/${storeId}?keyword=${encodeURIComponent(realtimeKeyword)}&province=${encodeURIComponent(realtimeProvince)}&lat=${realtimeLat ?? ''}&lon=${realtimeLon ?? ''}`
      : null;

  const {
    data: realtimeRanks = [],
    error: realtimeError,
    isLoading: isLoadingRealtime,
    mutate: mutateRealtime,
  } = useSWR(
    realtimeKey,
    async () => {
      // 실제 API 호출
      return await rankingApi.getRealtime(storeId, realtimeKeyword, realtimeProvince, realtimeLat, realtimeLon);
    },
    { fallbackData: cachedRealtimeData, revalidateOnFocus: false, shouldRetryOnError: false, dedupingInterval: 60000, revalidateIfStale: false, revalidateOnReconnect: false }
  );

  // ─── SWR 3: 차트 조회 (트래킹 목록에 종속) ──────────────────────
  // 트래킹 정보가 로딩 완료되고, 최소 1개 이상 있을 때만 fetch
  const chartKey =
    storeId > 0 && trackInfoList.length > 0
      ? `/ranking/track/chart/${storeId}/${trackInfoList.map((t: TrackInfo) => t.id).join(',')}`
      : null;

  const {
    data: chartData = null,
    error: chartError,
    isLoading: isLoadingChart,
    mutate: mutateChart,
  } = useSWR(
    chartKey,
    async () => {
      // 90일(3개월) 분량의 실제 데이터 리턴
      return await rankingApi.getTrackChart(storeId, trackInfoList.map((t: TrackInfo) => t.id));
    },
    { revalidateOnFocus: false }
  );

  // ─── 액션 (수동 호출 및 낙관적 업데이트 대응) ────────────────
  const [isRegistering, setIsRegistering] = useState(false);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);


  const registerTrack = useCallback(
    async (keyword: string, province: string) => {
      setIsRegistering(true);
      setActionError(null);
      try {
        const result = await rankingApi.registerTrack(storeId, keyword, province);
        // 캐시 즉시 갱신 (리플래시 트리거)
        await mutateTrackData();
        return result;
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : '트래킹 등록에 실패했습니다.',
        );
        return null;
      } finally {
        setIsRegistering(false);
      }
    },
    [storeId, mutateTrackData],
  );

  const deleteTrack = useCallback(
    async (trackInfoId: number) => {
      setActionError(null);

      // 낙관적 UI 업데이트 (Option)
      mutateTrackData(
        (prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            info: prev.info.filter((t: TrackInfo) => t.id !== trackInfoId),
          };
        },
        false // 검증 지연 여부
      );

      try {
        await rankingApi.deleteTrack(storeId, trackInfoId);
        // 서버와 동기화
        await mutateTrackData();
        return true;
      } catch (err) {
        // 실패 시 롤백 (재조회)
        await mutateTrackData();
        setActionError(
          err instanceof Error ? err.message : '트래킹 삭제에 실패했습니다.',
        );
        return false;
      }
    },
    [storeId, mutateTrackData],
  );

  const refreshTrackItem = useCallback(
    async (trackInfoId: number) => {
      setActionError(null);
      setRefreshingId(trackInfoId);
      try {
        await rankingApi.refreshTrack(storeId, trackInfoId);
        await mutateTrackData();
        return true;
      } catch (err) {
        setActionError(
          err instanceof Error ? err.message : '트래킹 수동 갱신에 실패했습니다.',
        );
        return false;
      } finally {
        setRefreshingId(null);
      }
    },
    [storeId, mutateTrackData]
  );

  // 기존 API 호환성 유지를 위한 브릿지 래퍼
  const fetchRealtime = useCallback(
    async (keyword?: string, province?: string, lat?: number, lon?: number) => {
      console.log('fetchRealtime triggered:', { keyword, province, lat, lon });
      if (keyword !== undefined) {
         setRealtimeKeyword(keyword);
         localStorage.setItem(`dplog_rt_kw_${storeId}`, keyword);
      }
      if (province !== undefined) {
         setRealtimeProvince(province);
         localStorage.setItem(`dplog_rt_prov_${storeId}`, province);
      }
      if (lat !== undefined) setRealtimeLat(lat);
      if (lon !== undefined) setRealtimeLon(lon);
      try {
         const result = await mutateRealtime();
         if (result) {
            localStorage.setItem(`dplog_rt_data_${storeId}`, JSON.stringify(result));
         }
      } catch(e) {
         console.error('mutateRealtime error:', e);
      }
    },
    [mutateRealtime, storeId],
  );

  const fetchChart = useCallback(
    async (_trackInfoIds?: number[]) => {
      // SWR이 chartKey를 기반으로 이미 반응성 요청을 다루므로 키 강제 재검증 트리거 역할만 함
      await mutateChart();
    },
    [mutateChart],
  );

  const refreshAll = useCallback(async () => {
    setActionError(null);
    try {
      // 1. 서버에 전체 항목 강제 스크래핑 갱신 요청
      await rankingApi.refreshTrackAll(storeId);
      
      // 2. 갱신 후 최신 DB 데이터로 프론트 상태 동기화
      await Promise.all([
        mutateTrackData(),
        mutateRealtime(),
        mutateChart(),
      ]);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : '전체 수동 갱신에 실패했습니다.',
      );
    }
  }, [storeId, mutateTrackData, mutateRealtime, mutateChart]);

  // 에러 통합
  const error =
    actionError ||
    (trackError ? (trackError instanceof Error ? trackError.message : '트래킹 로드 오류') : null) ||
    (realtimeError ? (realtimeError instanceof Error ? realtimeError.message : '실시간 순위 로드 오류') : null) ||
    (chartError ? (chartError instanceof Error ? chartError.message : '차트 로드 오류') : null);

  return {
    realtimeRanks,
    trackInfoList,
    chartData,
    trackState,
    realtimeKeyword,
    realtimeProvince,

    isLoadingRealtime,
    isLoadingTrack,
    isLoadingChart,
    isRegistering,
    refreshingId,
    error,

    actions: {
      fetchRealtime,
      fetchChart,
      registerTrack,
      deleteTrack,
      refreshTrackItem,
      refreshAll,
      setRealtimeKeyword,
      setRealtimeProvince,
      setRealtimeLat,
      setRealtimeLon,
      clearError: () => setActionError(null),
    },
  };
}
