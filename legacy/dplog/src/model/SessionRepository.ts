import { ApiResponse } from '@/types/api';
import { processApiResponse } from '@/src/utils/api/responseHandler';
import { logInfo } from '@/src/utils/logger';

export interface SessionInfo {
  username: string;
  creationTime: string;
  lastAccessedTime: string;
}

export interface SessionListResponse {
  sessionList: SessionInfo[];
}

class SessionRepository {
  static url = "/v1/auth";
  static apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || "https://api.dplog.kr"; // 기본값 제공

  // 세션 목록 조회
  static async getSessionList(): Promise<ApiResponse<SessionListResponse>> {
    const fullUrl = `${this.apiBaseUrl}${this.url}/session`;
    logInfo('SessionRepository 디버그', {
      apiBaseUrl: this.apiBaseUrl,
      url: this.url,
      fullUrl: fullUrl,
      env: process.env.NEXT_PUBLIC_API_URL
    });
    
    const response = await fetch(fullUrl, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await processApiResponse<SessionListResponse>(response);
    
    // 세션 목록 상세 로깅
    logInfo('SessionRepository - 세션 목록 API 응답', {
      code: result.code,
      message: result.message,
      sessionCount: result.data && 'sessionList' in result.data ? result.data.sessionList?.length || 0 : 0,
      sessions: result.data && 'sessionList' in result.data ? result.data.sessionList || [] : [],
      fullResponse: result
    });

    return result;
  }

  // 세션 삭제
  static async deleteSession(username: string): Promise<ApiResponse<void>> {
    const response = await fetch(
      `${this.apiBaseUrl}${this.url}/session/${encodeURIComponent(username)}`,
      {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return processApiResponse(response);
  }
}

export default SessionRepository;
