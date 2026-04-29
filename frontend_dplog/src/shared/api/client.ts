import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios';
import type { ResDTO } from '@/shared/types';
import { handleApiError, ApiError } from './error-handler';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:8080';

/**
 * Axios 인스턴스 기본 설정
 *
 * - baseURL: NEXT_PUBLIC_API_URL 환경변수에서 가져옴
 * - timeout: 300초
 * - Content-Type: application/json
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300_000,
  withCredentials: true,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── 응답 인터셉터 ────────────────────────────────────────────

/**
 * 응답 인터셉터: ResDTO<T> 래퍼 처리
 *
 * 성공 응답: ResDTO<T>의 data 필드를 추출하여 반환
 * 인증은 HttpOnly 세션 쿠키로 처리하므로 Authorization 헤더와 refresh token을 사용하지 않습니다.
 */
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // ResDTO 형태인 경우 data 필드 추출
    const resDto = response.data as ResDTO<unknown>;
    if (resDto && typeof resDto === 'object' && 'success' in resDto) {
      if (!resDto.success && resDto.error) {
        return Promise.reject(
          new ApiError(
            response.status,
            resDto.error.code,
            resDto.error.message,
            resDto.error.details,
          ),
        );
      }
      // 성공 시 data 필드를 response.data로 교체
      response.data = resDto.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const { useAuthStore } = await import('@/entities/auth/model/useAuthStore');
      useAuthStore.getState().clearAuth();
    }

    return Promise.reject(handleApiError(error));
  },
);

// ─── 편의 래퍼 함수 ───────────────────────────────────────────

/**
 * GET 요청 래퍼
 */
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

/**
 * POST 요청 래퍼
 */
export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

/**
 * PUT 요청 래퍼
 */
export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

/**
 * PATCH 요청 래퍼
 */
export async function patch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

/**
 * DELETE 요청 래퍼
 */
export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

export { apiClient };
export default apiClient;
