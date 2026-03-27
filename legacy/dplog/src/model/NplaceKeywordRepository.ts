import { logError } from "@/src/utils/logger";
import { ClientApiResponse } from "@/src/types/payment";
import { KeywordToolListResponse, NplaceKeywordRequestBody } from "@/src/types/nplaceKeyword";

type HttpMethod = "GET" | "POST";

interface FetchOptions {
  method?: HttpMethod;
  body?: Record<string, unknown>;
  requireData?: boolean;
  defaultMessage: string;
}

export class NplaceKeywordRepository {
  private static readonly BASE_PATH = "/api/nplace/keyword";

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
        logError("NplaceKeywordRepository 응답 파싱 실패", new Error("Invalid JSON"), {
          path,
          method,
        });
        throw new Error(defaultMessage);
      }

      if (!response.ok || !payload.success || (requireData && payload.data == null)) {
        const message = payload.error || defaultMessage;
        logError("NplaceKeywordRepository API 실패", new Error(message), {
          path,
          method,
          code: payload.code,
        });
        throw new Error(message);
      }

      return (payload.data ?? null) as T | null;
    } catch (error) {
      logError("NplaceKeywordRepository 요청 실패", error as Error, {
        path,
        method,
      });
      throw error;
    }
  }

  static async fetchKeywordList(keywords: string[]): Promise<KeywordToolListResponse> {
    const keywordString = keywords.join("\n");

    const data = await this.request<KeywordToolListResponse>("", {
      method: "POST",
      body: {
        nplaceKeywordNsearchadKeywordstoolKeyword: {
          keywordString,
        },
      } satisfies NplaceKeywordRequestBody,
      defaultMessage: "키워드 정보를 불러오지 못했습니다",
    });

    return data || { keywordToolList: [] };
  }

  static async fetchRelationList(keywords: string[]): Promise<KeywordToolListResponse> {
    const searchParams = new URLSearchParams();
    keywords.forEach((kw) => searchParams.append("keywordList", kw));
    searchParams.set("requestType", "RELATION");

    const query = searchParams.toString();

    const data = await this.request<KeywordToolListResponse>(`/relation?${query}`, {
      method: "GET",
      requireData: true,
      defaultMessage: "연관 키워드 정보를 불러오지 못했습니다",
    });

    return data || { keywordToolList: [] };
  }
}

export default NplaceKeywordRepository;
