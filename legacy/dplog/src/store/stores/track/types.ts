/**
 * [역할] 트랙 그리드 관련 타입 정의
 * [입력] -
 * [출력] 트랙 그리드 타입 정의
 */

export type TrackViewMode = "grid" | "report";

export interface TrackGridState {
  // 모드 상태
  viewMode: TrackViewMode;
  
  // 열 수 상태
  mobileColumns: number;
  desktopColumns: number;
  
  // 액션
  setViewMode: (mode: TrackViewMode) => void;
  toggleViewMode: () => void;
  setMobileColumns: (columns: number) => void;
  setDesktopColumns: (columns: number) => void;
  
  // 유틸리티
  getCurrentColumns: (isMobile: boolean) => number;
  getTextSize: (isMobile: boolean, gridColumns?: number) => string;
  getValidColumnRange: (isMobile: boolean) => number[];
} 