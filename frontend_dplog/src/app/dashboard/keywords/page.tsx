'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GoldenKeywords } from '@/features/store/ui/GoldenKeywords';
import * as storeApi from '@/entities/store/api/storeApi';
import type { Store } from '@/entities/store/model/types';
import {
  Loader2,
  Store as StoreIcon,
  Sparkles,
  Star,
  BookOpen,
  Users,
  Tag,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

type StationSeed = {
  name: string;
  city: string;
  lat: number;
  lon: number;
  aliases?: string[];
};

const SUBWAY_STATIONS: StationSeed[] = [
  { name: '시청역', city: '부산', lat: 35.17982, lon: 129.07699, aliases: ['부산시청역', '부산 시청', '시청역'] },
  { name: '연산역', city: '부산', lat: 35.18608, lon: 129.08153, aliases: ['부산연산역', '연산역'] },
  { name: '거제역', city: '부산', lat: 35.18858, lon: 129.07391, aliases: ['부산거제역', '거제역'] },
  { name: '양정역', city: '부산', lat: 35.17305, lon: 129.07139, aliases: ['부산양정역', '양정역'] },
  { name: '교대역', city: '부산', lat: 35.19592, lon: 129.08045, aliases: ['부산교대역', '교대역'] },
  { name: '물만골역', city: '부산', lat: 35.17624, lon: 129.08572, aliases: ['물만골역'] },
];

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const radius = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inferStationAliases(store: Store): string[] {
  const aliases = new Set<string>();
  const officialKeywords = (store.keywords || '')
    .split(',')
    .map(k => k.trim())
    .filter(Boolean);

  officialKeywords.forEach(keyword => {
    const stationMatch = keyword.match(/([가-힣A-Za-z0-9]+역)/);
    if (stationMatch?.[1]) {
      const station = stationMatch[1];
      aliases.add(station);
      aliases.add(station.replace(/^부산/, ''));
      aliases.add(station.replace(/역$/, ''));
      aliases.add(station.replace(/^부산/, '').replace(/역$/, ''));
      if (station.startsWith('부산')) {
        aliases.add(station.replace(/^부산/, '부산 '));
        aliases.add(station.replace(/^부산/, '부산 ').replace(/역$/, ''));
      }
    }
  });

  if (store.latitude && store.longitude) {
    SUBWAY_STATIONS
      .map(station => ({
        station,
        distance: haversineMeters(store.latitude!, store.longitude!, station.lat, station.lon),
      }))
      .filter(item => item.distance <= 900)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .forEach(({ station }) => {
        aliases.add(station.name);
        station.aliases?.forEach(alias => aliases.add(alias));
      });
  }

  return Array.from(aliases)
    .map(alias => alias.replace(/\s+/g, ' ').trim())
    .filter(alias => alias.length > 1);
}

// ───────────────────────────────────────────
// 시드 키워드 자동 조합 엔진 (랜덤 추천 풀 생성)
// ───────────────────────────────────────────
function generatePresets(store: Store): string[] {
  // ① 공식 대표 키워드 (DB keywords 컬럼 — 가장 높은 우선순위)
  const officialKeywords = (store.keywords || '')
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 0);

  // ② 주소 파싱 — 지역 토큰 추출 (시/도, 구/군, 동/읍 등)
  const addrTokens = (store.address || '').split(' ').filter(Boolean);
  const si   = addrTokens[0]?.replace(/특별시|광역시|특별자치시|도$/, '').trim() || '';
  const gu   = addrTokens.find(t => t.endsWith('구') || t.endsWith('군')) || '';
  const dong = addrTokens.find(t => t.endsWith('동') || t.endsWith('읍') || t.endsWith('면')) || '';

  // ③ 카테고리 — 가장 하위 카테고리만 추출 및 블랙리스트 정제
  const rawCategory = store.category || '';
  let category = rawCategory.split('>').pop()?.trim() ||
                   rawCategory.split(',')[0]?.trim() || rawCategory;
                   
  const blacklist = ['기타', '배달', '포장', '종합소매업', '소매업', '도매업', '전문대행', '일반음식점', '생활용품', '잡화'];
  if (blacklist.some(b => category.includes(b))) {
    category = '맛집'; // 무의미한 업종일 경우 범용 키워드로 강제 대체
  }

  const categoryAliases = new Set<string>([category]);
  if (category.includes('한식')) {
    categoryAliases.add('한식 맛집');
    categoryAliases.add('밥집');
    categoryAliases.add('점심');
  }
  if (category.includes('카페')) {
    categoryAliases.add('카페');
    categoryAliases.add('디저트');
    categoryAliases.add('데이트 카페');
  }
  if (category === '맛집') {
    categoryAliases.add('식당');
    categoryAliases.add('밥집');
  }

  // ④ 지역 + 업종 조합 패턴 생성
  const combos: string[] = [];
  if (category) {
    const localAreas = [dong, gu, si && gu ? `${si} ${gu}` : '', si].filter(Boolean) as string[];
    const stationAreas = inferStationAliases(store);
    const highIntentAreas = [...stationAreas, dong, gu].filter(Boolean) as string[];

    localAreas.forEach(area => {
      categoryAliases.forEach(term => {
        combos.push(`${area} ${term}`);
      });
    });

    stationAreas.forEach(area => {
      categoryAliases.forEach(term => {
        combos.push(`${area} ${term}`);
      });
      combos.push(`${area} 맛집`);
      combos.push(`${area} 점심`);
      combos.push(`${area} 밥집`);
    });

    // 다양한 사용자 의도 (Intents)
    const intents = [
      '맛집', '추천', '맛집 추천', '핫플', '가볼만한곳',
      '데이트', '데이트 코스', '모임', '회식장소', '점심', '점심추천',
      '가성비', '가성비 좋은', '분위기 좋은',
      '주차가능', '부모님 모시고', '룸식당', '프라이빗',
      '혼밥', '숨은맛집', '웨이팅'
    ];

    intents.forEach(intent => {
      highIntentAreas.forEach(area => {
        combos.push(`${area} ${category} ${intent}`);
      });
    });

    if (dong) {
      combos.push(`${dong} ${category} 잘하는 곳`);
      combos.push(`${dong} ${category} 유명한 곳`);
      combos.push(`${dong} 근처 ${category}`);
    }
  }
  if (si && gu) combos.push(`${si} ${gu} 맛집`);
  combos.push(store.name);

  // ⑤ 공식 키워드를 앞에, 조합 키워드를 뒤에 — 중복 제거
  const seen = new Set<string>();
  const result: string[] = [];
  for (const kw of [...officialKeywords, ...combos]) {
    const compact = kw.replace(/\s+/g, ' ').trim();
    if (compact.length < 2) continue;
    if (!seen.has(compact)) {
      seen.add(compact);
      result.push(compact);
    }
  }

  return result;
}


