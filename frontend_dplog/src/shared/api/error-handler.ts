import { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/shared/types';

/**
 * API 에러 클래스
 *
 * Axios 에러를 표준화된 형식으로 변환합니다.
 * UI 컴포넌트에서 일관된 에러 처리를 위해 사용됩니다.
 */
export class ApiError extends Error {
  /** HTTP 상태 코드 */
  readonly status: number;
  /** 백엔드 에러 코드 */
  readonly code: string;
  /** 필드별 상세 에러 정보 */
  readonly details?: Record<string, string>;

  constructor(status: number, code: string, message: string, details?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** HTTP 상태 코드별 기본 에러 메시지 */
const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  400: '잘못된 요청입니다.',
  401: '인증이 필요합니다. 다시 로그인해 주세요.',
  403: '접근 권한이 없습니다.',
  404: '요청한 리소스를 찾을 수 없습니다.',
  409: '요청이 현재 상태와 충돌합니다.',
  422: '입력 데이터가 올바르지 않습니다.',
  429: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  502: '서버와 통신할 수 없습니다.',
  503: '서비스가 일시적으로 이용 불가합니다.',
};

/**
 * Axios 에러를 ApiError로 변환
 *
 * 백엔드 응답의 에러 정보를 우선 사용하고,
 * 없을 경우 HTTP 상태 코드 기반 기본 메시지를 사용합니다.
 */
export function handleApiError(error: unknown): ApiError {
  // Axios 에러인 경우
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const responseData = error.response?.data as { error?: ApiErrorResponse } | undefined;

    // 백엔드가 에러 응답을 보낸 경우
    if (responseData?.error) {
      const { code, message, details } = responseData.error;
      return new ApiError(status, code, message, details);
    }

    // 네트워크 에러 (서버에 도달하지 못한 경우)
    if (!error.response) {
      return new ApiError(0, 'NETWORK_ERROR', '네트워크 연결을 확인해 주세요.');
    }

    // HTTP 상태 코드 기반 기본 메시지
    const defaultMessage = DEFAULT_ERROR_MESSAGES[status] ?? '알 수 없는 오류가 발생했습니다.';
    return new ApiError(status, `HTTP_${status}`, defaultMessage);
  }

  // ApiError가 이미 있는 경우 그대로 반환
  if (error instanceof ApiError) {
    return error;
  }

  // 예상치 못한 에러
  return new ApiError(0, 'UNKNOWN_ERROR', '알 수 없는 오류가 발생했습니다.');
}

/**
 * 인증 관련 에러 여부 확인
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status === 401;
  }
  return false;
}
