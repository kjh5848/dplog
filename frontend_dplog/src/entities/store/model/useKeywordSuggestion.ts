'use client';

import { useState, useCallback, useRef } from 'react';
import type { KeywordSuggestion } from './types';
import * as keywordApi from '../api/keywordApi';

/**
 * 연관 키워드 추천 ViewModel
 *
 * 디바운스 검색, 로딩/에러 상태, 추천 키워드 선택 기능을 캡슐화합니다.
 */

/** 디바운스 지연 시간 (ms) */
const DEBOUNCE_DELAY = 400;

/** 최소 검색어 길이 */
const MIN_QUERY_LENGTH = 2;

export function useKeywordSuggestion() {
  const [suggestions, setSuggestions] = useState<KeywordSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** 추천 키워드 검색 (디바운스 적용) */
  const searchSuggestions = useCallback((keyword: string) => {
    setQuery(keyword);
    setError(null);

    // 이전 디바운스 타이머 취소
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // 최소 길이 미만이면 결과 초기화
    if (keyword.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await keywordApi.suggestKeywords(keyword.trim());
        setSuggestions(response.keywords);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '키워드 추천을 불러오는데 실패했습니다.',
        );
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_DELAY);
  }, []);

  /** 추천 결과 초기화 */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setQuery('');
    setError(null);
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  }, []);

  /** 검색량 합계 계산 (PC + 모바일) */
  const getTotalSearchCount = useCallback((suggestion: KeywordSuggestion): number => {
    const pc = parseInt(suggestion.monthlyPcSearchCount, 10) || 0;
    const mobile = parseInt(suggestion.monthlyMobileSearchCount, 10) || 0;
    return pc + mobile;
  }, []);

  /** 경쟁도 라벨 한글 변환 */
  const getCompetitionLabel = useCallback((index: string): string => {
    const map: Record<string, string> = {
      '높음': '높음',
      '중간': '중간',
      '낮음': '낮음',
      HIGH: '높음',
      MEDIUM: '중간',
      LOW: '낮음',
    };
    return map[index] ?? index;
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    query,
    searchSuggestions,
    clearSuggestions,
    getTotalSearchCount,
    getCompetitionLabel,
  };
}
