import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios';
import type { ResDTO } from '@/shared/types';
import { handleApiError, ApiError } from './error-handler';

/**
 * Axios 인스턴스 기본 설정
 *
 * - baseURL: NEXT_PUBLIC_API_URL 환경변수에서 가져옴
 * - timeout: 15초
 * - Content-Type: application/json
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? '',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── 토큰 갱신 상태 관리 (전역 싱글톤) ──────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

/** 대기 중인 요청 처리 */
function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (token) {
      promise.resolve(token);
    } else {
      promise.reject(error);
    }
  });
  failedQueue = [];
}

// ─── 요청 인터셉터 ────────────────────────────────────────────

/**
 * 요청 인터셉터: Authorization 헤더 자동 추가
 *
 * useAuthStore에서 accessToken을 가져와 Bearer 헤더에 주입합니다.
 * 순환 의존성 방지를 위해 동적 import를 사용합니다.
 */
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 토큰 갱신 요청에는 기존 토큰을 추가하지 않음
    if (config.url?.includes('/v1/auth/refresh')) {
      return config;
    }

    try {
      // 순환 의존성 방지: 동적 import
      const { useAuthStore } = await import('@/entities/auth/model/useAuthStore');
      const token = useAuthStore.getState().accessToken;
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // 스토어 로딩 실패 시 토큰 없이 진행
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ─── 응답 인터셉터 ────────────────────────────────────────────

/**
 * 응답 인터셉터: ResDTO<T> 래퍼 처리 + 401 토큰 갱신
 *
 * 성공 응답: ResDTO<T>의 data 필드를 추출하여 반환
 * 401 응답: 리프레시 토큰으로 갱신 → 성공 시 원래 요청 재시도 → 실패 시 로그아웃
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
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 401 에러이고, 이미 재시도하지 않았으며, 인증 관련 API가 아닌 경우
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/v1/auth/')
    ) {
      // 이미 토큰 갱신 중이면 큐에 추가하고 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // 순환 의존성 방지: 동적 import
        const { useAuthStore } = await import('@/entities/auth/model/useAuthStore');
        const success = await useAuthStore.getState().refreshTokens();

        if (success) {
          const newToken = useAuthStore.getState().accessToken;
          if (newToken && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          return apiClient(originalRequest);
        } else {
          // 갱신 실패 → 로그아웃
          processQueue(error, null);
          await useAuthStore.getState().logout();
          // 브라우저 환경에서 로그인 페이지로 리다이렉트
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(handleApiError(error));
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(handleApiError(refreshError));
      } finally {
        isRefreshing = false;
      }
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
