import { proxyBackendJson } from "@/src/utils/server/apiProxy";
import { logError, logInfo } from "@/src/utils/logger";
import {
  BackendApiResponse,
  SubscriptionCancelRequest,
  SubscriptionCancelReasonCode,
  SubscriptionCancelResponse,
  SubscriptionCancelUndoResponse,
  SubscriptionDowngradeRequest,
  SubscriptionDowngradeResponse,
  SubscriptionDowngradeCancelResponse,
} from "@/src/types/payment";

interface ServiceSuccess<T> {
  ok: true;
  status: number;
  data: T;
}

interface ServiceFailure {
  ok: false;
  status: number;
  message: string;
}

type CancelResult = ServiceSuccess<SubscriptionCancelResponse> | ServiceFailure;
type DowngradeResult =
  | ServiceSuccess<SubscriptionDowngradeResponse>
  | ServiceFailure;
type DowngradeCancelResult =
  | ServiceSuccess<SubscriptionDowngradeCancelResponse>
  | ServiceFailure;

const CANCEL_REASON_LABELS: Record<SubscriptionCancelReasonCode, string> = {
  PRICE: "가격이 부담돼요",
  USAGE_LOW: "사용 빈도가 낮아요",
  FEATURE_LACK: "원하는 기능이 부족해요",
  BUGS: "오류나 버그가 있어요",
  SUPPORT: "고객 지원이 불편했어요",
  SWITCH: "다른 서비스를 이용하고 있어요",
  ETC: "기타",
};

function isValidReasonCode(
  code: string | undefined
): code is SubscriptionCancelReasonCode {
  return Boolean(code && code in CANCEL_REASON_LABELS);
}

