'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Store, MapPin, Phone, Link2, Tag, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useStoreForm } from '@/entities/store/model/useStoreForm';
import { STORE_CATEGORIES } from '@/entities/store/model/types';
import type { Store as StoreType } from '@/entities/store/model/types';

/**
 * 가게 등록/수정 폼 컴포넌트
 *
 * Deep Tech 디자인 시스템 기반 — 글래스모피즘, 다크모드 대응
 */
interface StoreFormProps {
  /** 수정 모드 시 기존 가게 데이터 */
  initialData?: StoreType;
  /** 제출 완료 콜백 (등록/수정 후 이동 처리) */
  onSuccess?: (store: StoreType) => void;
  /** 뒤로가기 콜백 */
  onBack?: () => void;
}

export function StoreForm({ initialData, onSuccess, onBack }: StoreFormProps) {
  const isEditMode = !!initialData;
  const {
    form,
    errors,
    isLoading,
    apiError,
    updateField,
    submitCreate,
    submitUpdate,
  } = useStoreForm(initialData);

  /** 폼 제출 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = isEditMode
      ? await submitUpdate(initialData!.id)
      : await submitCreate();

    if (result && onSuccess) {
      onSuccess(result);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-2xl mx-auto"
    >
      {/* 헤더 */}
      <div className="mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="size-4" />
            돌아가기
          </button>
        )}
        <h1 className="text-2xl font-black tracking-tight">
          {isEditMode ? '가게 정보 수정' : '새 가게 등록'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {isEditMode
            ? '가게 정보를 수정합니다.'
            : '네이버 플레이스에 등록된 가게 정보를 입력해주세요.'}
        </p>
      </div>

      {/* API 에러 메시지 */}
      {apiError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm"
        >
          {apiError}
        </motion.div>
      )}

      {/* 폼 카드 */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5 dark:shadow-black/30 space-y-6">
          {/* 가게명 */}
          <div className="space-y-2">
            <Label htmlFor="store-name" className="flex items-center gap-2 text-sm font-semibold">
              <Store className="size-4 text-blue-500" />
              가게명 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="store-name"
              placeholder="예: 맛있는 분식집"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-blue-500/30 h-12 rounded-xl"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name}</p>
            )}
          </div>

          {/* 카테고리 */}
          <div className="space-y-2">
            <Label htmlFor="store-category" className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="size-4 text-purple-500" />
              카테고리 <span className="text-red-500">*</span>
            </Label>
            <Select
              value={form.category}
              onValueChange={(value) => updateField('category', value)}
            >
              <SelectTrigger
                id="store-category"
                className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 h-12 rounded-xl"
              >
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {STORE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* 주소 */}
          <div className="space-y-2">
            <Label htmlFor="store-address" className="flex items-center gap-2 text-sm font-semibold">
              <MapPin className="size-4 text-orange-500" />
              주소 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="store-address"
              placeholder="예: 서울시 강남구 역삼동 123-45"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-blue-500/30 h-12 rounded-xl"
            />
            {errors.address && (
              <p className="text-xs text-red-500 mt-1">{errors.address}</p>
            )}
          </div>

          {/* 구분선 */}
          <div className="border-t border-slate-200 dark:border-white/10" />

          {/* 선택 정보 */}
          <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
            선택 정보
          </p>

          {/* 플레이스 URL */}
          <div className="space-y-2">
            <Label htmlFor="store-place-url" className="flex items-center gap-2 text-sm font-semibold">
              <Link2 className="size-4 text-green-500" />
              네이버 플레이스 URL
            </Label>
            <Input
              id="store-place-url"
              placeholder="https://naver.me/..."
              value={form.placeUrl}
              onChange={(e) => updateField('placeUrl', e.target.value)}
              className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-blue-500/30 h-12 rounded-xl"
            />
            {errors.placeUrl && (
              <p className="text-xs text-red-500 mt-1">{errors.placeUrl}</p>
            )}
          </div>

          {/* 전화번호 */}
          <div className="space-y-2">
            <Label htmlFor="store-phone" className="flex items-center gap-2 text-sm font-semibold">
              <Phone className="size-4 text-teal-500" />
              전화번호
            </Label>
            <Input
              id="store-phone"
              placeholder="02-1234-5678"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-blue-500/30 h-12 rounded-xl"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-end gap-3 mt-6">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="px-6 h-12 rounded-xl border-slate-200 dark:border-white/10"
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-blue-600/30 hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                {isEditMode ? '수정 중...' : '등록 중...'}
              </>
            ) : (
              isEditMode ? '수정 완료' : '가게 등록'
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
