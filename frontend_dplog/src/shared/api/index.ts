/**
 * 공통 API 모듈 배럴 export
 *
 * 사용 예시:
 * import { get, post, ApiError } from '@/shared/api';
 */
export { apiClient, get, post, put, patch, del } from './client';
export { ApiError, handleApiError, isAuthError } from './error-handler';
