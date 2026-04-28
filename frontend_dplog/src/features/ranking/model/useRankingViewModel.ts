'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import type {
  RealtimeRank,
  TrackInfo,
  TrackChartResponse,
  TrackState,
} from '@/entities/ranking/model/types';
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
  const [realtimeProvince, setRealtimeProvince] = useState('');
  const [realtimeLat, setRealtimeLat] = useState<number | undefined>();
  const [realtimeLon, setRealtimeLon] = useState<number | undefined>();
  const [cachedRealtimeData, setCachedRealtimeData] = useState<RealtimeRank[] | undefined>();

  // 페이지 진입 시 로컬 스토리지의 실시간 조회 캐시 상태 복원
  useEffect(() => {
    if (storeId > 0) {
      const savedKw = localStorage.getItem(`dplog_rt_kw_${storeId}`);
      const savedData = localStorage.getItem(`dplog_rt_data_${storeId}`);
      
      if (savedKw) setRealtimeKeyword(savedKw);
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
    isLoading: isSwrLoadingTrack,
    mutate: mutateTrackData,
  } = useSWR(trackInfoKey, async () => {
    // 실제 API 호출 연동
    const result = await rankingApi.getTrackInfoList(storeId);
    // API 응답 형태가 {"info": [...], "state": {...}} 임
    return result as any; // Type override
  }, { revalidateOnFocus: false });

  // ─── 차트 뷰 모드 ('daily' | 'hourly') ──────────────────────────────
  const [chartInterval, setChartInterval] = useState<'daily' | 'hourly'>('daily');

  const [isRefreshingAll, setIsRefreshingAll] = useState(false);
  const isLoadingTrack = isSwrLoadingTrack || isRefreshingAll;

  const trackInfoList: TrackInfo[] = trackData?.info ?? [];
  const trackState: TrackState | null = trackData?.state ?? null;

  // ─── 쿨다운 계산 (3시간) ──────────────────────────────────────────
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  
  useEffect(() => {
    if (trackInfoList.length === 0) {
      setCooldownRemaining(0);
      return;
    }
    
    let latestTime = 0;
    trackInfoList.forEach((t) => {
      if (t.rawLastTrackedAt) {
        const time = new Date(t.rawLastTrackedAt).getTime();
        if (time > latestTime) latestTime = time;
      }
    });

    if (latestTime === 0) {
      setCooldownRemaining(0);
      return;
    }

    const calcCooldown = () => {
      const now = Date.now();
      const diffMs = now - latestTime;
      const cooldownMs = 3 * 60 * 60 * 1000; // 3시간
      
      // [골든타임 프리패스 로직] (KST 12:00 정오 리셋)
      // 1. 현재와 마지막 갱신시간에 각각 9시간을 더해 KST 기준의 가상 타임스탬프(UTC 컴포넌트 활용)를 생성합니다.
      const nowKst = new Date(now + 9 * 60 * 60 * 1000);
      const latestKst = new Date(latestTime + 9 * 60 * 60 * 1000);
      
      // 2. KST 기준 오늘의 골든타임 (12:00 PM) 계산
      const kstYear = nowKst.getUTCFullYear();
      const kstMonth = nowKst.getUTCMonth();
      const kstDate = nowKst.getUTCDate();
      const goldenKstTimeMs = Date.UTC(kstYear, kstMonth, kstDate, 12, 0, 0, 0);
      
      // 3. 마지막 갱신은 12시 이전이었고, 현재 시간은 12시가 넘었다면 쿨다운 무시
      const bypassCooldown = (latestKst.getTime() < goldenKstTimeMs) && (nowKst.getTime() >= goldenKstTimeMs);

      if (diffMs < cooldownMs && !bypassCooldown) {
        setCooldownRemaining(cooldownMs - diffMs);
      } else {
        setCooldownRemaining(0);
      }
    };

    calcCooldown();
    const timerId = setInterval(calcCooldown, 60000);
    return () => clearInterval(timerId);
  }, [trackInfoList]);

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
      ? `/ranking/track/chart/${storeId}/${trackInfoList.map((t: TrackInfo) => t.id).join(',')}/${chartInterval}`
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
      return await rankingApi.getTrackChart(storeId, trackInfoList.map((t: TrackInfo) => t.id), null, chartInterval);
    },
    { revalidateOnFocus: false }
  );

  // ─── 액션 (수동 호출 및 낙관적 업데이트 대응) ────────────────
  const [isRegistering, setIsRegistering] = useState(false);
  const [refreshingId, setRefreshingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // 낙관적 UI 대기열
  const [pendingKeywords, setPendingKeywords] = useState<{id: number; keyword: string; province: string}[]>([]);


  const registerTrack = useCallback(
    async (keyword: string, province: string) => {
      setIsRegistering(true);
      setActionError(null);
      
      const tempId = -Date.now();
      setPendingKeywords(prev => [...prev, { id: tempId, keyword, province }]);

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
        setPendingKeywords(prev => prev.filter(p => p.id !== tempId));
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

  const editTrack = useCallback(
    async (trackInfoId: number, newKeyword: string, province: string = '서울') => {
      setActionError(null);
      // 낙관적 UI 로딩
      const tempId = -Date.now();
      setPendingKeywords(prev => [...prev, { id: tempId, keyword: newKeyword, province }]);

      try {
        // 1. 기존 삭제
        await rankingApi.deleteTrack(storeId, trackInfoId);
        
        // 2. 신규 등록 (백엔드 구조상 수정이 삭제+등록으로 동작)
        await rankingApi.registerTrack(storeId, newKeyword, province);
        
        // 동기화
        await mutateTrackData();
        return true;
      } catch (err) {
        await mutateTrackData();
        setActionError('수정에 실패했습니다.');
        return false;
      } finally {
        setPendingKeywords(prev => prev.filter(p => p.id !== tempId));
      }
    },
    [storeId, mutateTrackData]
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
         if (province.trim()) {
            localStorage.setItem(`dplog_rt_prov_${storeId}`, province);
         } else {
            localStorage.removeItem(`dplog_rt_prov_${storeId}`);
         }
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
    setIsRefreshingAll(true);
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
    } finally {
      setIsRefreshingAll(false);
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
    chartInterval,
    cooldownRemaining,

    isLoadingRealtime,
    isLoadingTrack,
    isLoadingChart,
    isRegistering,
    refreshingId,
    error,
    isRefreshingAll,
    pendingKeywords,

    actions: {
      fetchRealtime,
      fetchChart,
      registerTrack,
      deleteTrack,
      editTrack,
      refreshTrackItem,
      refreshAll,
      setRealtimeKeyword,
      setRealtimeProvince,
      setRealtimeLat,
      setRealtimeLon,
      setChartInterval,
      clearError: () => setActionError(null),
    },
  };
}
