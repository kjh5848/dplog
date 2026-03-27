/**
 * [역할] 검색 관련 타입 정의
 * [입력] -
 * [출력] 검색 타입 정의
 */

export interface SearchFilters {
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'date' | 'relevance' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchState {
  searchValue: string;
  recentSearches: string[];
  searchFilters: SearchFilters;
  
  // 액션
  setSearchValue: (value: string) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
} 