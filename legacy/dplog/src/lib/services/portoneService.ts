import { proxyBackendJson } from "@/src/utils/server/apiProxy";
import { logError, logInfo } from "@/src/utils/logger";
import {
  BackendApiResponse,
  BillingKeyCompleteRequest,
  BillingKeyCompleteResponse,
  BillingKeyFailRequest,
  BillingKeyFailResponse,
  ManualBillingKeyIssueRequest,
  ManualBillingKeyIssueResponse,
  BillingReservationRequest,
  BillingReservationResponse,
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

type CompleteResult = ServiceSuccess<BillingKeyCompleteResponse> | ServiceFailure;
type FailResult = ServiceSuccess<BillingKeyFailResponse> | ServiceFailure;
type IssueResult = ServiceSuccess<ManualBillingKeyIssueResponse> | ServiceFailure;
type ReservationResult = ServiceSuccess<BillingReservationResponse> | ServiceFailure;

const PORTONE_API_BASE_URL =
  process.env.PORTONE_API_BASE_URL || "https://api.portone.io";

function getPortoneApiSecret(): string | null {
  return process.env.PORTONE_API_SECRET || null;
}

function maskCardNumber(cardNumber: string): string {
  const trimmed = cardNumber.replace(/\s+/g, "");
  if (trimmed.length < 4) {
    return "****";
  }
  if (trimmed.length < 10) {
    return `${trimmed.slice(0, 2)}****${trimmed.slice(-2)}`;
  }
  return `${trimmed.slice(0, 6)}******${trimmed.slice(-4)}`;
}

export class PortoneService {
  static async issueBillingKeyWithCard(
    body: ManualBillingKeyIssueRequest & { channelKey?: string }
  ): Promise<IssueResult> {
    const secret = getPortoneApiSecret();
    const channelKey =
      body.channelKey ||
      process.env.PORTONE_CHANNEL_KEY ||
      process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

    if (!secret || !channelKey) {
      logError("[PortoneService] 포트원 설정 누락", new Error("Missing config"), {
        hasSecret: !!secret,
        hasChannelKey: !!channelKey,
      });
      return {
        ok: false,
        status: 500,
        message: "포트원 설정이 올바르지 않습니다",
      };
    }

    const customerName = (body.customerName || "").trim();
    const customerEmail = (body.customerEmail || "").trim();
    const customerPhone = (body.customerPhone || "").replace(/\D/g, "");

    const customerPayload: Record<string, any> = {
      id: body.customerId,
      phoneNumber: customerPhone,
    };

    if (customerName) {
      customerPayload.name = { full: customerName };
    }

    if (customerEmail) {
      customerPayload.email = customerEmail;
    }

    const payload = {
      channelKey,
      customer: customerPayload,
      method: {
        card: {
          credential: {
            number: body.cardNumber.replace(/\s+/g, ""),
            expiryMonth: body.expiryMonth,
            expiryYear: body.expiryYear,
            birthOrBusinessRegistrationNumber:
              body.birthOrBusinessRegistrationNumber,
            passwordTwoDigits: body.passwordTwoDigits,
          },
        },
      },
    };

    const maskedCard = maskCardNumber(body.cardNumber);
    logInfo("[PortoneService] 빌링키 수기 발급 요청", {
      customerId: body.customerId,
      customerName,
      customerEmail,
      customerPhone,
      issueId: body.issueId,
      card: maskedCard,
    });

    try {
      const response = await fetch(`${PORTONE_API_BASE_URL}/billing-keys`, {
        method: "POST",
        headers: {
          Authorization: `PortOne ${secret}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data) {
        logError(
          "[PortoneService] 빌링키 수기 발급 실패",
          new Error(data?.message || "Unknown error"),
          { status: response.status, data }
        );
        return {
          ok: false,
          status: response.status || 500,
          message:
            data?.message ||
            "빌링키 발급에 실패했습니다. 잠시 후 다시 시도해주세요.",
        };
      }

      const billingKey =
        data.billingKey ?? data.billingKeyInfo?.billingKey ?? null;

      if (!billingKey) {
        logError(
          "[PortoneService] 빌링키 응답 누락",
          new Error("Missing billingKey in response"),
          { data }
        );
        return {
          ok: false,
          status: response.status || 500,
          message: "빌링키 응답이 올바르지 않습니다",
        };
      }

      const issueId =
        data.issueId ??
        data.issue?.id ??
        data.billingKeyInfo?.issue?.id ??
        body.issueId;

      const customerId =
        data.customer?.id ??
        data.billingKeyInfo?.customer?.id ??
        body.customerId;

      const methodCard =
        data.method?.card ?? data.billingKeyInfo?.method?.card ?? {};

      const sanitized: ManualBillingKeyIssueResponse = {
        billingKey,
        issueId,
        customerId,
        card: {
          bin: methodCard.bin,
          lastFour: methodCard.lastFourDigits ?? methodCard.lastFour,
          issuerName: methodCard.issuer?.name,
        },
        raw: data,
      };

      logInfo("[PortoneService] 빌링키 수기 발급 성공", {
        customerId: sanitized.customerId,
        issueId: sanitized.issueId,
      });

      return {
        ok: true,
        status: response.status || 200,
        data: sanitized,
      };
    } catch (error) {
      logError("[PortoneService] 빌링키 수기 발급 에러", error as Error, {
        customerId: body.customerId,
        issueId: body.issueId,
      });
      return {
        ok: false,
        status: 500,
        message: "빌링키 발급 중 오류가 발생했습니다",
      };
    }
  }

  // static async reserveBillingPayment(
  //   body: BillingReservationRequest
  // ): Promise<ReservationResult> {
  //   const payloadBody = {
  //     issueId: body.issueId,
  //     orderId: body.orderId,
  //     amount: body.amount,
  //     customerId: body.customerId,
  //     scheduleAt: body.scheduleAt,
  //     interval: body.interval,
  //     intervalCount: body.intervalCount,
  //     orderName: body.orderName,
  //     productId: body.productId,
  //   };

  //   const upstream = await proxyBackendJson<
  //     BackendApiResponse<BillingReservationResponse>
  //   >("/v1/payments/subscribe", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify(payloadBody),
  //     label: "payments/subscribe",
  //   });

  //   if (!upstream.ok || !upstream.data) {
  //     logError(
  //       "[PortoneService] 정기결제 예약 실패",
  //       new Error(upstream.text || "Unknown error"),
  //       { status: upstream.status }
  //     );
  //     return {
  //       ok: false,
  //       status: upstream.status || 500,
  //       message: "정기결제 예약에 실패했습니다",
  //     };
  //   }

  //   const payload = upstream.data;

  //   if (payload.code !== 200 || !payload.data) {
  //     logError(
  //       "[PortoneService] 정기결제 예약 비정상 응답",
  //       new Error(payload.message || "Invalid response"),
  //       { status: upstream.status }
  //     );
  //     return {
  //       ok: false,
  //       status: upstream.status || payload.code || 500,
  //       message: payload.message || "정기결제 예약에 실패했습니다",
  //     };
  //   }

  //   logInfo("[PortoneService] 정기결제 예약 성공", {
  //     reservationId: payload.data.reservationId,
  //     scheduleAt: payload.data.scheduleAt,
  //     interval: payload.data.interval,
  //   });

  //   return {
  //     ok: true,
  //     status: upstream.status || 200,
  //     data: payload.data,
  //   };
  // }

  static async completeBillingKey(request: Request): Promise<CompleteResult> {
    let body: BillingKeyCompleteRequest & { billingKey?: string };

    try {
      body = (await request.json()) as BillingKeyCompleteRequest & {
        billingKey?: string;
      };
    } catch (error) {
      logError("[PortoneService] 본문 파싱 실패", error as Error);
      return {
        ok: false,
        status: 400,
        message: "유효한 JSON 본문이 필요합니다",
      };
    }

    if (!body?.paymentId || !body?.issueId || !body?.productId || !body?.billingKey) {
      return {
        ok: false,
        status: 400,
        message: "필수 입력값이 누락되었습니다",
      };
    }

    const upstream = await proxyBackendJson<
      BackendApiResponse<BillingKeyCompleteResponse>
    >("/v1/payments/billing-key/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      label: "payments/billing-key/complete",
    });

    if (!upstream.ok || !upstream.data) {
      logError(
        "[PortoneService] 빌링키 완료 처리 실패",
        new Error(upstream.text || "Unknown error"),
        { status: upstream.status }
      );
      return {
        ok: false,
        status: upstream.status || 500,
        message: "구독 활성화에 실패했습니다",
      };
    }

    const payload = upstream.data;

    if (payload.code !== 200 || !payload.data) {
      logError(
        "[PortoneService] 빌링키 완료 처리 비정상 응답",
        new Error(payload.message || "Invalid response"),
        { status: upstream.status }
      );
      return {
        ok: false,
        status: upstream.status || payload.code || 500,
        message: payload.message || "구독 활성화에 실패했습니다",
      };
    }

    logInfo("[PortoneService] 빌링키 완료 처리 성공", {
      subscriptionId: payload.data.subscriptionId,
      status: payload.data.status,
    });

    return {
      ok: true,
      status: upstream.status || 200,
      data: payload.data,
    };
  }

  static async recordFailure(request: Request): Promise<FailResult> {
    let body: BillingKeyFailRequest;

    try {
      body = (await request.json()) as BillingKeyFailRequest;
    } catch (error) {
      logError("[PortoneService] 실패 기록 본문 파싱 실패", error as Error);
      return {
        ok: false,
        status: 400,
        message: "유효한 JSON 본문이 필요합니다",
      };
    }

    if (
      !body?.paymentId ||
      !body?.issueId ||
      !body?.errorCode ||
      !body?.errorMessage
    ) {
      return {
        ok: false,
        status: 400,
        message: "필수 입력값이 누락되었습니다",
      };
    }

    const upstream = await proxyBackendJson<
      BackendApiResponse<BillingKeyFailResponse>
    >("/v1/payments/billing-key/fail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      label: "payments/billing-key/fail",
    });

    if (!upstream.ok || !upstream.data) {
      logError(
        "[PortoneService] 빌링키 실패 기록 오류",
        new Error(upstream.text || "Unknown error"),
        { status: upstream.status }
      );
      return {
        ok: false,
        status: upstream.status || 500,
        message: "실패 기록 중 오류가 발생했습니다",
      };
    }

    const payload = upstream.data;

    if (payload.code !== 200 || !payload.data) {
      logError(
        "[PortoneService] 빌링키 실패 기록 비정상 응답",
        new Error(payload.message || "Invalid response"),
        { status: upstream.status }
      );
      return {
        ok: false,
        status: upstream.status || payload.code || 500,
        message: payload.message || "실패 기록 중 오류가 발생했습니다",
      };
    }

    logInfo("[PortoneService] 빌링키 실패 기록 완료", {
      retryAvailable: payload.data.retryAvailable,
      remainingRetries: payload.data.remainingRetries,
    });

    return {
      ok: true,
      status: upstream.status || 200,
      data: payload.data,
    };
  }
}

export default PortoneService;
