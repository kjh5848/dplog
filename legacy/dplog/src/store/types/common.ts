/**
 * [역할] 상태관리 공통 타입 정의
 * [입력] -
 * [출력] 공통 타입 정의
 */

export type ViewMode = "grid" | "list" | "report";

export interface BaseState {
  isLoading?: boolean;
  error?: string | null;
}

export interface PersistConfig {
  name: string;
  version?: number;
  migrate?: (persistedState: any, version: number) => any;
}

export interface StoreDevtools {
  name: string;
  enabled?: boolean;
} 