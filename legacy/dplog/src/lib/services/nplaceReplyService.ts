import {
  NaverAccountRequest,
  NaverStatusResponse,
  NplaceReplyListResponse,
  ToggleReplyRequest,
  NaverAccountResponse,
} from "@/src/types/nplaceReply";
import { proxyBackendJson } from "@/src/utils/server/apiProxy";
import { BackendJsonResult } from "@/src/utils/server/apiProxy";
import { logError } from "@/src/utils/logger";

interface BackendResDTO<T> {
  code: number | string;
  message?: string;
  data?: T | null;
}

type ServiceSuccess<T> = { ok: true; status: number; data: T | null };
type ServiceError = { ok: false; status: number; message: string; code?: number };
type ServiceResult<T> = ServiceSuccess<T> | ServiceError;

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
    logError("[NplaceReplyService] JSON 파싱 실패", error as Error);
    return null;
  }
}

function validateAccountPayload(payload: NaverAccountRequest | null): payload is NaverAccountRequest {
  const naverId = payload?.userNaver?.naverId;
  const naverPw = payload?.userNaver?.naverPw;

  return Boolean(naverId && naverPw);
}

function validateTogglePayload(payload: ToggleReplyRequest | null): payload is ToggleReplyRequest {
  const placeId = payload?.nplaceReplyInfo?.placeId;
  const active = payload?.nplaceReplyInfo?.active;
  return typeof placeId === "string" && placeId.length > 0 && typeof active === "boolean";
}

export class NplaceReplyService {
  static async getNaverStatus(): Promise<ServiceResult<NaverStatusResponse>> {
    const upstream = await proxyBackendJson<BackendResDTO<NaverStatusResponse>>("/v1/user/naver/status", {
      method: "GET",
      label: "naver-status",
    });

    return mapBackendResponse<NaverStatusResponse>(
      upstream,
      "네이버 계정 상태를 불러오지 못했습니다",
    );
  }

  static async getNaverAccount(): Promise<ServiceResult<NaverAccountResponse>> {
    const upstream = await proxyBackendJson<BackendResDTO<NaverAccountResponse>>("/v1/user/naver", {
      method: "GET",
      label: "naver-account",
    });

    return mapBackendResponse<NaverAccountResponse>(
      upstream,
      "네이버 계정 정보를 불러오지 못했습니다",
    );
  }

  static async createNaverAccount(request: Request): Promise<ServiceResult<null>> {
    const body = await parseJson<NaverAccountRequest>(request);

    if (!body) {
      return {
        ok: false,
        status: 400,
        message: "유효한 JSON 본문이 필요합니다",
      };
    }

    if (!validateAccountPayload(body)) {
      return {
        ok: false,
        status: 400,
        message: "네이버 계정 아이디와 비밀번호를 입력해주세요",
      };
    }

    const upstream = await proxyBackendJson("/v1/user/naver", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      label: "naver-account-create",
    });

    return mapBackendResponse<null>(upstream, "네이버 계정 등록에 실패했습니다");
  }

  static async updateNaverAccount(request: Request): Promise<ServiceResult<null>> {
    const body = await parseJson<NaverAccountRequest>(request);

    if (!body) {
      return {
        ok: false,
        status: 400,
        message: "유효한 JSON 본문이 필요합니다",
      };
    }

    if (!validateAccountPayload(body)) {
      return {
        ok: false,
        status: 400,
        message: "네이버 계정 아이디와 비밀번호를 입력해주세요",
      };
    }

    const upstream = await proxyBackendJson("/v1/user/naver", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      label: "naver-account-update",
    });

    return mapBackendResponse<null>(upstream, "네이버 계정 수정에 실패했습니다");
  }

  static async getReplyList(): Promise<ServiceResult<NplaceReplyListResponse>> {
    const upstream = await proxyBackendJson<BackendResDTO<NplaceReplyListResponse>>("/v1/reply", {
      method: "GET",
      label: "nplace-reply-list",
    });

    return mapBackendResponse<NplaceReplyListResponse>(
      upstream,
      "댓글 제어 정보를 불러오지 못했습니다",
    );
  }

  static async toggleReply(request: Request): Promise<ServiceResult<null>> {
    const body = await parseJson<ToggleReplyRequest>(request);

    if (!body) {
      return {
        ok: false,
        status: 400,
        message: "유효한 JSON 본문이 필요합니다",
      };
    }

    if (!validateTogglePayload(body)) {
      return {
        ok: false,
        status: 400,
        message: "placeId 또는 active 값이 유효하지 않습니다",
      };
    }

    const upstream = await proxyBackendJson("/v1/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      label: "nplace-reply-toggle",
    });

    return mapBackendResponse<null>(upstream, "댓글 제어 요청에 실패했습니다");
  }

  static async deleteReplyInfo(): Promise<ServiceResult<null>> {
    const upstream = await proxyBackendJson("/v1/reply", {
      method: "DELETE",
      label: "nplace-reply-delete",
    });

    return mapBackendResponse<null>(
      upstream,
      "댓글 제어 정보를 삭제하지 못했습니다",
    );
  }
}
