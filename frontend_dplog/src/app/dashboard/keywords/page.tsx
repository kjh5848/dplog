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
} from 'lucide-react';
import Link from 'next/link';

// ───────────────────────────────────────────
// 시드 키워드 자동 조합 엔진 (~20개 생성)
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

  // ③ 카테고리 — 가장 하위 카테고리만 추출
  const rawCategory = store.category || '';
  const category = rawCategory.split('>').pop()?.trim() ||
                   rawCategory.split(',')[0]?.trim() || rawCategory;

  // ④ 지역 + 업종 조합 패턴 생성
  const combos: string[] = [];
  if (category) {
    if (gu)   combos.push(`${gu} ${category}`);
    if (dong) combos.push(`${dong} ${category}`);
    if (si && gu) combos.push(`${si} ${gu} ${category}`);
    if (si)   combos.push(`${si} ${category}`);

    combos.push(`${category} 맛집`);
    combos.push(`${category} 추천`);
    combos.push(`${category} 맛집 추천`);
    combos.push(`${category} 잘하는 곳`);
    combos.push(`${category} 유명한 곳`);

    if (gu) {
      combos.push(`${gu} ${category} 맛집`);
      combos.push(`${gu} ${category} 추천`);
      combos.push(`${gu} 맛집`);
    }
    if (dong) {
      combos.push(`${dong} ${category} 맛집`);
      combos.push(`${dong} 맛집`);
      combos.push(`${dong} 근처 ${category}`);
    }
    if (si) {
      combos.push(`${si} ${category} 맛집`);
      combos.push(`${si} ${category} 추천`);
    }

    combos.push(category);
  }
  if (si && gu) combos.push(`${si} ${gu} 맛집`);
  combos.push(store.name);

  // ⑤ 공식 키워드를 앞에, 조합 키워드를 뒤에 — 중복 제거
  const seen = new Set<string>();
  const result: string[] = [];
  for (const kw of [...officialKeywords, ...combos]) {
    if (!seen.has(kw)) {
      seen.add(kw);
      result.push(kw);
    }
  }

  return result.slice(0, 22);
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
  const [presetKeyword, setPresetKeyword] = useState<string>('');

  useEffect(() => {
    storeApi.getMyStores()
      .then(list => {
        if (list.length > 0) setStore(list[0]);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

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

  const presets = store ? generatePresets(store) : [];

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
                  {store.keywords.split(',').map(k => k.trim()).filter(Boolean).slice(0, 5).map((kw, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}


            {/* ── 추천 시드 키워드 프리셋 ── */}
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                추천 시드 키워드 — 클릭하면 입력창에 자동 입력됩니다
              </p>
              <div className="flex flex-wrap gap-2">
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => setPresetKeyword(preset)}
                    className="group relative px-3.5 py-1.5 bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 hover:border-orange-500 dark:hover:border-orange-500 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 transition-all duration-200 hover:shadow-[0_0_14px_rgba(249,115,22,0.18)] hover:text-orange-600 dark:hover:text-orange-400"
                  >
                    {preset}
                  </button>
                ))}
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
          presetKeyword={presetKeyword}
        />
      )}
    </div>
  );
}
