/**
 * [역할] 트랙 그리드 뷰 모드 및 열 수 관리
 * [입력] 뷰 모드, 모바일/데스크톱 열 수
 * [출력] 현재 그리드 설정 상태
 * [NOTE] TrackGridView 전용 상태 관리
 */

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { TrackGridState, TrackViewMode } from './types';
import { validateColumns } from '../../utils/validation';

export const useTrackGridStore = create<TrackGridState>()(
  devtools(
    persist(
      (set, get) => ({
        // 상태
        viewMode: 'grid',
        mobileColumns: 2,
        desktopColumns: 5,
        
        // 모드 관리
        setViewMode: (mode: TrackViewMode) => {
          set({ viewMode: mode });
        },
        
        toggleViewMode: () => {
          set((state) => ({ 
            viewMode: state.viewMode === 'grid' ? 'report' : 'grid' 
          }));
        },
        
        // 열 수 관리
        setMobileColumns: (columns: number) => {
          const validColumns = validateColumns(columns, true);
          set({ mobileColumns: validColumns });
        },
        
        setDesktopColumns: (columns: number) => {
          const validColumns = validateColumns(columns, false);
          set({ desktopColumns: validColumns });
        },
        
        // 유틸리티
        getCurrentColumns: (isMobile: boolean) => {
          const { mobileColumns, desktopColumns } = get();
          return isMobile ? mobileColumns : desktopColumns;
        },
        
        getTextSize: (isMobile: boolean, gridColumns?: number) => {
          const columns = gridColumns || get().getCurrentColumns(isMobile);
          return (isMobile || columns >= 6) ? 'text-xs' : 'text-sm';
        },
        
        getValidColumnRange: (isMobile: boolean) => {
          return isMobile ? [1, 2, 3] : [3, 4, 5, 6, 7];
        },
      }),
      {
        name: 'track-grid-store',
      }
    ),
    { name: 'TrackGridStore' }
  )
); 