function mapCancelError(status: number, message?: string): string {
  if (message) {
    return message;
  }

  switch (status) {
    case 400:
      return "유효한 해지 사유가 필요합니다.";
    case 401:
    case 403:
      return "로그인 정보가 확인되지 않았습니다. 다시 로그인해주세요.";
    case 404:
      return "이미 해지되었거나 존재하지 않는 구독입니다.";
    case 409:
      return "예약 결제를 먼저 취소한 뒤 다시 시도해주세요.";
    case 429:
      return "잠시 후 다시 시도해주세요.";
    default:
      return "구독 해지 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
}

export class SubscriptionService {
  static async cancel(
    subscriptionId: string,
    request: Request
  ): Promise<CancelResult> {
    if (!subscriptionId) {
      return {
        ok: false,
        status: 400,
      message: "구독 ID가 필요합니다.",
    };
  }

    let body: SubscriptionCancelRequest | null = null;
    let operationId: string | undefined;

    const contentType = request.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const parsed = (await request.json()) as Partial<SubscriptionCancelRequest>;
        if (parsed && typeof parsed === "object") {
          body = {
            reasonCode: parsed.reasonCode as SubscriptionCancelReasonCode,
            reasonDetail: parsed.reasonDetail ?? null,
          };
          if (parsed.operationId && typeof parsed.operationId === "string") {
            operationId = parsed.operationId;
          }
        }
      } catch (error) {
        logError("[SubscriptionService] 해지 요청 본문 파싱 실패", error as Error, {
          subscriptionId,
        });
        return {
          ok: false,
          status: 400,
          message: "유효한 JSON 본문이 필요합니다.",
        };
      }
    }

    if (!body || !isValidReasonCode(body.reasonCode)) {
      return {
        ok: false,
        status: 400,
        message: "필수 해지 사유를 선택해주세요.",
      };
    }

    const sanitizedReasonDetail = body.reasonDetail
      ? String(body.reasonDetail).trim()
      : "";

    if (body.reasonCode === "ETC" && sanitizedReasonDetail.length === 0) {
      return {
        ok: false,
        status: 400,
        message: "기타 사유를 입력해주세요.",
      };
    }

    if (sanitizedReasonDetail.length > 200) {
      return {
        ok: false,
        status: 400,
        message: "사유는 200자 이내로 입력해주세요.",
      };
    }

    const reasonLabel = CANCEL_REASON_LABELS[body.reasonCode];
    const backendPayload: SubscriptionCancelRequest & {
      reason?: string;
    } = {
      reasonCode: body.reasonCode,
      reasonDetail: sanitizedReasonDetail || null,
      reason: sanitizedReasonDetail
        ? `${reasonLabel}: ${sanitizedReasonDetail}`
        : reasonLabel,
      operationId,
    };

    logInfo("[SubscriptionService] 구독 해지 요청", {
      subscriptionId,
      reasonCode: backendPayload.reasonCode,
      reasonLabel,
      hasOperationId: Boolean(operationId),
    });

    const upstream = await proxyBackendJson<
      BackendApiResponse<SubscriptionCancelResponse>
    >(`/v1/payments/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(operationId ? { "Idempotency-Key": operationId } : {}),
      },
      body: JSON.stringify(backendPayload),
      label: "cancel-subscription",
    });

    if (!upstream.ok || !upstream.data) {
      const message =
        (upstream.data as any)?.message ?? mapCancelError(upstream.status);

      logError(
        "[SubscriptionService] 구독 해지 실패",
        new Error(message),
        {
          subscriptionId,
          status: upstream.status,
          response: upstream.text,
        }
      );

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    const payloadBody = upstream.data as BackendApiResponse<SubscriptionCancelResponse>;
    const data =
      (payloadBody?.data as SubscriptionCancelResponse | null) ??
      ((payloadBody as unknown) as SubscriptionCancelResponse | null);

    if (!data || typeof data.subscriptionId !== "string") {
      const message =
        payloadBody?.message ||
        mapCancelError(upstream.status, "구독 해지 응답이 올바르지 않습니다.");

      logError(
        "[SubscriptionService] 구독 해지 응답 비정상",
        new Error(message),
        {
          subscriptionId,
          status: upstream.status,
          payload: payloadBody,
        }
      );

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    logInfo("[SubscriptionService] 구독 해지 성공", {
      subscriptionId: data.subscriptionId,
      status: data.status,
      canceledAt: data.canceledAt,
      effectiveDate: data.effectiveDate,
    });

    return {
      ok: true,
      status: upstream.status || 200,
      data,
    };
  }

  static async undo(
    subscriptionId: string,
    request: Request
  ): Promise<
    ServiceSuccess<SubscriptionCancelUndoResponse> | ServiceFailure
  > {
    if (!subscriptionId) {
      return {
        ok: false,
        status: 400,
        message: "구독 ID가 필요합니다.",
      };
    }

    let operationId: string | undefined;

    const contentType = request.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const parsed = (await request.json()) as { operationId?: string };
        if (parsed?.operationId && typeof parsed.operationId === "string") {
          operationId = parsed.operationId;
        }
      } catch (error) {
        logError("[SubscriptionService] 해지 취소 요청 본문 파싱 실패", error as Error, {
          subscriptionId,
        });
        return {
          ok: false,
          status: 400,
          message: "유효한 JSON 본문이 필요합니다.",
        };
      }
    }

    const upstream = await proxyBackendJson<
      BackendApiResponse<SubscriptionCancelUndoResponse>
    >(
      `/v1/payments/subscriptions/${encodeURIComponent(
        subscriptionId
      )}/cancel/undo`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(operationId ? { "Idempotency-Key": operationId } : {}),
        },
        body: JSON.stringify(
          operationId ? { operationId } : {}
        ),
        label: "undo-cancel-subscription",
      }
    );

    if (!upstream.ok || !upstream.data) {
      const message =
        (upstream.data as any)?.message ?? mapCancelError(upstream.status);

      logError(
        "[SubscriptionService] 구독 해지 예약 취소 실패",
        new Error(message),
        {
          subscriptionId,
          status: upstream.status,
          response: upstream.text,
        }
      );

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    const payloadBody =
      upstream.data as BackendApiResponse<SubscriptionCancelUndoResponse>;
    const data =
      (payloadBody?.data as SubscriptionCancelUndoResponse | null) ??
      ((payloadBody as unknown) as SubscriptionCancelUndoResponse | null);

    if (!data || typeof data.subscriptionId !== "string") {
      const message =
        payloadBody?.message ||
        mapCancelError(
          upstream.status,
          "구독 해지 취소 응답이 올바르지 않습니다."
        );

      logError(
        "[SubscriptionService] 구독 해지 취소 응답 비정상",
        new Error(message),
        { subscriptionId, payload: payloadBody }
      );

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    logInfo("[SubscriptionService] 구독 해지 예약 취소 성공", {
      subscriptionId: data.subscriptionId,
      status: data.status,
    });

    return {
      ok: true,
      status: upstream.status || 200,
      data,
    };
  }
}

function mapDowngradeError(status: number, message?: string): string {
  if (message) {
    return message;
  }

  switch (status) {
    case 400:
      return "하위 요금제로만 변경할 수 있습니다.";
    case 401:
    case 403:
      return "로그인이 필요합니다.";
    case 404:
      return "활성 구독 정보를 찾을 수 없습니다.";
    case 409:
      return "잠시 후 다시 시도해주세요.";
    default:
      return "다운그레이드 처리 중 오류가 발생했습니다.";
  }
}

export class SubscriptionDowngradeService {
  static async schedule(
    subscriptionId: string,
    request: Request
  ): Promise<DowngradeResult> {
    if (!subscriptionId) {
      return { ok: false, status: 400, message: "구독 ID가 필요합니다." };
    }

    let body: SubscriptionDowngradeRequest;
    try {
      body = (await request.json()) as SubscriptionDowngradeRequest;
    } catch (error) {
      logError("[SubscriptionDowngradeService] 본문 파싱 실패", error as Error, {
        subscriptionId,
      });
      return {
        ok: false,
        status: 400,
        message: "유효한 JSON 본문이 필요합니다.",
      };
    }

    if (
      !body ||
      typeof body.targetMembershipLevel !== "number" ||
      Number.isNaN(body.targetMembershipLevel)
    ) {
      return {
        ok: false,
        status: 400,
        message: "다운그레이드할 멤버십 정보가 필요합니다.",
      };
    }

    if (!body.targetBillingCycle) {
      return {
        ok: false,
        status: 400,
        message: "결제 주기를 선택해주세요.",
      };
    }

    const operationId =
      body.operationId && typeof body.operationId === "string"
        ? body.operationId
        : undefined;

    const payload: SubscriptionDowngradeRequest = {
      targetMembershipLevel: Number(body.targetMembershipLevel),
      targetBillingCycle: body.targetBillingCycle,
      reason: body.reason?.trim() ? body.reason.trim() : undefined,
      operationId,
    };

    const upstream = await proxyBackendJson<
      BackendApiResponse<SubscriptionDowngradeResponse>
    >(
      `/v1/payments/subscriptions/${encodeURIComponent(subscriptionId)}/downgrade`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(operationId ? { "Idempotency-Key": operationId } : {}),
        },
        body: JSON.stringify(payload),
        label: "schedule-downgrade",
      }
    );

    if (!upstream.ok || !upstream.data) {
      const message =
        (upstream.data as any)?.message ??
        mapDowngradeError(upstream.status, upstream.text);

      logError(
        "[SubscriptionDowngradeService] 다운그레이드 예약 실패",
        new Error(message),
        { subscriptionId, status: upstream.status, response: upstream.text }
      );

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    const payloadBody =
      upstream.data as BackendApiResponse<SubscriptionDowngradeResponse>;
    const data =
      (payloadBody?.data as SubscriptionDowngradeResponse | null) ??
      ((payloadBody as unknown) as SubscriptionDowngradeResponse | null);

    if (!data || typeof data.subscriptionId !== "string") {
      const message =
        payloadBody?.message ||
        mapDowngradeError(
          upstream.status,
          "다운그레이드 응답이 올바르지 않습니다."
        );

      logError(
        "[SubscriptionDowngradeService] 다운그레이드 응답 비정상",
        new Error(message),
        { subscriptionId, payload: payloadBody }
      );

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    logInfo("[SubscriptionDowngradeService] 다운그레이드 예약 성공", {
      subscriptionId: data.subscriptionId,
      effectiveDate: data.effectiveDate,
      targetMembershipLevel: data.targetMembershipLevel,
    });

    return {
      ok: true,
      status: upstream.status || 200,
      data,
    };
  }

  static async cancel(
    subscriptionId: string,
    request: Request
  ): Promise<DowngradeCancelResult> {
    if (!subscriptionId) {
      return { ok: false, status: 400, message: "구독 ID가 필요합니다." };
    }

    let operationId: string | undefined;

    const contentType = request.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const parsed = (await request.json()) as { operationId?: string };
        if (parsed?.operationId && typeof parsed.operationId === "string") {
          operationId = parsed.operationId;
        }
      } catch (error) {
        logError(
          "[SubscriptionDowngradeService] 다운그레이드 취소 본문 파싱 실패",
          error as Error,
          { subscriptionId }
        );
        return {
          ok: false,
          status: 400,
          message: "유효한 JSON 본문이 필요합니다.",
        };
      }
    }

    const upstream = await proxyBackendJson<
      BackendApiResponse<SubscriptionDowngradeCancelResponse>
    >(
      `/v1/payments/subscriptions/${encodeURIComponent(
        subscriptionId
      )}/downgrade/cancel`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(operationId ? { "Idempotency-Key": operationId } : {}),
        },
        body: JSON.stringify(operationId ? { operationId } : {}),
        label: "cancel-downgrade",
      }
    );

    if (!upstream.ok || !upstream.data) {
      const message =
        (upstream.data as any)?.message ??
        mapDowngradeError(upstream.status, upstream.text);

      logError(
        "[SubscriptionDowngradeService] 다운그레이드 예약 취소 실패",
        new Error(message),
        { subscriptionId, status: upstream.status, response: upstream.text }
      );

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    const payloadBody =
      upstream.data as BackendApiResponse<SubscriptionDowngradeCancelResponse>;
    const data =
      (payloadBody?.data as SubscriptionDowngradeCancelResponse | null) ??
      ((payloadBody as unknown) as SubscriptionDowngradeCancelResponse | null);

    if (!data || typeof data.subscriptionId !== "string") {
      const message =
        payloadBody?.message ||
        mapDowngradeError(
          upstream.status,
          "다운그레이드 취소 응답이 올바르지 않습니다."
        );

      logError(
        "[SubscriptionDowngradeService] 다운그레이드 취소 응답 비정상",
        new Error(message),
        { subscriptionId, payload: payloadBody }
      );

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    logInfo("[SubscriptionDowngradeService] 다운그레이드 예약 취소 성공", {
      subscriptionId: data.subscriptionId,
      status: data.status,
    });

    return {
      ok: true,
      status: upstream.status || 200,
      data,
    };
  }
}
