"use client";

import { useState, useCallback } from "react";
import PriceRepository, {
  PricePlan,
  Subscription,
  PaymentRequest,
  PaymentHistoryRequest,
  PaymentHistory
} from "@/src/model/PriceRepository";
import PaymentRepository from "@/src/model/PaymentRepository";
import toast from "react-hot-toast";
import { logWarn } from "@/src/utils/logger";
import { clearOperationId, ensureOperationId } from "@/src/utils/operationId";
import {
  ClientApiResponse,
  SubscriptionCancelReasonCode,
  SubscriptionCancelResponse,
  SubscriptionPendingCancel,
  SubscriptionPendingDowngrade,
  SubscriptionDowngradeResponse,
  SubscriptionDowngradeCancelResponse,
  SubscriptionCancelUndoResponse,
  SubscriptionStatusResponse,
  BillingCycleType,
} from "@/src/types/payment";

export interface PriceViewModel {
  // State
  plans: PricePlan[];
  currentSubscription: Subscription | null;
  selectedPlan: PricePlan | null;
  paymentHistory: PaymentHistory[];
  loading: boolean;
  error: string | null;
  pendingDowngrade: SubscriptionPendingDowngrade | null;
  pendingCancel: SubscriptionPendingCancel | null;

  // Actions
  loadPlans: () => Promise<void>;
  loadCurrentSubscription: () => Promise<void>;
  loadPaymentHistory: (userId: string, request?: Partial<PaymentHistoryRequest>) => Promise<void>;
  getSubscriptionStatus: (userId: string) => Promise<Subscription | null>;
  selectPlan: (plan: PricePlan) => void;
  scheduleCancel: (options: ScheduleCancelOptions) => Promise<void>;
  cancelScheduledCancel: (options: CancelCancelOptions) => Promise<void>;
  scheduleDowngrade: (options: ScheduleDowngradeOptions) => Promise<void>;
  cancelScheduledDowngrade: (options: CancelDowngradeOptions) => Promise<void>;
  clearError: () => void;
  hydrateCurrentSubscription: (subscription: Subscription | null) => void;
}

export interface ScheduleCancelOptions {
  subscriptionId: string;
  reasonCode: SubscriptionCancelReasonCode;
  reasonDetail?: string;
  userId?: string;
}

export interface ScheduleDowngradeOptions {
  subscriptionId: string;
  targetMembershipLevel: number;
  targetBillingCycle: BillingCycleType;
  reason?: string;
  userId?: string;
}

export interface CancelDowngradeOptions {
  subscriptionId: string;
  userId?: string;
}

export interface CancelCancelOptions {
  subscriptionId: string;
  userId?: string;
}

