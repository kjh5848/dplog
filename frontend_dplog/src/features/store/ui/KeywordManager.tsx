'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ArrowLeft, Loader2, Tag, Save, Hash } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { useKeywordManager } from '@/entities/store/model/useKeywordManager';

/**
 * 키워드 관리 컴포넌트
 *
 * 키워드 태그 입력, 저장, 히스토리 표시를 제공합니다.
 */
interface KeywordManagerProps {
  /** 가게 ID */
  storeId: number;
  /** 가게명 (헤더 표시용) */
  storeName?: string;
  /** 뒤로가기 콜백 */
  onBack?: () => void;
}

export function KeywordManager({
  storeId,
  storeName,
  onBack,
}: KeywordManagerProps) {
  const {
    keywords,
    inputValue,
    error,
    isLoading,
    isSaving,
    savedKeywordSets,
    setInputValue,
    addKeyword,
    removeKeyword,
    saveKeywords,
    loadKeywordSets,
    parseKeywordsFromString,
  } = useKeywordManager(storeId);

  /** 초기 데이터 로드 */
  useEffect(() => {
    loadKeywordSets();
  }, [loadKeywordSets]);

  /** 엔터/쉼표로 키워드 추가 */
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    }
  };

  /** 키워드 세트 저장 성공 처리 */
  const handleSave = async () => {
    const success = await saveKeywords();
    if (success) {
      // 저장 성공 시 새 데이터 리로드
      loadKeywordSets();
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
            가게 상세로 돌아가기
          </button>
        )}
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
          <Hash className="size-6 text-blue-500" />
          키워드 관리
        </h1>
        {storeName && (
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {storeName}의 대표/희망 키워드를 등록해주세요.
          </p>
        )}
      </div>

      {/* 키워드 입력 카드 */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 md:p-8 shadow-xl shadow-black/5 dark:shadow-black/30 space-y-6">
        {/* 입력 필드 */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Tag className="size-4 text-purple-500" />
            키워드 추가
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="키워드를 입력하고 Enter 또는 쉼표로 추가"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 focus:ring-blue-500/30 h-12 rounded-xl flex-1"
            />
            <Button
              type="button"
              onClick={() => addKeyword()}
              className="h-12 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="size-5" />
            </Button>
          </div>
          {error && (
            <p className="text-xs text-red-500 mt-1">{error.message}</p>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-500">
            최대 20개, 키워드당 30자 이내
          </p>
        </div>

        {/* 키워드 태그 목록 */}
        {keywords.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
              추가된 키워드 ({keywords.length}개)
            </p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence mode="popLayout">
                {keywords.map((keyword, index) => (
                  <motion.span
                    key={`${keyword}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    layout
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium border border-blue-500/20 dark:border-blue-500/30 group"
                  >
                    {keyword}
                    <button
                      onClick={() => removeKeyword(index)}
                      className="size-4 rounded-full flex items-center justify-center hover:bg-blue-500/20 dark:hover:bg-blue-500/30 transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            {/* 저장 버튼 */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 px-6 h-11 shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    저장 중...
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    키워드 세트 저장
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 저장된 키워드 세트 히스토리 */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32 mt-8">
          <Loader2 className="size-6 animate-spin text-blue-500" />
        </div>
      ) : (
        savedKeywordSets.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Tag className="size-5 text-slate-400" />
              저장된 키워드 세트
            </h2>
            {savedKeywordSets.map((set) => (
              <motion.div
                key={set.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-5 rounded-xl bg-white/40 dark:bg-white/5 border border-slate-200 dark:border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(set.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {set.keywords.map(
                    (keyword, idx) => (
                      <span
                        key={`${keyword}-${idx}`}
                        className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-sm"
                      >
                        {keyword}
                      </span>
                    ),
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </motion.div>
  );
}
