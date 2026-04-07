'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link2, ArrowLeft, Loader2, Search, MapPin, Store, Wifi, BatteryMedium } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useStoreForm } from '@/entities/store/model/useStoreForm';
import type { Store as StoreType } from '@/entities/store/model/types';
import axios from 'axios';

interface StoreFormProps {
  initialData?: StoreType;
  onSuccess?: (store: StoreType) => void;
  onBack?: () => void;
}

interface SearchResult {
  id: string;
  name: string;
  category: string;
  address: string;
  thumUrl: string;
  source: string;
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

  // 상호명 검색 관련 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(null);

  const handleSearch = async (queryOverride?: string) => {
    // 마우스 클릭 이벤트 객체가 들어오는 것을 방지하기 위해 타입 체크
    const actualQuery = typeof queryOverride === 'string' ? queryOverride : searchQuery;
    if (!actualQuery.trim()) return;
    setIsSearching(true);
    setSearchResults(null);
    try {
      // 자체 API 라우팅 (next.config.ts rewrites 로 파이썬 8000포트로 감)
      const res = await axios.get(`/api/store/search?query=${encodeURIComponent(actualQuery.trim())}`);
      if (res.data && res.data.status === 'success' && Array.isArray(res.data.results)) {
        setSearchResults(res.data.results as SearchResult[]);
      } else if (res.data && typeof res.data === 'object' && !res.data.status) {
        // Fallback for direct dictionary response
        const resultsArray = Object.values(res.data) as SearchResult[];
        setSearchResults(resultsArray);
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      console.error('검색 실패:', e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectStore = (store: SearchResult) => {
    const url = `https://m.place.naver.com/restaurant/${store.id}`;
    updateField('placeUrl', url);
    setSearchResults(null); // 검색창 닫기
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = isEditMode
      ? await submitUpdate(initialData!.id)
      : await submitCreate();

    if (result && onSuccess) {
      onSuccess(result);
    }
  };

  const isPreviewVisible = !!form.placeUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`mx-auto w-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] max-w-6xl`}
    >
      <div className={`grid gap-8 ${isPreviewVisible && !isEditMode ? 'lg:grid-cols-[1fr_440px]' : 'grid-cols-1'}`}>
        
        {/* 좌측 폼 영역 */}
        <div className="flex flex-col pb-10">
          {/* 헤더 */}
          <div className="mb-8">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="size-4" />
                돌아가기
              </button>
            )}
            <h1 className="text-2xl font-black tracking-tight">
              {isEditMode ? '가게 정보 수정' : '새 가게 검색 및 등록'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              {isEditMode
                ? '가게 정보를 수정합니다.'
                : '가게 상호명을 검색해 간편하게 등록하세요.'}
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

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5 dark:shadow-black/30 space-y-8 flex-1">
              
              {/* 1. 가게 이름 검색 (신규 등록 시에만 노출) */}
              {!isEditMode && (
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-semibold">
                    <Search className="size-4 text-blue-500" />
                    가게 상호명 검색
                  </Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                    네이버 지도에서 찾듯 등록하실 가게의 상호명을 편하게 입력해보세요. <br/><span className="text-slate-400/80 dark:text-slate-500">(상호가 흔한 경우 '강남역 스타벅스' 처럼 지역을 함께 적어주시면 정확합니다)</span>
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="상호명을 입력하세요..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                      className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-blue-500/30 h-12 rounded-xl text-base"
                    />
                    <Button 
                      type="button" 
                      onClick={() => handleSearch()}
                      disabled={isSearching || !searchQuery.trim()}
                      className="h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      {isSearching ? <Loader2 className="size-4 animate-spin" /> : '검색'}
                    </Button>
                  </div>

                  {/* 빠른 검색 프리셋 */}
                  {!searchResults && !isSearching && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['성심당 본점', '교촌치킨 강남역점', '동대문엽기떡볶이 본점', '올리브영 강남타운', '다이소 명동본점'].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => {
                            setSearchQuery(preset);
                            handleSearch(preset);
                          }}
                          className="px-3 py-1.5 text-xs rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 검색 결과 */}
                  <AnimatePresence>
                    {searchResults && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-4"
                      >
                        <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                          {searchResults.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                              검색 결과가 없습니다.
                            </div>
                          ) : (
                            searchResults.map((store) => (
                              <button
                                key={store.id}
                                type="button"
                                onClick={() => handleSelectStore(store)}
                                className="w-full flex items-center p-3 text-left bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition-all group"
                              >
                                {store.thumUrl ? (
                                  <img src={store.thumUrl} alt={store.name} className="size-12 rounded-lg object-cover bg-slate-100 dark:bg-slate-800 shrink-0" />
                                ) : (
                                  <div className="size-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Store className="size-5 text-slate-400" />
                                  </div>
                                )}
                                <div className="ml-4 flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{store.name}</h4>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                      {store.category || '분류 없음'}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-xs text-slate-500 mt-1 truncate">
                                    <MapPin className="size-3 mr-1 shrink-0" />
                                    <span className="truncate">{store.address}</span>
                                  </div>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 2. 플레이스 URL 직접 입력 (폴백) */}
              <div className="space-y-3 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-200 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#f8fafc] dark:bg-[#0f1115] px-3 font-semibold text-[10px] uppercase tracking-wider text-slate-400">명시적 URL 값 확인 (수동 수정 가능)</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label htmlFor="store-place-url" className="flex items-center gap-2 text-sm font-semibold">
                  <Link2 className="size-4 text-green-500" />
                  플레이스 URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="store-place-url"
                  placeholder="위 항목에서 검색해 상점을 선택하시면 자동 채워집니다..."
                  value={form.placeUrl}
                  onChange={(e) => updateField('placeUrl', e.target.value)}
                  className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-blue-500/30 h-12 rounded-xl text-base font-mono text-sm"
                />
                {errors.placeUrl && (
                  <p className="text-sm text-red-500 mt-1 font-medium">{errors.placeUrl}</p>
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
                disabled={isLoading || !form.placeUrl.trim()}
                className="px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 transition-all duration-300 hover:shadow-blue-600/30 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    가게 등록 중...
                  </>
                ) : (
                  isEditMode ? '수정 완료' : '스마트 등록 시작'
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* 우측 프리뷰 영역 (URL이 있을 때만 트랜지션과 함께 노출) */}
        {!isEditMode && (
          <AnimatePresence>
            {isPreviewVisible && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
                className="hidden lg:block relative"
              >
                <div className="fixed top-20 h-[calc(100vh-80px)] w-[440px] z-[10] bg-white shadow-[-10px_0_40px_rgba(0,0,0,0.06)] overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                    <Loader2 className="size-8 animate-spin text-slate-300" />
                  </div>
                  {/* 스크롤바 바깥으로 밀어내기 */}
                  <iframe
                    src={form.placeUrl}
                    className="absolute top-0 left-0 h-full border-none z-10 w-[calc(100%+20px)]"
                    title="Store Preview"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

      </div>
    </motion.div>
  );
}
