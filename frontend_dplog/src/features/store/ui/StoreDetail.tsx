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
          <Link href={`/dashboard/stores/${storeId}/keywords`}>
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
    </motion.div>
  );
}
