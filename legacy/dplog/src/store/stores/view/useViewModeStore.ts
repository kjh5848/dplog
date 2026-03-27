/**
 * [역할] 전역 및 페이지별 뷰 모드 관리
 * [입력] 뷰 모드 변경 요청
 * [출력] 현재 뷰 모드 상태
 * [NOTE] 키워드별 뷰 모드 관리 기능 추가
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { ViewModeState } from './types';
import { ViewMode } from '../../types/common';

export const useViewModeStore = create<ViewModeState>()(
  devtools(
    persist(
      (set, get) => ({
        // 상태
        globalViewMode: 'grid',
        pageViewModes: {},
        keywordViewModes: {},
        
        // 액션
        setGlobalViewMode: (mode: ViewMode) => {
          set({ globalViewMode: mode });
        },
        
        setPageViewMode: (page: string, mode: ViewMode) => {
          const { pageViewModes } = get();
          set({ 
            pageViewModes: { ...pageViewModes, [page]: mode } 
          });
        },

        setKeywordViewMode: (shopId: string, keyword: string, mode: ViewMode) => {
          const { keywordViewModes } = get();
          const shopKeywords = keywordViewModes[shopId] || {};
          
          set({
            keywordViewModes: {
              ...keywordViewModes,
              [shopId]: {
                ...shopKeywords,
                [keyword]: mode
              }
            }
          });
        },
        
        getViewMode: (page?: string) => {
          const { pageViewModes, globalViewMode } = get();
          return page ? (pageViewModes[page] || globalViewMode) : globalViewMode;
        },

        getKeywordViewMode: (shopId: string, keyword: string) => {
          const { keywordViewModes, globalViewMode } = get();
          return keywordViewModes[shopId]?.[keyword] || globalViewMode;
        },
        
        resetPageViewMode: (page: string) => {
          const { pageViewModes } = get();
          const newPageViewModes = { ...pageViewModes };
          delete newPageViewModes[page];
          set({ pageViewModes: newPageViewModes });
        },

        resetKeywordViewMode: (shopId: string, keyword?: string) => {
          const { keywordViewModes } = get();
          
          if (keyword) {
            // 특정 키워드만 리셋
            const shopKeywords = { ...keywordViewModes[shopId] };
            delete shopKeywords[keyword];
            set({
              keywordViewModes: {
                ...keywordViewModes,
                [shopId]: shopKeywords
              }
            });
          } else {
            // 상점의 모든 키워드 리셋
            const newKeywordViewModes = { ...keywordViewModes };
            delete newKeywordViewModes[shopId];
            set({ keywordViewModes: newKeywordViewModes });
          }
        },
      }),
      {
        name: 'view-mode-store',
      }
    ),
    { name: 'ViewModeStore' }
  )
); 