export const usePriceViewModel = (): PriceViewModel => {
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PricePlan | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDowngrade, setPendingDowngrade] = useState<SubscriptionPendingDowngrade | null>(null);
  const [pendingCancel, setPendingCancel] = useState<SubscriptionPendingCancel | null>(null);

  const hydrateCurrentSubscription = useCallback((subscription: Subscription | null) => {
    setCurrentSubscription(subscription);
    setPendingDowngrade(subscription?.pendingDowngrade ?? null);
    setPendingCancel(subscription?.pendingCancel ?? null);
  }, []);

  const syncPendingStateFromStatus = useCallback(
    (status: SubscriptionStatusResponse | null) => {
      if (!status || status.subscriptions.length === 0) {
        setPendingDowngrade(null);
        setPendingCancel(null);
        return;
      }

      const active =
        status.subscriptions.find((item) =>
          item.status === "ACTIVE" || item.status === "PENDING_CANCEL"
        ) ?? status.subscriptions[0];

      setPendingDowngrade(active?.pendingDowngrade ?? null);
      setPendingCancel(active?.pendingCancel ?? null);
    },
    []
  );

  // 요금제 목록 로드
  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await PriceRepository.getPricePlans();
      
      if (response.code === '0') {
        setPlans(response.data.plans);
      } else {
        throw new Error(response.message || '요금제 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // 현재 구독 정보 로드
  const loadCurrentSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await PriceRepository.getCurrentSubscription();
      
        if (response.code === 0 || response.code === '0') {
          const subscription = response.data.subscription ?? null;
          setCurrentSubscription(subscription);

          const planPrice = Number(
            subscription?.plan?.price ?? subscription?.plan?.originalPrice ?? 0,
          );
          const subscriptionStatus = subscription?.status;
          const hasPaidSubscription =
            !!subscription &&
            planPrice > 0 &&
            (subscriptionStatus === 'ACTIVE' || subscriptionStatus === 'PENDING_CANCEL');

          if (hasPaidSubscription) {
            try {
              const status = await PaymentRepository.getSubscriptionStatus();
              syncPendingStateFromStatus(status);
            } catch (statusError) {
              logWarn("구독 상태 추가 조회 실패", {
                errorMessage:
                  statusError instanceof Error ? statusError.message : statusError,
              });
              setPendingDowngrade(subscription?.pendingDowngrade ?? null);
              setPendingCancel(subscription?.pendingCancel ?? null);
            }
          } else {
            setPendingDowngrade(subscription?.pendingDowngrade ?? null);
            setPendingCancel(subscription?.pendingCancel ?? null);
          }
        } else {
          throw new Error(response.message || '구독 정보를 불러오는데 실패했습니다.');
        }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      // 구독 정보는 없을 수 있으므로 toast는 표시하지 않음
      logWarn('구독 정보 로드 실패', { errorMessage });
    } finally {
      setLoading(false);
    }
  }, [syncPendingStateFromStatus]);

  // 요금제 선택
  const selectPlan = useCallback((plan: PricePlan) => {
    setSelectedPlan(plan);
  }, []);

  // 결제 히스토리 로드
  const loadPaymentHistory = useCallback(async (userId: string, request?: Partial<PaymentHistoryRequest>) => {
    try {
      setLoading(true);
      setError(null);
      
      const fullRequest: PaymentHistoryRequest = {
        userId,
        page: 1,
        limit: 20,
        ...request
      };

      const response = await PriceRepository.getPaymentHistory(fullRequest);
      
      if (response.code === '0') {
        setPaymentHistory(response.data.payments);
      } else {
        throw new Error(response.message || '결제 히스토리를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      logWarn('결제 히스토리 로드 실패', { errorMessage, userId });
    } finally {
      setLoading(false);
    }
  }, []);

  // 구독 상태 조회
  const getSubscriptionStatus = useCallback(
    async (userId: string): Promise<Subscription | null> => {
      try {
        setLoading(true);
        setError(null);

        const response = await PriceRepository.getCurrentSubscription();

        if (response.code === 0 || response.code === "0") {
          const subscription = response.data.subscription ?? null;
          setCurrentSubscription(subscription);

          const planPrice =
            Number(
              subscription?.plan?.price ??
                subscription?.plan?.originalPrice ??
                0
            ) || 0;
          const subscriptionStatus = subscription?.status;
          const hasPaidSubscription =
            !!subscription &&
            planPrice > 0 &&
            (subscriptionStatus === "ACTIVE" ||
              subscriptionStatus === "PENDING_CANCEL");

          if (hasPaidSubscription) {
            try {
              const status = await PaymentRepository.getSubscriptionStatus();
              syncPendingStateFromStatus(status);
            } catch (statusError) {
              logWarn("구독 상태 추가 조회 실패", {
                errorMessage:
                  statusError instanceof Error
                    ? statusError.message
                    : statusError,
                userId,
              });
              setPendingDowngrade(subscription?.pendingDowngrade ?? null);
              setPendingCancel(subscription?.pendingCancel ?? null);
            }
          } else {
            setPendingDowngrade(subscription?.pendingDowngrade ?? null);
            setPendingCancel(subscription?.pendingCancel ?? null);
          }
          return subscription;
        } else {
          throw new Error(
            response.message || "구독 상태 조회에 실패했습니다."
          );
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
        setError(errorMessage);
        logWarn("구독 상태 조회 실패", { errorMessage, userId });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [syncPendingStateFromStatus]
  );

  // 구독 취소
  const scheduleCancel = useCallback(
    async ({
      subscriptionId,
      reasonCode,
      reasonDetail,
      userId,
    }: ScheduleCancelOptions) => {
      const { operationId } = ensureOperationId({
        action: "cancel",
        subscriptionId,
        userId,
      });
      let responseHandled = false;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": operationId,
            },
            credentials: "include",
            body: JSON.stringify({
              reasonCode,
              reasonDetail: reasonDetail ?? null,
              operationId,
            }),
          }
        );
        responseHandled = true;

        const payload: ClientApiResponse<SubscriptionCancelResponse> =
          await response.json();

        if (!response.ok || !payload.success || !payload.data) {
          const alreadyCanceledMessage = "구독 해지가 완료되었습니다";
          const isAlreadyCanceled =
            typeof payload.error === "string" &&
            payload.error.includes(alreadyCanceledMessage);

          if (isAlreadyCanceled) {
            setPendingCancel(null);
            toast.success(
              payload.error ||
                "구독 해지가 이미 완료되어 남은 기간까지 이용이 가능합니다."
            );

            if (userId) {
              await getSubscriptionStatus(userId);
            } else {
              await loadCurrentSubscription();
            }

            return;
          }

          const message =
            payload.error ||
            "구독 해지가 예약되지 않았습니다. 잠시 후 다시 시도해주세요.";
          throw new Error(message);
        }

        const effectiveDate =
          payload.data.effectiveDate ??
          payload.data.nextBillingDate ??
          payload.data.canceledAt ??
          new Date().toISOString();

        setPendingCancel({
          effectiveDate,
          status: payload.data.status,
          requestedAt: new Date().toISOString(),
          reason: reasonDetail ?? undefined,
        });
        toast.success(
          payload.data.message ??
            "구독 해지가 예약되었습니다. 다음 결제일부터 적용됩니다."
        );

        if (userId) {
          await getSubscriptionStatus(userId);
        } else {
          await loadCurrentSubscription();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "구독 해지를 예약하지 못했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        if (responseHandled) {
          clearOperationId({ action: "cancel", subscriptionId, userId });
        }
        setLoading(false);
      }
    },
    [getSubscriptionStatus, loadCurrentSubscription]
  );

  const scheduleDowngrade = useCallback(
    async ({
      subscriptionId,
      targetMembershipLevel,
      targetBillingCycle,
      reason,
      userId,
    }: ScheduleDowngradeOptions) => {
      const { operationId } = ensureOperationId({
        action: "downgrade",
        subscriptionId,
        userId,
      });
      let responseHandled = false;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/subscriptions/${encodeURIComponent(subscriptionId)}/downgrade`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": operationId,
            },
            credentials: "include",
            body: JSON.stringify({
              targetMembershipLevel,
              targetBillingCycle,
              reason: reason ?? null,
              operationId,
            }),
          }
        );
        responseHandled = true;

        const payload: ClientApiResponse<SubscriptionDowngradeResponse> =
          await response.json();

        if (!response.ok || !payload.success || !payload.data) {
          const message =
            payload.error ||
            "다운그레이드 예약에 실패했습니다. 잠시 후 다시 시도해주세요.";
          throw new Error(message);
        }

        setPendingDowngrade({
          effectiveDate: payload.data.effectiveDate,
          targetMembershipLevel: payload.data.targetMembershipLevel,
          targetBillingCycle: payload.data.targetBillingCycle,
          requestedAt: new Date().toISOString(),
          reason: reason ?? undefined,
        });

        toast.success(
          payload.data.message ??
            "다운그레이드가 예약되었습니다. 다음 결제일부터 적용됩니다."
        );

        if (userId) {
          await getSubscriptionStatus(userId);
        } else {
          await loadCurrentSubscription();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "다운그레이드 예약에 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        if (responseHandled) {
          clearOperationId({ action: "downgrade", subscriptionId, userId });
        }
        setLoading(false);
      }
    },
    [getSubscriptionStatus, loadCurrentSubscription]
  );

  const cancelScheduledDowngrade = useCallback(
    async ({ subscriptionId, userId }: CancelDowngradeOptions) => {
      const { operationId } = ensureOperationId({
        action: "downgrade_cancel",
        subscriptionId,
        userId,
      });
      let responseHandled = false;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/subscriptions/${encodeURIComponent(
            subscriptionId
          )}/downgrade/cancel`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": operationId,
            },
            credentials: "include",
            body: JSON.stringify({ operationId }),
          }
        );
        responseHandled = true;

        const payload: ClientApiResponse<SubscriptionDowngradeCancelResponse> =
          await response.json();

        if (!response.ok || !payload.success || !payload.data) {
          const message =
            payload.error ||
            "다운그레이드 예약 취소에 실패했습니다. 잠시 후 다시 시도해주세요.";
          throw new Error(message);
        }

        setPendingDowngrade(null);
        toast.success(
          payload.data.message ?? "다운그레이드 예약이 취소되었습니다."
        );

        if (userId) {
          await getSubscriptionStatus(userId);
        } else {
          await loadCurrentSubscription();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "다운그레이드 예약 취소에 실패했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        if (responseHandled) {
          clearOperationId({
            action: "downgrade_cancel",
            subscriptionId,
            userId,
          });
        }
        setLoading(false);
      }
    },
    [getSubscriptionStatus, loadCurrentSubscription]
  );

  const cancelScheduledCancel = useCallback(
    async ({ subscriptionId, userId }: CancelCancelOptions) => {
      const { operationId } = ensureOperationId({
        action: "cancel_undo",
        subscriptionId,
        userId,
      });
      let responseHandled = false;

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/subscriptions/${encodeURIComponent(
            subscriptionId
          )}/cancel/undo`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Idempotency-Key": operationId,
            },
            credentials: "include",
            body: JSON.stringify({ operationId }),
          }
        );
        responseHandled = true;

        const payload: ClientApiResponse<SubscriptionCancelUndoResponse> =
          await response.json();

        if (!response.ok || !payload.success || !payload.data) {
          const message =
            payload.error ||
            "구독 해지 예약을 취소하지 못했습니다. 잠시 후 다시 시도해주세요.";
          throw new Error(message);
        }

        setPendingCancel(null);
        toast.success(
          payload.data.message ?? "구독 해지 예약이 취소되었습니다."
        );

        if (userId) {
          await getSubscriptionStatus(userId);
        } else {
          await loadCurrentSubscription();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "구독 해지 예약을 취소하지 못했습니다.";
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        if (responseHandled) {
          clearOperationId({
            action: "cancel_undo",
            subscriptionId,
            userId,
          });
        }
        setLoading(false);
      }
    },
    [getSubscriptionStatus, loadCurrentSubscription]
  );

  // 오류 메시지 클리어
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    plans,
    currentSubscription,
    selectedPlan,
    paymentHistory,
    loading,
    error,
    pendingDowngrade,
    pendingCancel,

    // Actions
    loadPlans,
    loadCurrentSubscription,
    loadPaymentHistory,
    getSubscriptionStatus,
    selectPlan,
    scheduleCancel,
    cancelScheduledCancel,
    scheduleDowngrade,
    cancelScheduledDowngrade,
    clearError,
    hydrateCurrentSubscription,
  };
};
