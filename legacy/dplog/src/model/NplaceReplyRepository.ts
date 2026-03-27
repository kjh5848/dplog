import { logError, logInfo } from "@/src/utils/logger";
import {
  NaverAccountPayload,
  NaverAccountRequest,
  NaverAccountResponse,
  NaverStatusResponse,
  NplaceReplyInfo,
  NplaceReplyListResponse,
  ToggleReplyRequest,
} from "@/src/types/nplaceReply";
import { ClientApiResponse } from "@/src/types/payment";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface FetchOptions {
  method?: HttpMethod;
  body?: Record<string, unknown>;
  requireData?: boolean;
  defaultMessage: string;
}

export class NplaceReplyRepository {
  private static readonly BASE_PATH = "/api/nplace";

  private static readonly FETCH_OPTIONS: RequestInit = {
    credentials: "include",
  };

  private static async request<T>(path: string, options: FetchOptions): Promise<T | null> {
    const { method = "GET", body, requireData = true, defaultMessage } = options;

    try {
      const response = await fetch(`${this.BASE_PATH}${path}`, {
        ...this.FETCH_OPTIONS,
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const payload = (await response.json().catch(() => null)) as ClientApiResponse<T> | null;

      if (!payload) {
        logError("NplaceReplyRepository 응답 파싱 실패", new Error("Invalid JSON"), {
          path,
          method,
        });
        throw new Error(defaultMessage);
      }

      if (!response.ok || !payload.success || (requireData && payload.data == null)) {
        const message = payload.error || defaultMessage;
        logError("NplaceReplyRepository API 실패", new Error(message), {
          path,
          method,
          code: payload.code,
        });
        throw new Error(message);
      }

      return (payload.data ?? null) as T | null;
    } catch (error) {
      logError("NplaceReplyRepository 요청 실패", error as Error, {
        path,
        method,
      });
      throw error;
    }
  }

  static async getNaverStatus(): Promise<NaverStatusResponse> {
    const data = await this.request<NaverStatusResponse>("/naver/status", {
      defaultMessage: "네이버 계정 상태를 불러오지 못했습니다",
      requireData: true,
    });

    return data || { exists: false };
  }

  static async getNaverAccount(): Promise<NaverAccountResponse> {
    const data = await this.request<NaverAccountResponse>("/naver", {
      defaultMessage: "네이버 계정 정보를 불러오지 못했습니다",
      requireData: true,
    });

    if (!data) {
      throw new Error("네이버 계정 정보를 찾을 수 없습니다");
    }

    return data;
  }

  static async saveNaverAccount(payload: NaverAccountPayload, mode: "create" | "update"): Promise<void> {
    const method = mode === "create" ? "POST" : "PUT";
    const label = mode === "create" ? "등록" : "수정";

    await this.request<null>("/naver", {
      method,
      requireData: false,
      body: { userNaver: payload } satisfies NaverAccountRequest,
      defaultMessage: `네이버 계정 ${label}에 실패했습니다`,
    });

    logInfo("네이버 계정 저장 완료", { method, naverId: payload.naverId });
  }

  static async getReplyList(): Promise<NplaceReplyInfo[]> {
    const data = await this.request<NplaceReplyListResponse>("/reply", {
      defaultMessage: "댓글 제어 정보를 불러오지 못했습니다",
      requireData: true,
    });

    return data?.nplaceReplyList ?? [];
  }

  static async toggleReply(placeId: string, active: boolean): Promise<void> {
    await this.request<null>("/reply", {
      method: "POST",
      body: {
        nplaceReplyInfo: {
          placeId,
          active,
        },
      } satisfies ToggleReplyRequest,
      requireData: false,
      defaultMessage: "댓글 제어 요청에 실패했습니다",
    });

    logInfo("댓글 상태 변경", { placeId, active });
  }

  static async deleteReplyInfo(): Promise<void> {
    await this.request<null>("/reply", {
      method: "DELETE",
      requireData: false,
      defaultMessage: "댓글 제어 정보를 삭제하지 못했습니다",
    });

    logInfo("댓글 제어 정보 삭제", {});
  }
}

export default NplaceReplyRepository;
