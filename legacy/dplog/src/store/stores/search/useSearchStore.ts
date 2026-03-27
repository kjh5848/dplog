/**
 * [역할] 검색 상태 및 최근 검색어 관리
 * [입력] 검색어, 검색 필터
 * [출력] 검색 상태 및 히스토리
 * [NOTE] 기존 useSearchStoreLocal.tsx 확장
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { SearchState, SearchFilters } from './types';

const defaultFilters: SearchFilters = {
  sortBy: 'date',
  sortOrder: 'desc',
};

export const useSearchStore = create<SearchState>()(
  devtools(
    persist(
      (set, get) => ({
        // 상태
        searchValue: '',
        recentSearches: [],
        searchFilters: defaultFilters,
        
        // 액션
        setSearchValue: (value) => {
          set({ searchValue: value });
        },
        
        addRecentSearch: (query) => {
          const trimmedQuery = query.trim();
          if (!trimmedQuery) return;
          
          const { recentSearches } = get();
          const filtered = recentSearches.filter(item => item !== trimmedQuery);
          
          set({ 
            recentSearches: [trimmedQuery, ...filtered].slice(0, 10) 
          });
        },
        
        clearRecentSearches: () => {
          set({ recentSearches: [] });
        },
        
        setSearchFilters: (filters) => {
          const { searchFilters } = get();
          set({ 
            searchFilters: { ...searchFilters, ...filters } 
          });
        },
        
        resetFilters: () => {
          set({ searchFilters: defaultFilters });
        },
      }),
      {
        name: 'search-store',
        partialize: (state) => ({
          recentSearches: state.recentSearches,
          searchFilters: state.searchFilters,
        }),
      }
    ),
    { name: 'SearchStore' }
  )
); 