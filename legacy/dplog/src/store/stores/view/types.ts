/**
 * [역할] 뷰 모드 관련 타입 정의
 * [입력] -
 * [출력] 뷰 모드 타입 정의
 */

import { ViewMode } from '../../types/common';

export interface ViewModeState {
  globalViewMode: ViewMode;
  pageViewModes: Record<string, ViewMode>;
  keywordViewModes: Record<string, Record<string, ViewMode>>; // shopId -> keyword -> viewMode
  
  // 액션
  setGlobalViewMode: (mode: ViewMode) => void;
  setPageViewMode: (page: string, mode: ViewMode) => void;
  setKeywordViewMode: (shopId: string, keyword: string, mode: ViewMode) => void;
  getViewMode: (page?: string) => ViewMode;
  getKeywordViewMode: (shopId: string, keyword: string) => ViewMode;
  resetPageViewMode: (page: string) => void;
  resetKeywordViewMode: (shopId: string, keyword?: string) => void;
} 