// ───────────────────────────────────────────
// 상점 메타데이터 통계 카드
// ───────────────────────────────────────────
function MetaStat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-xl px-4 py-3">
      <div className={`size-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-white">{value || '—'}</p>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────
// 메인 페이지
// ───────────────────────────────────────────
export default function GoldenKeywordsPage() {
  const [store, setStore]               = useState<Store | null>(null);
  const [isLoading, setIsLoading]       = useState(true);
  const [presetKeywords, setPresetKeywords] = useState<string[]>([]);

  const [allPresets, setAllPresets] = useState<string[]>([]);
  const [displayedPresets, setDisplayedPresets] = useState<string[]>([]);
  const [keywordVols, setKeywordVols] = useState<Record<string, number>>({});
  const [officialKeywordVols, setOfficialKeywordVols] = useState<Record<string, number>>({});
  const [isFetchingVols, setIsFetchingVols] = useState(false);

  const fetchKeywordVolumes = async (storeId: number, keywords: string[]) => {
    const uniqueKeywords = Array.from(new Set(keywords.map(k => k.trim()).filter(Boolean)));
    if (uniqueKeywords.length === 0) return {};

    const result: Record<string, number> = {};
    const missingKeys: string[] = [];
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    uniqueKeywords.forEach(kw => {
      const cached = localStorage.getItem(`dplog_vol_${kw}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (now - parsed.ts < THIRTY_DAYS) {
            result[kw] = parsed.vol;
            return;
          }
        } catch(e) {}
      }
      missingKeys.push(kw);
    });

    if (missingKeys.length > 0) {
      const res = await fetch(`/v1/stores/${storeId}/keywords/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: missingKeys })
      });

      if (res.ok) {
        const stats = await res.json();
        stats.forEach((item: any) => {
          const vol = item.total_vol;
          result[item.keyword] = vol;
          localStorage.setItem(`dplog_vol_${item.keyword}`, JSON.stringify({ ts: now, vol }));
        });
      }
    }

    return result;
  };

  const refreshPresets = async (source = allPresets, currentStore = store) => {
    if (!source || source.length === 0 || !currentStore) return;
    
    // 현재 화면에 떠있는 키워드를 제외한 새로운 풀(Pool) 생성
    let availablePool = source.filter(k => !displayedPresets.includes(k));
    
    // 만약 뽑을 키워드가 10개 미만으로 남았다면, 풀을 다시 전체로 초기화 (무한 루프 방지)
    if (availablePool.length < 10) {
      availablePool = [...source];
    }
    
    // 품질 우선순위를 유지한 채 다음 10개 후보를 표시합니다.
    const selected = availablePool.slice(0, 10);
    setDisplayedPresets(selected);

    setIsFetchingVols(true);
    try {
      const newVols = await fetchKeywordVolumes(currentStore.id, selected);
      setKeywordVols(prev => ({ ...prev, ...newVols }));
    } catch (e) {
      console.error('검색량 캐싱 및 가져오기 에러:', e);
    } finally {
      setIsFetchingVols(false);
    }
  };

  useEffect(() => {
    storeApi.getMyStores()
      .then(async list => {
        if (list.length > 0) {
          const s = await storeApi.getStore(list[0].id);
          setStore(s);
          const generated = generatePresets(s);
          setAllPresets(generated);
          const officialKeywords = (s.keywords || '').split(',').map(k => k.trim()).filter(Boolean).slice(0, 5);
          fetchKeywordVolumes(s.id, officialKeywords)
            .then(setOfficialKeywordVols)
            .catch(err => console.error('대표 키워드 검색량 조회 실패:', err));
          // 비동기로 호출
          refreshPresets(generated, s);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  /** 프리셋 키워드 토글 선택 (단일 선택으로 제한) */
  const togglePreset = (kw: string) => {
    setPresetKeywords(prev =>
      prev.includes(kw) ? [] : [kw]
    );
  };

  // ── 로딩 ──
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 text-sm">불러오는 중...</p>
      </div>
    );
  }

  // ── 가게 없음 ──
  if (!store) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-sm mx-auto">
        <div className="size-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
          <StoreIcon className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
          등록된 상점이 없습니다
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          황금 키워드를 발굴하려면 먼저 내 상점을 등록해야 합니다.
        </p>
        <Link
          href="/dashboard/stores/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors text-sm"
        >
          내 상점 등록하기
        </Link>
      </div>
    );
  }

  // const presets = store ? generatePresets(store) : [];

  return (
    <div className="space-y-6 w-full">

      {/* ─────────────── 헤더 + 메타데이터 패널 ─────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm"
      >
        {/* 타이틀 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            황금 키워드 발굴
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            상점 메타데이터와 지역·업종 조합으로 최적 시드 키워드를 추천합니다.
          </p>
        </div>

        {store && (
          <>
            {/* ── 상점명 + 위치 정보 ── */}
            <div className="flex flex-wrap items-start gap-4 mb-5">
              <div>
                <p className="text-xs text-slate-400 mb-1">분석 대상 상점</p>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {store.name}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  {store.address || '주소 정보 없음'}
                </span>
                <span className="text-slate-300 dark:text-white/20">·</span>
                <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  {store.category || '카테고리 없음'}
                </span>
              </div>
            </div>

            {/* ── 메타 통계 카드 3개 — 반응형: 작은 화면은 1열, sm 이상 3열 ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <MetaStat
                icon={Star}
                label="평점"
                value={store.rating ? `★ ${store.rating}` : '—'}
                color="bg-yellow-500/10 text-yellow-500"
              />
              <MetaStat
                icon={Users}
                label="방문자 리뷰"
                value={store.visitor_reviews?.toLocaleString() ?? '—'}
                color="bg-blue-500/10 text-blue-500"
              />
              <MetaStat
                icon={BookOpen}
                label="블로그 리뷰"
                value={store.blog_reviews?.toLocaleString() ?? '—'}
                color="bg-emerald-500/10 text-emerald-500"
              />
            </div>

            {/* ── 대표 키워드 태그 5개 ── */}
            {store.keywords && (
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">대표 키워드</span>
                <div className="flex flex-wrap gap-2">
                  {store.keywords.split(',').map(k => k.trim()).filter(Boolean).slice(0, 5).map((kw, i) => {
                    const vol = officialKeywordVols[kw];
                    const volDisplay = vol !== undefined
                      ? (vol >= 10000 ? `${(vol/10000).toFixed(1).replace('.0','')}만` : vol.toLocaleString())
                      : null;
                    return (
                    <span
                      key={i}
                      className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <span>{kw}</span>
                      {volDisplay && <span className="font-black text-orange-500">({volDisplay})</span>}
                    </span>
                  )})}
                </div>
              </div>
            )}


            {/* ── 추천 시드 키워드 프리셋 (단일 선택) ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    추천 자동완성 키워드 (단일 선택)
                  </h3>
                  <button
                    onClick={() => refreshPresets()}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
                    title="다른 키워드 추천받기"
                  >
                    <RefreshCw className="size-3.5" />
                  </button>
                </div>
                <div className="flex gap-2">
                  {presetKeywords.length > 0 && (
                    <button
                      onClick={() => setPresetKeywords([])}
                      className="text-xs text-slate-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                      선택 해제
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {displayedPresets.map((preset, i) => {
                  const isSelected = presetKeywords.includes(preset);
                  const vol = keywordVols[preset];
                  const isLoadingVol = isFetchingVols && vol === undefined;
                  const volDisplay = vol !== undefined 
                    ? (vol >= 10000 ? `${(vol/10000).toFixed(1).replace('.0','')}만` : vol.toLocaleString())
                    : null;

                  return (
                    <button
                      key={i}
                      onClick={() => togglePreset(preset)}
                      className={`group relative flex items-center gap-1.5 px-3.5 py-1.5 border rounded-xl text-sm font-medium transition-all duration-200 ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200/50'
                          : 'bg-white dark:bg-black border-slate-200 dark:border-zinc-800 hover:border-orange-500 dark:hover:border-orange-500 text-slate-700 dark:text-slate-300 hover:shadow-[0_0_14px_rgba(249,115,22,0.18)] hover:text-orange-600 dark:hover:text-orange-400'
                      }`}
                    >
                      {isSelected && <span>✓</span>}
                      <span>{preset}</span>
                      
                      {/* 검색량 뱃지 -> (검색량) 포맷으로 변경 */}
                      {isLoadingVol ? (
                        <Loader2 className={`w-3 h-3 animate-spin ${isSelected ? 'text-white' : 'text-orange-400'}`} />
                      ) : volDisplay ? (
                        <span className={`text-[11px] font-bold ${isSelected ? 'text-white/80' : 'text-orange-500'}`}>
                          ({volDisplay})
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* ─────────────── 황금 키워드 발굴 모듈 ─────────────── */}
      {store && (
        <GoldenKeywords
          storeId={store.id}
          storeName={store.name}
          presetKeywords={presetKeywords}
        />
      )}
    </div>
  );
}
