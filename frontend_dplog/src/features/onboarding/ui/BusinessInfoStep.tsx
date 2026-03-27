'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Store, MapPin, Tag, Link2, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useStoreForm } from '@/entities/store/model/useStoreForm';
import { useOnboardingStore } from '@/features/onboarding/store/useOnboardingStore';
import { STORE_CATEGORIES } from '@/entities/store/model/types';

export const BusinessInfoStep = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setStoreId } = useOnboardingStore();
  const {
    form,
    errors,
    isLoading,
    apiError,
    updateField,
    submitCreate,
  } = useStoreForm();

  const handleNext = async () => {
    // 실제 백엔드 API 호출
    const store = await submitCreate();
    if (store) {
      // 생성된 storeId를 온보딩 스토어에 저장 (키워드 스텝에서 사용)
      setStoreId(store.id);
      const params = new URLSearchParams(searchParams.toString());
      params.set('store_id', String(store.id));
      params.set('store_name', store.name);
      router.push(`/complete?${params.toString()}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
          매장 정보를 등록해주세요
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-lg mx-auto">
          운영 중인 매장의 정보를 입력해주세요.<br/>
          빅데이터를 기반으로 매장의 매출 잠재력을 분석해 드립니다.
        </p>
      </div>

      <div className="w-full max-w-md space-y-4 mb-8">
        {/* 가게명 */}
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">가게명 *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Store className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="예) 디플로그 강남점"
              className={cn(
                "w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-800 text-base focus:ring-4 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400",
                errors.name
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
              )}
            />
          </div>
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        {/* 카테고리 */}
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">카테고리 *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Tag className="w-5 h-5" />
            </div>
            <select
              value={form.category}
              onChange={(e) => updateField('category', e.target.value)}
              className={cn(
                "w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-800 text-base focus:ring-4 transition-all outline-none text-slate-900 dark:text-white appearance-none",
                !form.category && "text-slate-400",
                errors.category
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
              )}
            >
              <option value="">카테고리 선택</option>
              {STORE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
        </div>

        {/* 주소 */}
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">주소 *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="예) 서울 강남구 테헤란로 123"
              className={cn(
                "w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-800 text-base focus:ring-4 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400",
                errors.address
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
              )}
            />
          </div>
          {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
        </div>

        {/* 플레이스 URL */}
        <div className="space-y-1">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">네이버 플레이스 URL *</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <Link2 className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={form.placeUrl}
              onChange={(e) => updateField('placeUrl', e.target.value)}
              placeholder="예) https://map.naver.com/p/entry/place/12345678"
              className={cn(
                "w-full pl-12 pr-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-800 text-base focus:ring-4 transition-all outline-none text-slate-900 dark:text-white placeholder:text-slate-400",
                errors.placeUrl
                  ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                  : "border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20"
              )}
            />
          </div>
          {errors.placeUrl && <p className="text-sm text-red-500">{errors.placeUrl}</p>}
        </div>

        {/* API 에러 메시지 */}
        {apiError && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{apiError}</p>
          </div>
        )}

        <p className="text-sm text-slate-400 text-center">
          * 사업자 번호 인증은 추후 대시보드에서 진행합니다.
        </p>
      </div>

      <div className="flex justify-between w-full max-w-md border-t border-slate-200 dark:border-slate-800 pt-6">
        <button
          onClick={handleBack}
          disabled={isLoading}
          className="px-6 py-3 rounded-lg font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          이전
        </button>
        <button
          onClick={handleNext}
          disabled={!form.name.trim() || !form.category.trim() || !form.address.trim() || !form.placeUrl.trim() || isLoading}
          className={cn(
            "flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all",
            (!form.name.trim() || !form.category.trim() || !form.address.trim() || !form.placeUrl.trim() || isLoading)
              ? "bg-slate-300 dark:bg-slate-700 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 hover:scale-105"
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              등록 중...
            </>
          ) : (
            <>
              다음 단계로
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
