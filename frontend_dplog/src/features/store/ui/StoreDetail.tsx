'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  MapPin,
  Phone,
  Link2,
  Calendar,
  Edit3,
  ArrowLeft,
  Key,
  Loader2,
  Users,
  BookOpen,
  Star,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { StoreForm } from './StoreForm';
import * as storeApi from '@/entities/store/api/storeApi';
import type { Store as StoreType } from '@/entities/store/model/types';
import Link from 'next/link';

/**
 * 가게 상세 + 수정 페이지 컴포넌트
 *
 * 조회 모드 / 수정 모드를 토글하여 표시합니다.
 */
interface StoreDetailProps {
  /** 가게 ID */
  storeId: number;
  /** 뒤로가기 콜백 */
  onBack?: () => void;
}

export function StoreDetail({ storeId, onBack }: StoreDetailProps) {
  const [store, setStore] = useState<StoreType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  /** 가게 정보 로드 */
  useEffect(() => {
    const loadStore = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await storeApi.getStore(storeId);
        setStore(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '가게 정보를 불러올 수 없습니다.',
        );
      } finally {
        setIsLoading(false);
      }
    };
    loadStore();
  }, [storeId]);

  /** 수정 성공 시 */
  const handleUpdateSuccess = (updated: StoreType) => {
    setStore(updated);
    setIsEditing(false);
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // 에러 상태
  if (error || !store) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center"
        >
          <p className="text-red-600 dark:text-red-400 mb-4">
            {error ?? '가게를 찾을 수 없습니다.'}
          </p>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              돌아가기
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  // 수정 모드
  if (isEditing) {
    return (
      <StoreForm
        initialData={store}
        onSuccess={handleUpdateSuccess}
        onBack={() => setIsEditing(false)}
      />
    );
  }

  // 조회 모드
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      {/* 헤더 */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="size-4" />
              내 가게 목록
            </button>
          )}
          <h1 className="text-2xl font-black tracking-tight">{store.name}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {store.category}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/stores/detail/keywords?id=${storeId}`}>
            <Button
              variant="outline"
              className="rounded-xl border-slate-200 dark:border-white/10 gap-2"
            >
              <Key className="size-4" />
              키워드 관리
            </Button>
          </Link>
          <Button
            onClick={() => setIsEditing(true)}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-600/20"
          >
            <Edit3 className="size-4" />
            수정
          </Button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 대표 이미지 갤러리 */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="mb-6">
        {(() => {
          const rawUrls = store.shopImageThumbUrl || store.shopImageUrl || '';
          const imageUrls = rawUrls.split(',').map(u => u.trim()).filter(Boolean);
          
          if (imageUrls.length === 0 && store.scrape_status === 'COMPLETED') {
            return (
              <div className="w-full h-56 sm:h-72 rounded-3xl bg-slate-100 dark:bg-slate-800/50 flex flex-col items-center justify-center text-slate-400 shadow-sm border border-slate-200/50 dark:border-white/10">
                <Store className="size-10 mb-3 opacity-40 border" />
                <span className="text-sm font-medium">등록된 이미지가 없습니다</span>
              </div>
            );
          }

          if (imageUrls.length === 1) {
            return (
              <div className="w-full h-56 sm:h-80 overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                <img src={imageUrls[0]} alt="Store 1" className="w-full h-full object-cover" />
              </div>
            );
          }

          if (imageUrls.length === 2) {
            return (
              <div className="grid grid-cols-2 gap-[2px] w-full h-56 sm:h-72 overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                <img src={imageUrls[0]} alt="Store 1" className="w-full h-full object-cover" />
                <img src={imageUrls[1]} alt="Store 2" className="w-full h-full object-cover" />
              </div>
            );
          }

          if (imageUrls.length === 3) {
            return (
              <div className="flex gap-[2px] w-full h-56 sm:h-72 overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                <div className="w-2/3 h-full">
                  <img src={imageUrls[0]} alt="Store 1" className="w-full h-full object-cover" />
                </div>
                <div className="w-1/3 flex flex-col gap-[2px] h-full">
                  <div className="h-1/2 w-full">
                    <img src={imageUrls[1]} alt="Store 2" className="w-full h-full object-cover" />
                  </div>
                  <div className="h-1/2 w-full">
                    <img src={imageUrls[2]} alt="Store 3" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            );
          }

          if (imageUrls.length === 4) {
            return (
              <div className="grid grid-cols-2 gap-[2px] w-full h-56 sm:h-72 overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800">
                <div className="grid grid-rows-2 gap-[2px] h-full">
                  <img src={imageUrls[0]} alt="Store 1" className="w-full h-full object-cover" />
                  <img src={imageUrls[1]} alt="Store 2" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-rows-2 gap-[2px] h-full">
                  <img src={imageUrls[2]} alt="Store 3" className="w-full h-full object-cover" />
                  <img src={imageUrls[3]} alt="Store 4" className="w-full h-full object-cover" />
                </div>
              </div>
            );
          }

          // 5개 이상 (네이버 플레이스 스타일)
          if (imageUrls.length >= 5) {
            return (
              <div className="grid grid-cols-4 grid-rows-2 gap-[2px] w-full h-56 sm:h-80 overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800 cursor-pointer group">
                <div className="col-span-2 row-span-2 h-full">
                  <img src={imageUrls[0]} alt="Store 1" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                </div>
                
                <div className="col-span-1 row-span-1 h-full">
                  <img src={imageUrls[1]} alt="Store 2" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                </div>

                <div className="col-span-1 row-span-1 h-full">
                  <img src={imageUrls[2]} alt="Store 3" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                </div>

                <div className="col-span-1 row-span-1 h-full">
                  <img src={imageUrls[3]} alt="Store 4" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                </div>

                <div className="col-span-1 row-span-1 h-full relative">
                  <img src={imageUrls[4]} alt="Store 5" className="w-full h-full object-cover" />
                  {imageUrls.length > 5 ? (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white backdrop-blur-[2px] transition-colors group-hover:bg-black/50">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 mb-1 opacity-90"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <span className="font-semibold text-lg">+{imageUrls.length - 4}</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                  )}
                </div>
              </div>
            );
          }

          if (store.scrape_status === 'PENDING') {
            return (
            <div className="w-full h-56 sm:h-72 rounded-3xl bg-slate-100/50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-blue-500 shadow-sm border border-blue-500/10">
              <Loader2 className="size-10 mb-3 opacity-60 animate-spin" />
              <span className="text-sm font-medium">네이버 플레이스에서 이미지를 가져오는 중...</span>
            </div>
            );
          }
          
          return null;
        })()}
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 핵심 지표 요약 (메트릭 카드) */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          {store.scrape_status === 'PENDING' && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
              <Loader2 className="size-4 text-blue-500 animate-spin" />
            </div>
          )}
          <div className="size-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
            <Users className="size-4" />
          </div>
          <p className="text-xs text-slate-500 font-medium">방문자 리뷰</p>
          <p className="text-lg font-black mt-0.5">{store.visitor_reviews?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          {store.scrape_status === 'PENDING' && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
               <Loader2 className="size-4 text-blue-500 animate-spin" />
            </div>
          )}
          <div className="size-8 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-2">
            <BookOpen className="size-4" />
          </div>
          <p className="text-xs text-slate-500 font-medium">블로그 리뷰</p>
          <p className="text-lg font-black mt-0.5">{store.blog_reviews?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden">
          {store.scrape_status === 'PENDING' && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center z-10 backdrop-blur-[1px]">
               <Loader2 className="size-4 text-blue-500 animate-spin" />
            </div>
          )}
          <div className="size-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-2">
            <Star className="size-4" />
          </div>
          <p className="text-xs text-slate-500 font-medium">평점</p>
          <p className="text-lg font-black mt-0.5">{store.rating ? store.rating.toFixed(2) : '-'}</p>
        </div>
      </div>

      {/* 정보 카드 */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5 dark:shadow-black/30 space-y-5">
        {/* 주소 */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-orange-500/10 text-orange-500 shrink-0">
            <MapPin className="size-5" />
          </div>
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
              주소
            </p>
            <p className="text-sm font-medium">{store.address}</p>
          </div>
        </div>

        {/* 전화번호 */}
        {store.phone && (
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-teal-500/10 text-teal-500 shrink-0">
              <Phone className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                전화번호
              </p>
              <p className="text-sm font-medium">{store.phone}</p>
            </div>
          </div>
        )}

        {/* 플레이스 URL */}
        {store.placeUrl && (
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-green-500/10 text-green-500 shrink-0">
              <Link2 className="size-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                네이버 플레이스
              </p>
              <a
                href={store.placeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-blue-500 hover:text-blue-600 hover:underline break-all"
              >
                {store.placeUrl}
              </a>
            </div>
          </div>
        )}

        {/* 구분선 */}
        <div className="border-t border-slate-200 dark:border-white/10" />

        {/* 등록/수정일 */}
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-slate-500/10 text-slate-500 shrink-0">
            <Calendar className="size-5" />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                등록일
              </p>
              <p className="font-medium">
                {new Date(store.createdAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-1">
                최근 수정
              </p>
              <p className="font-medium">
                {new Date(store.updatedAt).toLocaleDateString('ko-KR')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 뷰 B 기반: 데이터 분석 패널 (대표키워드 + 리뷰 서브탭/샘플 그리드) */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm mt-8 mb-8 space-y-6">
        
        {/* 대표 키워드 영역 */}
        {store.keywords && (
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-4">
            <span className="text-[13px] font-medium text-slate-500 dark:text-slate-400 min-w-[70px]">
              대표키워드
            </span>
            <div className="flex flex-wrap gap-2 text-sm">
              {store.keywords
                .split(',')
                .map((kw) => kw.trim())
                .filter(Boolean)
                .slice(0, 5)
                .map((keyword, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 rounded-full text-xs break-all"
                  >
                    {keyword}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-200 dark:border-slate-800/80">
          
          {/* 최근 방문자 리뷰 (샘플) */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              최근 방문자 리뷰 (샘플)
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              {store.recent_reviews && store.recent_reviews.length > 0 ? (
                store.recent_reviews.slice(0, 5).map((review) => (
                  <li
                    key={review.id}
                    className="bg-white dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm shadow-slate-200/50 dark:shadow-none transition-all hover:border-blue-200 hover:shadow-md"
                  >
                    <p className="text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 line-clamp-2">
                      "{review.snippet}"
                    </p>
                  </li>
                ))
              ) : (
                <li className="italic">
                  - 추출된 텍스트 리뷰가 없습니다.
                </li>
              )}
            </ul>
          </div>

          {/* 서브탭 분석 (주요 리뷰 키워드) */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              서브탭 분석 (주요 리뷰 키워드)
            </h4>
            <div className="space-y-4">
              {store.review_tags && store.review_tags.length > 0 ? (
                Object.entries(
                  store.review_tags.reduce((acc, tag) => {
                    if (!acc[tag.category]) acc[tag.category] = [];
                    acc[tag.category].push(tag);
                    return acc;
                  }, {} as Record<string, NonNullable<typeof store.review_tags>>)
                ).map(([category, tags]) => (
                  <div key={category}>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">
                      {category}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-xs border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                        >
                          {tag.name}
                          <span className="text-indigo-500 dark:text-indigo-400 ml-1 font-bold">
                            {tag.count}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  - 서브탭 리뷰 키워드가 없습니다.
                </p>
              )}
            </div>
          </div>
          
        </div>
      </div>

    </motion.div>
  );
}
