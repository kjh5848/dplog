/**
 * 백엔드 공통 응답 래퍼 (ResDTO<T> 대응)
 *
 * 백엔드 Spring Boot의 ResDTO<T> 응답 형식과 1:1 대응됩니다.
 * 모든 API 응답은 이 형태로 래핑됩니다.
 */
export interface ResDTO<T> {
  /** 요청 성공 여부 */
  success: boolean;
  /** 실제 응답 데이터 */
  data: T;
  /** 에러 정보 (실패 시) */
  error?: ApiErrorResponse;
  /** 서버 응답 시각 */
  timestamp: string;
}

/**
 * API 에러 응답 타입
 *
 * 백엔드의 글로벌 예외 핸들러가 반환하는 에러 응답 형식입니다.
 */
export interface ApiErrorResponse {
  /** 에러 코드 (예: "AUTH_001", "STORE_NOT_FOUND") */
  code: string;
  /** 사용자 친화적 에러 메시지 */
  message: string;
  /** 필드별 상세 에러 (유효성 검사 실패 시) */
  details?: Record<string, string>;
}

/**
 * 페이지네이션 요청 파라미터
 *
 * 목록 API 호출 시 페이지네이션 정보를 전달합니다.
 */
export interface PaginationParams {
  /** 페이지 번호 (0부터 시작) */
  page: number;
  /** 페이지당 아이템 수 */
  size: number;
  /** 정렬 기준 (예: "createdAt,desc") */
  sort?: string;
}

/**
 * 페이지네이션 응답
 *
 * 백엔드의 페이지네이션 응답 형식과 대응됩니다.
 */
export interface PageResponse<T> {
  /** 페이지 내 데이터 목록 */
  content: T[];
  /** 전체 아이템 수 */
  totalElements: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 현재 페이지 번호 */
  page: number;
  /** 페이지당 아이템 수 */
  size: number;
  /** 다음 페이지 존재 여부 */
  hasNext: boolean;
}

/**
 * 비동기 작업 상태 타입
 *
 * 백엔드의 비동기 잡(진단 요청 등) 상태를 나타냅니다.
 */
export type JobStatus = 'IDLE' | 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'PARTIAL';

/**
 * 비동기 작업 응답
 *
 * POST 요청 시 202 Accepted 와 함께 반환되는 Job ID 응답입니다.
 */
export interface JobResponse {
  /** 작업 식별자 */
  jobId: string;
  /** 현재 작업 상태 */
  status: JobStatus;
}
