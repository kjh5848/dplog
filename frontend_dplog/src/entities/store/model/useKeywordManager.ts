'use client';

import { useState, useCallback } from 'react';
import * as keywordApi from '../api/keywordApi';
import type { KeywordSet } from '../model/types';

/**
 * 키워드 관리 ViewModel
 *
 * 키워드 추가/삭제, 유효성 검사, API 호출을 캡슐화합니다.
 */

/** 키워드 유효성 검사 에러 */
interface KeywordError {
  message: string;
}

/** 금지어 목록 */
const PROHIBITED_WORDS = ['성인', '도박', '불법'];

/** 최대 키워드 수 */
const MAX_KEYWORDS = 20;

/** 키워드 최대 길이 */
const MAX_KEYWORD_LENGTH = 30;

export function useKeywordManager(storeId: number) {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<KeywordError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedKeywordSets, setSavedKeywordSets] = useState<KeywordSet[]>([]);

  /** 키워드 유효성 검사 */
  const validateKeyword = useCallback(
    (keyword: string): string | null => {
      const trimmed = keyword.trim();

      if (!trimmed) return '키워드를 입력해주세요.';
      if (trimmed.length > MAX_KEYWORD_LENGTH)
        return `키워드는 ${MAX_KEYWORD_LENGTH}자 이내여야 합니다.`;
      if (keywords.includes(trimmed)) return '이미 추가된 키워드입니다.';
      if (keywords.length >= MAX_KEYWORDS)
        return `키워드는 최대 ${MAX_KEYWORDS}개까지 추가할 수 있습니다.`;
      if (PROHIBITED_WORDS.some((word) => trimmed.includes(word)))
        return '사용할 수 없는 키워드입니다.';

      return null;
    },
    [keywords],
  );

  /** 키워드 추가 */
  const addKeyword = useCallback(
    (keyword?: string) => {
      const target = (keyword ?? inputValue).trim();
      const validationError = validateKeyword(target);

      if (validationError) {
        setError({ message: validationError });
        return false;
      }

      setKeywords((prev) => [...prev, target]);
      setInputValue('');
      setError(null);
      return true;
    },
    [inputValue, validateKeyword],
  );

  /** 키워드 삭제 */
  const removeKeyword = useCallback((index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  }, []);

  /** 키워드 세트 저장 (API 호출) */
  const saveKeywords = useCallback(async (): Promise<boolean> => {
    if (keywords.length === 0) {
      setError({ message: '하나 이상의 키워드를 추가해주세요.' });
      return false;
    }

    setIsSaving(true);
    setError(null);

    try {
      const keywordSet = await keywordApi.createKeywordSet(storeId, {
        keywords: keywords,
      });
      setSavedKeywordSets((prev) => [...prev, keywordSet]);
      setKeywords([]);
      return true;
    } catch (err) {
      setError({
        message:
          err instanceof Error
            ? err.message
            : '키워드 저장에 실패했습니다.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [keywords, storeId]);

  /** 저장된 키워드 세트 불러오기 */
  const loadKeywordSets = useCallback(async () => {
    setIsLoading(true);
    try {
      const sets = await keywordApi.getKeywordSets(storeId);
      setSavedKeywordSets(sets);
    } catch {
      // 조회 실패 시 빈 목록 유지
    } finally {
      setIsLoading(false);
    }
  }, [storeId]);

  /** 키워드를 쉼표 구분 문자열에서 배열로 파싱 */
  const parseKeywordsFromString = useCallback((str: string): string[] => {
    return str
      .split(',')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  }, []);

  return {
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
  };
}
