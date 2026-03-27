import { proxyBackendJson } from "@/src/utils/server/apiProxy";
import { logError, logInfo } from "@/src/utils/logger";
import {
  BackendApiResponse,
  PaymentPreRegisterRequest,
  PaymentPreRegisterResponse,
  SubscriptionUpgradeRequest,
  SubscriptionUpgradeResponse,
} from "@/src/types/payment";

export class PaymentService {
  static async preRegister(
    request: Request
  ): Promise<
    | { ok: true; status: number; data: PaymentPreRegisterResponse }
    | { ok: false; status: number; message: string }
  > {
    let body: PaymentPreRegisterRequest;

    try {
      body = (await request.json()) as PaymentPreRegisterRequest;
    } catch (error) {
      logError('[PaymentService] 본문 파싱 실패', error as Error);
      return {
        ok: false,
        status: 400,
        message: '유효한 JSON 본문이 필요합니다',
      };
    }

    if (
      body?.membershipLevel === undefined ||
      body.membershipLevel === null ||
      Number.isNaN(body.membershipLevel)
    ) {
      return {
        ok: false,
        status: 400,
        message: '멤버십 정보가 누락되었습니다',
      };
    }

    if (!body?.paymentMethod) {
      return {
        ok: false,
        status: 400,
        message: '결제 수단이 필요합니다',
      };
    }

    if (!body?.billingCycle) {
      return {
        ok: false,
        status: 400,
        message: '결제 주기 정보가 필요합니다',
      };
    }

    if (body.expectedAmount <= 0) {
      return {
        ok: false,
        status: 400,
        message: '결제 금액은 0보다 커야 합니다',
      };
    }

    const payloadBody: PaymentPreRegisterRequest = {
      membershipLevel: Number(body.membershipLevel),
      paymentMethod: body.paymentMethod,
      billingCycle: body.billingCycle,
      couponId: body.couponId ?? null,
      expectedAmount: body.expectedAmount,
      timezone: body.timezone,
      billingTime: body.billingTime,
      scheduleAt: body.scheduleAt,
    };

    const upstream = await proxyBackendJson<
      BackendApiResponse<PaymentPreRegisterResponse>
    >('/v1/payments/pre-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadBody),
    });

    if (!upstream.ok || !upstream.data) {
      logError(
        '[PaymentService] 결제 사전등록 실패',
        new Error('Upstream error'),
        { status: upstream.status, body: upstream.text }
      );

      const errorPayload = (upstream.data as any) ?? {};
      const type = errorPayload?.type as string | undefined;
      const message = errorPayload?.message as string | undefined;

      const mappedMessage = mapPreRegisterError(type, message);

      return {
        ok: false,
        status: upstream.status || 500,
        message: mappedMessage,
      };
    }

    const payload = upstream.data as any;
    const data = payload?.data ?? payload;

    if (!data || typeof data.paymentId !== 'string') {
      logError(
        '[PaymentService] 결제 사전등록 응답 비정상',
        new Error('Invalid response'),
        { status: upstream.status, payload }
      );
      return {
        ok: false,
        status: upstream.status || 500,
        message: '결제 사전등록에 실패했습니다',
      };
    }

    logInfo('[PaymentService] 결제 사전등록 성공', { data });

    return { ok: true, status: upstream.status || 200, data };
  }

  static async upgrade(
    request: Request
  ): Promise<
    | { ok: true; status: number; data: SubscriptionUpgradeResponse }
    | { ok: false; status: number; message: string }
  > {
    let body: SubscriptionUpgradeRequest;

    try {
      body = (await request.json()) as SubscriptionUpgradeRequest;
    } catch (error) {
      logError('[PaymentService] 업그레이드 본문 파싱 실패', error as Error);
      return {
        ok: false,
        status: 400,
        message: '유효한 JSON 본문이 필요합니다',
      };
    }

    if (
      body?.targetMembershipLevel === undefined ||
      body.targetMembershipLevel === null ||
      Number.isNaN(body.targetMembershipLevel)
    ) {
      return {
        ok: false,
        status: 400,
        message: '업그레이드할 멤버십 정보가 필요합니다',
      };
    }

    if (!body?.billingCycle) {
      return {
        ok: false,
        status: 400,
        message: '결제 주기 정보가 필요합니다',
      };
    }

    const operationId =
      body.operationId && typeof body.operationId === "string"
        ? body.operationId
        : undefined;

    const payloadBody: SubscriptionUpgradeRequest = {
      targetMembershipLevel: Number(body.targetMembershipLevel),
      billingCycle: body.billingCycle,
      paymentMethod: body.paymentMethod,
      operationId,
    };

    const upstream = await proxyBackendJson<
      BackendApiResponse<SubscriptionUpgradeResponse>
    >('/v1/payments/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(operationId ? { 'Idempotency-Key': operationId } : {}),
      },
      body: JSON.stringify(payloadBody),
    });

    if (!upstream.ok || !upstream.data) {
      logError(
        '[PaymentService] 업그레이드 요청 실패',
        new Error('Upstream error'),
        { status: upstream.status, body: upstream.text }
      );

      const errorPayload = (upstream.data as any) ?? {};
      const message =
        errorPayload?.message || upstream.text || '구독 업그레이드에 실패했습니다';

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    const payload = upstream.data as any;
    const data = payload?.data ?? payload;

    if (!data) {
      logError(
        '[PaymentService] 업그레이드 응답 비정상',
        new Error('Invalid response'),
        { status: upstream.status, payload }
      );
      return {
        ok: false,
        status: upstream.status || 500,
        message: '구독 업그레이드에 실패했습니다',
      };
    }

    logInfo('[PaymentService] 업그레이드 성공', {
      differenceAmount: data.differenceAmount,
      paymentRequested: data.paymentRequested,
    });

    return { ok: true, status: upstream.status || 200, data };
  }
}

function mapPreRegisterError(type?: string, fallback?: string): string {
  const messages: Record<string, string> = {
    INVALID_REQUEST: '요청 값이 올바르지 않습니다',
    UNAUTHORIZED: '인증이 필요합니다',
    FORBIDDEN: '요청이 거절되었습니다',
    ALREADY_PAID: '이미 결제가 완료된 주문입니다',
  };

  if (type && messages[type]) {
    return messages[type];
  }

  return fallback || '결제 사전등록에 실패했습니다';
}
