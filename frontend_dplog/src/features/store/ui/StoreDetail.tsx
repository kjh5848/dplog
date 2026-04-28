'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import {
  Store,
  MapPin,
  Phone,
  Link2,
  Calendar,
  ArrowLeft,
  Key,
  Users,
  BookOpen,
  Star,
  Trash2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import * as storeApi from '@/entities/store/api/storeApi';
import type { Store as StoreType } from '@/entities/store/model/types';
import Link from 'next/link';
import { getCookie, deleteCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
  const [isSyncing, setIsSyncing] = useState(false);
  
  // 삭제(Burn) 모달 관련 상태
  const [isBurnModalOpen, setIsBurnModalOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState('');
  const [isBurning, setIsBurning] = useState(false);
  const [burnError, setBurnError] = useState<string|null>(null);
  
  // 이미지 라이트박스 상태
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);

  const withImageVersion = useCallback((url: string) => {
    if (!store?.updatedAt || !url.startsWith('/static/images/stores/')) {
      return url;
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(store.updatedAt)}`;
  }, [store?.updatedAt]);

  /** 라이트박스 열기 */
  const openLightbox = useCallback((images: string[], index: number) => {
    setLightboxImages(images);
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  /** 키보드 네비게이션 (좌우 화살표, ESC) */
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setLightboxIndex(i => (i > 0 ? i - 1 : lightboxImages.length - 1));
      if (e.key === 'ArrowRight') setLightboxIndex(i => (i < lightboxImages.length - 1 ? i + 1 : 0));
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [lightboxOpen, lightboxImages.length]);
  
  const router = useRouter();

  /** 가게 정보 로드 (최초 1회) */
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

  /** PENDING 상태일 경우 3초마다 자동 폴링 (핫로딩) */
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (store?.scrape_status === 'PENDING') {
      interval = setInterval(async () => {
        try {
          const data = await storeApi.getStore(storeId);
          setStore(data);
          if (data.scrape_status !== 'PENDING') {
            clearInterval(interval);
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [store?.scrape_status, storeId]);

  /** 동기화 처리 */
  const handleSyncData = async () => {
    try {
      setIsSyncing(true);
      const syncedStore = await storeApi.syncStore(storeId);
      setStore(syncedStore);
      // 간단한 피드백 효과 연출 가능
    } catch (err) {
      console.error(err);
      alert('데이터 업데이트에 실패했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  /** 오프라인 라이선스 폭파(Burn) 로직 */
  const handleBurnStore = async () => {
    if (!deleteCode.trim()) return;
    setIsBurning(true);
    setBurnError(null);
    
    try {
      const currentLicense = getCookie('dplog_local_license');
      if (!currentLicense) throw new Error("현재 로그인된 라이선스 정보를 찾을 수 없습니다.");
      
      const res = await axios.post('/v1/auth/burn-license', {
        license_key: currentLicense,
        delete_code: deleteCode.trim()
      });
      
      if (res.data?.status === 'success') {
        // 성공 시 로컬 브라우저 쿠키 영원히 날려버리고 라이선스 화면으로 쫓아냄
        deleteCookie('dplog_local_license');
        router.replace('/license');
      }
    } catch (err: any) {
      setBurnError(err.response?.data?.detail || err.message || "삭제 코드 검증에 실패했습니다.");
    } finally {
      setIsBurning(false);
    }
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

  // 조회 모드
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto"
    >
      {/* 헤더 */}
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
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
        <div className="flex gap-2 flex-wrap">
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
            onClick={handleSyncData}
            disabled={isSyncing}
            className="rounded-xl flex items-center bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-600/20"
          >
            <RefreshCw className={`size-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? '동기화 중...' : '데이터 업데이트'}
          </Button>
          <Button
            onClick={() => setIsBurnModalOpen(true)}
            variant="outline"
            className="rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-900/30 dark:hover:bg-red-900/10 gap-2"
          >
            <Trash2 className="size-4" />
            가게 변경
          </Button>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 2열 그리드 레이아웃 시작 */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      
      {/* ───────────────────────────────────────────────────────── */}
      {/* 가게 폭파 모달 (Burn Modal) */}
      {/* ───────────────────────────────────────────────────────── */}
      {isBurnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-6" />
              </div>
              <h2 className="text-xl font-bold">새로운 가게로 변경하시겠습니까?</h2>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed font-medium">
              다른 가게로 변경하려면 기존 데이터와 라이선스를 완전히 폭파해야 합니다. 사장님(관리자)에게 부여받은 안전한 <strong className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1 rounded">삭제 코드(Delete Code)</strong>를 입력해주세요. <span className="text-red-500 block mt-2">주의: 코드가 일치하면 즉시 현재 접속 권한이 소멸되며 재로그인이 필요합니다.</span>
            </p>

            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500 mb-2 block">삭제 코드 (DEL-...)</Label>
                <Input 
                  value={deleteCode}
                  onChange={(e) => setDeleteCode(e.target.value)}
                  placeholder="DEL-"
                  className="h-12 border-slate-300 text-base"
                  autoFocus
                />
              </div>
              
              {burnError && (
                <p className="text-red-500 text-sm font-semibold">{burnError}</p>
              )}
              
              <div className="flex gap-3 justify-end mt-8">
                <Button variant="outline" onClick={() => setIsBurnModalOpen(false)}>
                  취소
                </Button>
                <Button 
                  onClick={handleBurnStore} 
                  disabled={isBurning || !deleteCode.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white min-w-[120px]"
                >
                  {isBurning ? <Loader2 className="size-4 animate-spin" /> : '폭파 승인'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── */}
      {/* 이미지 라이트박스 모달 */}
      {/* ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxOpen && lightboxImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
            onClick={() => setLightboxOpen(false)}
          >
            {/* 닫기 버튼 */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            {/* 이미지 카운터 */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full bg-white/10 text-white/80 text-sm font-medium backdrop-blur-sm">
              {lightboxIndex + 1} / {lightboxImages.length}
            </div>

            {/* 이전 버튼 */}
            {lightboxImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i > 0 ? i - 1 : lightboxImages.length - 1)); }}
                className="absolute left-3 z-10 size-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronLeft className="size-7" />
              </button>
            )}

            {/* 메인 이미지 */}
            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              src={lightboxImages[lightboxIndex]}
              alt={`Image ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {/* 다음 버튼 */}
            {lightboxImages.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i < lightboxImages.length - 1 ? i + 1 : 0)); }}
                className="absolute right-3 z-10 size-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-all hover:scale-110"
              >
                <ChevronRight className="size-7" />
              </button>
            )}

            {/* 하단 썸네일 스트립 */}
            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-2 py-2 rounded-xl bg-black/40 backdrop-blur-sm">
                {lightboxImages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    className={`shrink-0 size-14 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === lightboxIndex
                        ? 'border-white scale-105 shadow-lg'
                        : 'border-transparent opacity-50 hover:opacity-80'
                    }`}
                  >
                    <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ───────────────────────────────────────────────────────── */}
      {/* 왼쪽 열: 이미지 갤러리 + 메뉴 */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="lg:col-span-3 space-y-5">
      <div>
        {(() => {
          const rawUrls = store.shopImageThumbUrl || store.shopImageUrl || '';
          const imageUrls = rawUrls.split(',').map(u => u.trim()).filter(Boolean).map(withImageVersion);
          
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
              <div onClick={() => openLightbox(imageUrls, 0)} className="w-full h-56 sm:h-80 overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800 cursor-pointer group">
                <img src={imageUrls[0]} alt="Store 1" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            );
          }

          if (imageUrls.length === 2) {
            return (
              <div className="grid grid-cols-2 gap-[2px] w-full h-56 sm:h-72 overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800 cursor-pointer">
                <img onClick={() => openLightbox(imageUrls, 0)} src={imageUrls[0]} alt="Store 1" className="w-full h-full object-cover hover:brightness-90 transition-all" />
                <img onClick={() => openLightbox(imageUrls, 1)} src={imageUrls[1]} alt="Store 2" className="w-full h-full object-cover hover:brightness-90 transition-all" />
              </div>
            );
          }

          if (imageUrls.length === 3) {
            return (
              <div className="flex gap-[2px] w-full h-56 sm:h-72 overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800 cursor-pointer">
                <div className="w-2/3 h-full" onClick={() => openLightbox(imageUrls, 0)}>
                  <img src={imageUrls[0]} alt="Store 1" className="w-full h-full object-cover hover:brightness-90 transition-all" />
                </div>
                <div className="w-1/3 flex flex-col gap-[2px] h-full">
                  <div className="h-1/2 w-full" onClick={() => openLightbox(imageUrls, 1)}>
                    <img src={imageUrls[1]} alt="Store 2" className="w-full h-full object-cover hover:brightness-90 transition-all" />
                  </div>
                  <div className="h-1/2 w-full" onClick={() => openLightbox(imageUrls, 2)}>
                    <img src={imageUrls[2]} alt="Store 3" className="w-full h-full object-cover hover:brightness-90 transition-all" />
                  </div>
                </div>
              </div>
            );
          }

          if (imageUrls.length === 4) {
            return (
              <div className="grid grid-cols-2 gap-[2px] w-full h-56 sm:h-72 overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800 cursor-pointer">
                <div className="grid grid-rows-2 gap-[2px] h-full">
                  <img onClick={() => openLightbox(imageUrls, 0)} src={imageUrls[0]} alt="Store 1" className="w-full h-full object-cover hover:brightness-90 transition-all" />
                  <img onClick={() => openLightbox(imageUrls, 1)} src={imageUrls[1]} alt="Store 2" className="w-full h-full object-cover hover:brightness-90 transition-all" />
                </div>
                <div className="grid grid-rows-2 gap-[2px] h-full">
                  <img onClick={() => openLightbox(imageUrls, 2)} src={imageUrls[2]} alt="Store 3" className="w-full h-full object-cover hover:brightness-90 transition-all" />
                  <img onClick={() => openLightbox(imageUrls, 3)} src={imageUrls[3]} alt="Store 4" className="w-full h-full object-cover hover:brightness-90 transition-all" />
                </div>
              </div>
            );
          }

          if (imageUrls.length >= 5) {
            return (
              <div onClick={() => openLightbox(imageUrls, 0)} className="grid grid-cols-4 grid-rows-2 gap-[2px] w-full h-56 sm:h-80 overflow-hidden rounded-2xl relative shadow-sm border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-800 cursor-pointer group">
                <div className="col-span-2 row-span-2 h-full">
                  <img src={imageUrls[0]} alt="Store 1" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                </div>
                
                <div className="col-span-1 row-span-1 h-full" onClick={(e) => { e.stopPropagation(); openLightbox(imageUrls, 1); }}>
                  <img src={imageUrls[1]} alt="Store 2" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                </div>

                <div className="col-span-1 row-span-1 h-full" onClick={(e) => { e.stopPropagation(); openLightbox(imageUrls, 2); }}>
                  <img src={imageUrls[2]} alt="Store 3" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                </div>

                <div className="col-span-1 row-span-1 h-full" onClick={(e) => { e.stopPropagation(); openLightbox(imageUrls, 3); }}>
                  <img src={imageUrls[3]} alt="Store 4" className="w-full h-full object-cover group-hover:brightness-95 transition-all" />
                </div>

                <div className="col-span-1 row-span-1 h-full relative" onClick={(e) => { e.stopPropagation(); openLightbox(imageUrls, 4); }}>
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

      {/* 상점 메뉴 - 왼쪽 열에 배치 */}
      {store.menus && store.menus.length > 0 && (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍽️</span>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">제공 메뉴 안내</h3>
            </div>
            {store.menus.some(m => m.is_representative) && (
              <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
                ⭐ 대표메뉴 포함
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 대표메뉴를 상단에 정렬 */}
            {[...store.menus]
              .sort((a, b) => (b.is_representative ? 1 : 0) - (a.is_representative ? 1 : 0))
              .map((menu, idx) => (
              <div key={idx} className={`flex gap-3 p-3 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                menu.is_representative 
                  ? 'bg-amber-50/70 dark:bg-amber-500/5 border-2 border-amber-300/60 dark:border-amber-500/20 ring-1 ring-amber-200/30' 
                  : 'bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5'
              }`}>
                {menu.imgUrl && (
                  <div
                    onClick={() => {
                      const sorted = [...(store.menus || [])]
                        .sort((a, b) => (b.is_representative ? 1 : 0) - (a.is_representative ? 1 : 0));
                      const menuImages = sorted.filter(m => m.imgUrl).map(m => m.imgUrl!);
                      const currentIdx = menuImages.indexOf(menu.imgUrl!);
                      openLightbox(menuImages, currentIdx >= 0 ? currentIdx : 0);
                    }}
                    className="size-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0 cursor-pointer group/img"
                  >
                    <img src={menu.imgUrl} alt={menu.name} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-200" />
                  </div>
                )}
                <div className="flex flex-col justify-center flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm">
                      {menu.name}
                    </p>
                    {menu.is_representative && (
                      <span className="shrink-0 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/15 px-1.5 py-0.5 rounded">
                        대표
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {menu.price}
                  </p>
                  {menu.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {menu.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      </div>{/* 왼쪽 열(col-span-3) 끝 */}

      {/* ───────────────────────────────────────────────────────── */}
      {/* 오른쪽 열: 핵심 지표 + 정보 카드 + 관리 */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-5">

      {/* 핵심 지표 요약 (메트릭 카드) - 세로 배치 */}
      <div className="grid grid-cols-3 lg:grid-cols-1 gap-4">
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
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-xl shadow-black/5 dark:shadow-black/30 space-y-4">
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

      </div>{/* 오른쪽 열(col-span-2) 끝 */}
      </div>{/* 2열 그리드 레이아웃 끝 */}

      {/* ───────────────────────────────────────────────────────── */}
      {/* 뷰 B 기반: 데이터 분석 패널 (대표키워드 + 리뷰 서브탭/샘플 그리드) - 하단 전체 폭 */}
      {/* ───────────────────────────────────────────────────────── */}
      <div className="border border-slate-200 dark:border-slate-800/60 rounded-2xl p-6 bg-white dark:bg-slate-900 shadow-sm mt-6 mb-8 space-y-6">
        
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
