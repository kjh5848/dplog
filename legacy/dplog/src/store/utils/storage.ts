/**
 * [역할] localStorage 관련 유틸리티 함수
 * [입력] 키, 값
 * [출력] 저장/로드 결과
 */

import { logError } from '@/src/utils/logger';

export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    logError(`Error reading ${key} from localStorage`, errorObj, { key });
    return defaultValue;
  }
};

export const setStorageItem = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    logError(`Error writing ${key} to localStorage`, errorObj, { key });
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
    logError(`Error removing ${key} from localStorage`, errorObj, { key });
  }
}; 