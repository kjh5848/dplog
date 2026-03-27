import { proxyBackendJson } from "@/src/utils/server/apiProxy";
import { BackendJsonResult } from "@/src/utils/server/apiProxy";
import { logError } from "@/src/utils/logger";
import {
  KeywordRequestType,
  KeywordToolListResponse,
  NplaceKeywordRelationParams,
  NplaceKeywordRequestBody,
} from "@/src/types/nplaceKeyword";

interface BackendResDTO<T> {
  code: number | string;
  message?: string;
  data?: T | null;
}

type ServiceSuccess<T> = { ok: true; status: number; data: T | null };
type ServiceError = { ok: false; status: number; message: string; code?: number };
export type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

function normalizeCode(code: number | string | undefined): number | undefined {
  if (typeof code === "number") return code;
  if (typeof code === "string") {
    const parsed = Number(code);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

function mapBackendResponse<T>(
  upstream: BackendJsonResult<any>,
  fallbackMessage: string,
): ServiceResult<T> {
  const payload = upstream.data as BackendResDTO<T> | null;
  const status = upstream.status || 500;

  if (!payload) {
    return {
      ok: false,
      status,
      message: fallbackMessage,
    };
  }

  const normalizedCode = normalizeCode(payload.code);
  const success = normalizedCode === 0;

  if (!success) {
    return {
      ok: false,
      status,
      code: normalizedCode,
      message: payload.message || fallbackMessage,
    };
  }

  return {
    ok: true,
    status,
    data: (payload.data ?? null) as T | null,
  };
}

async function parseJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch (error) {
    logError("[NplaceKeywordService] JSON 파싱 실패", error as Error);
    return null;
  }
}

function validateKeywordString(body: NplaceKeywordRequestBody | null): body is NplaceKeywordRequestBody {
  const keywordString = body?.nplaceKeywordNsearchadKeywordstoolKeyword?.keywordString;
  return typeof keywordString === "string" && keywordString.trim().length > 0;
}

function validateRelationParams(params: NplaceKeywordRelationParams): { ok: boolean; message?: string } {
  const { keywordList, requestType } = params;

  if (!Array.isArray(keywordList) || keywordList.length === 0) {
    return { ok: false, message: "키워드를 한 개 이상 입력해주세요" };
  }
  if (keywordList.length > 5) {
    return { ok: false, message: "키워드는 최대 5개까지 입력할 수 있습니다" };
  }
  const hasEmpty = keywordList.some((kw) => !kw || kw.trim().length === 0);
  if (hasEmpty) {
    return { ok: false, message: "빈 키워드가 포함되어 있습니다" };
  }
  if (requestType !== "RELATION" && requestType !== "TRACK") {
    return { ok: false, message: "requestType은 RELATION 또는 TRACK이어야 합니다" };
  }
  return { ok: true };
}

export class NplaceKeywordService {
  static async getKeywordList(request: Request): Promise<ServiceResult<KeywordToolListResponse>> {
    const body = await parseJson<NplaceKeywordRequestBody>(request);

    if (!body || !validateKeywordString(body)) {
      return {
        ok: false,
        status: 400,
        message: "유효한 키워드 문자열이 필요합니다",
      };
    }

    const upstream = await proxyBackendJson<BackendResDTO<KeywordToolListResponse>>(
      "/v1/nplace/keyword/nsearchad/keywordstool",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        label: "nplace-keyword-list",
      },
    );

    return mapBackendResponse<KeywordToolListResponse>(upstream, "키워드 정보를 불러오지 못했습니다");
  }

  static async getRelationList(request: Request): Promise<ServiceResult<KeywordToolListResponse>> {
    const { searchParams } = new URL(request.url);
    const keywordList = searchParams.getAll("keywordList").filter(Boolean);
    const requestType = (searchParams.get("requestType") || "RELATION").toUpperCase() as KeywordRequestType;

    const validation = validateRelationParams({ keywordList, requestType });
    if (!validation.ok) {
      return {
        ok: false,
        status: 400,
        message: validation.message || "요청 파라미터가 올바르지 않습니다",
      };
    }

    const query = new URLSearchParams();
    keywordList.forEach((kw) => query.append("keywordList", kw));
    query.set("requestType", requestType);

    const upstream = await proxyBackendJson<BackendResDTO<KeywordToolListResponse>>(
      `/v1/nplace/keyword/nsearchad/keywordstool/relation?${query.toString()}`,
      {
        method: "GET",
        label: "nplace-keyword-relation",
      },
    );

    return mapBackendResponse<KeywordToolListResponse>(upstream, "연관 키워드 정보를 불러오지 못했습니다");
  }

  static async getNblogInfo(request: Request): Promise<ServiceResult<any>> {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");

    if (!keyword || keyword.trim().length === 0) {
      return { ok: false, status: 400, message: "keyword 파라미터가 필요합니다" };
    }

    const upstream = await proxyBackendJson(`/v1/nplace/keyword/nblog/search/info?keyword=${encodeURIComponent(keyword)}`, {
      method: "GET",
      label: "nplace-keyword-nblog",
    });

    return mapBackendResponse<any>(upstream, "블로그 검색 정보를 불러오지 못했습니다");
  }
}
