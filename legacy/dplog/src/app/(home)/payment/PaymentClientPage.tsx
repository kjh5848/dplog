"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Check, ArrowLeft, AlertCircle } from "lucide-react";
import { usePriceViewModel } from "@/src/viewModel/price/usePriceViewModel";
import type { Subscription } from "@/src/model/PriceRepository";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import { logError, logInfo } from "@/src/utils/logger";
import { clearOperationId, ensureOperationId } from "@/src/utils/operationId";
import toast from "react-hot-toast";
import PaymentRepository from "@/src/model/PaymentRepository";
import SubscriptionDowngradeModal from "@/src/features/subscription/components/SubscriptionDowngradeModal";

import { MembershipCatalogItem, MembershipDetail } from "@/types/membership";
import {
  ClientApiResponse,
  PaymentPreRegisterResponse,
  BillingKeyCompleteResponse,
  BillingCycleType,
} from "@/src/types/payment";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import { customLoading } from "@/src/utils/loading";
import { getMembershipDetailAction } from "./actions";
import { getClientTimezone, getDefaultBillingTime } from "@/src/utils/browser/timezone";

const normalizeBillingCycle = (value?: string | null): BillingCycleType | null => {
  if (!value) {
    return null;
  }

  const upper = value.toUpperCase();

  return upper === "MONTHLY" || upper === "YEARLY" ? (upper as BillingCycleType) : null;
};

const toStringId = (value: unknown): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  try {
    return String(value);
  } catch {
    return null;
  }
};

const FREE_MEMBERSHIP_ID = "2";

const normalizeMembershipDetailForCycle = (
  detail: MembershipDetail,
  selectedPeriod: BillingCycleType,
  currentSubscription: Subscription | null
): MembershipDetail => {
  const detailCycle = normalizeBillingCycle(detail.billingCycle);
  const currentCycle =
    normalizeBillingCycle(currentSubscription?.period) ??
    normalizeBillingCycle(currentSubscription?.plan?.period) ??
    detailCycle;

  const detailPlanId = toStringId(detail.id);
  const currentPlanId =
    toStringId(detail.currentMembershipId) ??
    toStringId(currentSubscription?.plan?.id ?? currentSubscription?.planId);

  const sameMembership =
    detailPlanId !== null &&
    currentPlanId !== null &&
    detailPlanId === currentPlanId;

  if (!sameMembership) {
    return detail;
  }

  let canPurchase = detail.canPurchase;
  let message = detail.message;
  const effectiveCycle = detailCycle ?? currentCycle;

  if (effectiveCycle && effectiveCycle === selectedPeriod) {
    canPurchase = false;
    if (!message) {
      message = "이미 동일한 결제 주기로 이용 중입니다.";
    }
  } else if (effectiveCycle === "MONTHLY" && selectedPeriod === "YEARLY") {
    canPurchase = true;
    if (!message || message === "현재 보유한 멤버십과 동일합니다.") {
      message = "현재 월간 구독 중입니다. 연간 결제로 업그레이드할 수 있어요.";
    }
  } else if (effectiveCycle === "YEARLY" && selectedPeriod === "MONTHLY") {
    canPurchase = false;
    if (!message || message === "현재 보유한 멤버십과 동일합니다.") {
      message = "연간 구독 중에는 월간으로 변경할 수 없습니다.";
    }
  }

  return {
    ...detail,
    canPurchase,
    message,
  };
};

const mapMembershipDetailErrorMessage = (rawMessage?: string): string => {
  const fallback = "멤버십 정보를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.";

  if (!rawMessage) {
    return fallback;
  }

  const normalized = rawMessage.toLowerCase();

  if (
    normalized.includes("handler dispatch failed") ||
    normalized.includes("java.lang") ||
    normalized.includes("auth cannot be resolved")
  ) {
    return fallback;
  }

  return rawMessage;
};

interface PaymentClientPageProps {
  initialMembershipPlans: MembershipCatalogItem[];
  initialPlanId: string | null;
  initialPeriod: BillingCycleType;
  initialCurrentSubscription: Subscription | null;
}

function PaymentClientPage({
  initialMembershipPlans,
  initialPlanId,
  initialPeriod,
  initialCurrentSubscription,
}: PaymentClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser } = useAuthStore();

  const planIdParam = searchParams?.get("planId");
  const planId = planIdParam ?? initialPlanId ?? null;
  const periodParam = searchParams?.get("period");
  const period =
    periodParam === "YEARLY"
      ? "YEARLY"
      : periodParam === "MONTHLY"
        ? "MONTHLY"
        : initialPeriod;

  const {
    currentSubscription,
    pendingDowngrade,
    pendingCancel,
    loading: subscriptionLoading,
    loadCurrentSubscription,
    scheduleDowngrade,
    cancelScheduledDowngrade,
    hydrateCurrentSubscription,
  } = usePriceViewModel();

  const [portoneError, setPortoneError] = useState<string | null>(null);
  const [portoneStatusMessage, setPortoneStatusMessage] = useState<string | null>(null);

  const [membershipPlans, setMembershipPlans] = useState<MembershipCatalogItem[]>(initialMembershipPlans);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState<string | null>(
    initialMembershipPlans.length === 0 ? "멤버십 정보가 존재하지 않습니다." : null
  );
  const [selectedPlan, setSelectedPlan] = useState<MembershipCatalogItem | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'MONTHLY' | 'YEARLY'>(period);
  
  const loginRedirectTarget = useMemo(() => {
    const params = new URLSearchParams();
    const targetPlanId =
      planId ??
      (selectedPlan?.id ? String(selectedPlan.id) : null);
    if (targetPlanId) {
      params.set("planId", targetPlanId);
    }
    params.set("period", selectedPeriod);
    const query = params.toString();
    return `/payment${query ? `?${query}` : ""}`;

  }, [planId, selectedPlan?.id, selectedPeriod]);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<MembershipDetail | null>(null);
  const [planDetailLoading, setPlanDetailLoading] = useState(false);
  const [planDetailError, setPlanDetailError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasExistingSubscription, setHasExistingSubscription] = useState(false);
  const [subscriptionCheckLoading, setSubscriptionCheckLoading] = useState(true);
  const [hasHydratedInitialSubscription, setHasHydratedInitialSubscription] = useState(false);
  const [isDowngradeModalOpen, setIsDowngradeModalOpen] = useState(false);
  const [downgradeProcessing, setDowngradeProcessing] = useState(false);
  const [downgradeTargetPlan, setDowngradeTargetPlan] = useState<MembershipCatalogItem | null>(null);
  const [globalLoadingMessage, setGlobalLoadingMessage] = useState("결제를 처리하고 있습니다.");
  const [globalLoadingSubMessage, setGlobalLoadingSubMessage] = useState<string | null>(null);
  const [activeSubscriptionId, setActiveSubscriptionId] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState(() => ({
    number: "4518421244268814",
    expiryMonth: "02",
    expiryYear: "27",
    birth: "940208",
    passwordTwoDigits: "44",
  }));
  const missingPlanWarningShownRef = useRef(false);
  const planValidationRequestRef = useRef(0);
  const planValidationToastRef = useRef(false);
  const selectedPlanRef = useRef<MembershipCatalogItem | null>(null);
  const [isPlanDetailFetching, startPlanDetailFetch] = useTransition();
  const clearPortoneError = useCallback(() => setPortoneError(null), []);
  const updateGlobalLoading = useCallback((message: string, subMessage?: string | null) => {
    setGlobalLoadingMessage(message);
    setGlobalLoadingSubMessage(subMessage ?? null);
  }, []);
  const clearGlobalLoadingSubMessage = useCallback(() => {
    setGlobalLoadingSubMessage(null);
  }, []);
  const resetCardForm = useCallback(() => {
    setCardForm({
      number: "",
      expiryMonth: "",
      expiryYear: "",
      birth: "",
      passwordTwoDigits: "",
    });
  }, []);

  useEffect(() => {
    router.prefetch('/track?view=grid');
  }, [router]);

  const clientTimezone = useMemo(() => getClientTimezone(), []);
  const defaultBillingTime = useMemo(() => getDefaultBillingTime(), []);

  const formatCardNumber = useCallback((value: string) => {
    return value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  }, []);

  const handleCardInputChange = useCallback(
    (
      field: "number" | "expiryMonth" | "expiryYear" | "birth" | "passwordTwoDigits"
    ) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        setCardForm((prev) => {
          if (field === "number") {
            return { ...prev, number: formatCardNumber(value) };
          }

          if (field === "expiryMonth") {
            return { ...prev, expiryMonth: value.replace(/\D/g, "").slice(0, 2) };
          }

          if (field === "expiryYear") {
            return { ...prev, expiryYear: value.replace(/\D/g, "").slice(0, 2) };
          }

          if (field === "birth") {
            return { ...prev, birth: value.replace(/\D/g, "").slice(0, 10) };
          }

          return {
            ...prev,
            passwordTwoDigits: value.replace(/\D/g, "").slice(0, 2),
          };
        });
      },
    [formatCardNumber]
  );

  const validateCardForm = useCallback((): string | null => {
    const sanitizedNumber = cardForm.number.replace(/\s+/g, "");
    if (sanitizedNumber.length < 14) {
      return "유효한 카드 번호를 입력해주세요";
    }

    const expiryMonth = cardForm.expiryMonth.padStart(2, "0");
    const expiryYear = cardForm.expiryYear.padStart(2, "0");

    if (!/^\d{2}$/.test(expiryMonth) || Number(expiryMonth) < 1 || Number(expiryMonth) > 12) {
      return "유효한 카드 유효기간(월)을 입력해주세요";
    }

    if (!/^\d{2}$/.test(expiryYear)) {
      return "유효한 카드 유효기간(년)을 입력해주세요";
    }

    const birth = cardForm.birth.replace(/\D/g, "");
    if (birth.length < 6) {
      return "생년월일 또는 사업자등록번호 앞 6자리를 입력해주세요";
    }

    if (!/^\d{2}$/.test(cardForm.passwordTwoDigits)) {
      return "카드 비밀번호 앞 두 자리를 입력해주세요";
    }

    return null;
  }, [cardForm]);

  const ensureActiveSubscriptionId = useCallback(async (): Promise<string | null> => {
    if (!hasExistingSubscription || !currentSubscription) {
      toast.error("활성 유료 구독이 없습니다.");
      return null;
    }

    if (activeSubscriptionId) {
      return activeSubscriptionId;
    }

    try {
      const status = await PaymentRepository.getSubscriptionStatus();

      if (!status.hasActiveSubscription || status.subscriptions.length === 0) {
        toast.error("활성 구독을 찾지 못했습니다. 잠시 후 다시 시도해주세요.");
        return null;
      }

      const active =
        status.subscriptions.find(
          (item) => item.status === "ACTIVE" || item.status === "PENDING_CANCEL"
        ) ??
        status.subscriptions[0];

      if (!active?.subscriptionId) {
        toast.error("구독 정보를 찾지 못했습니다. 잠시 후 다시 시도해주세요.");
        return null;
      }

      setActiveSubscriptionId(active.subscriptionId);
      return active.subscriptionId;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "구독 정보를 불러오지 못했습니다.";
      logError("구독 상태 조회 실패", error as Error);
      toast.error(message);
      return null;
    }
  }, [
    activeSubscriptionId,
    hasExistingSubscription,
    currentSubscription,
  ]);

  const validateSelectedPlan = useCallback(
    (plan: MembershipCatalogItem, options: { showToast?: boolean } = {}) => {
      const { showToast = true } = options;
      const membershipLevel = plan.level ?? Number(plan.id);

      if (membershipLevel === undefined || Number.isNaN(membershipLevel)) {
        const message = "멤버십 정보를 확인할 수 없습니다.";
        setSelectedPlanDetail(null);
        setPlanDetailError(message);
        setPlanDetailLoading(false);
        if (showToast) {
          toast.error(message);
        }
        return;
      }

      const requestId = planValidationRequestRef.current + 1;
      planValidationRequestRef.current = requestId;

      setPlanDetailLoading(true);
      setPlanDetailError(null);
      setSelectedPlanDetail(null);

      startPlanDetailFetch(async () => {
        try {
          const detail = await getMembershipDetailAction(membershipLevel);

          if (planValidationRequestRef.current !== requestId) {
            return;
          }

          const normalizedDetail = normalizeMembershipDetailForCycle(
            detail,
            selectedPeriod,
            currentSubscription
          );

          setSelectedPlanDetail(normalizedDetail);

          if (!normalizedDetail.canPurchase) {
            const message =
              normalizedDetail.message || "현재 선택한 요금제를 이용할 수 없습니다.";
            setPlanDetailError(message);
            if (showToast) {
              toast.error(message);
            }
          } else {
            setPlanDetailError(null);
            if (showToast && normalizedDetail.message) {
              toast.success(normalizedDetail.message);
            }
          }
        } catch (error) {
          if (planValidationRequestRef.current !== requestId) {
            return;
          }
          const redirectTarget = `/login?redirect=${encodeURIComponent(
            loginRedirectTarget
          )}`;
          const message = mapMembershipDetailErrorMessage(
            error instanceof Error ? error.message : undefined
          );
          setSelectedPlanDetail(null);
          setPlanDetailError(message);
          if (showToast) {
            toast.error(message);
          }
          if (
            error instanceof Error &&
            message.includes("로그인") &&
            typeof window !== "undefined"
          ) {
            router.push(redirectTarget);
          }
        } finally {
          if (planValidationRequestRef.current === requestId) {
            setPlanDetailLoading(false);
          }
        }
      });
    },
    [
      currentSubscription,
      loginRedirectTarget,
      router,
      selectedPeriod,
      startPlanDetailFetch,
    ]
  );

  const applySelectedPlan = useCallback(
    (plan: MembershipCatalogItem, options?: { showToast?: boolean }) => {
      if (plan.priceYearly <= 0 && selectedPeriod === "YEARLY") {
        setSelectedPeriod("MONTHLY");
      }
      planValidationToastRef.current = options?.showToast ?? false;
      setSelectedPlan(plan);
      setSelectedPlanDetail(null);
    },
    [selectedPeriod]
  );

  const handleDowngradeConfirm = useCallback(
    async ({ reason }: { reason?: string }) => {
      if (!downgradeTargetPlan) {
        toast.error("다운그레이드할 요금제를 확인할 수 없습니다.");
        return;
      }

      const targetLevel =
        downgradeTargetPlan.level ?? Number(downgradeTargetPlan.id);

      if (targetLevel === undefined || Number.isNaN(targetLevel)) {
        toast.error("다운그레이드할 멤버십 정보를 확인할 수 없습니다.");
        return;
      }

      const subscriptionId = await ensureActiveSubscriptionId();
      if (!subscriptionId) {
        return;
      }

      try {
        setDowngradeProcessing(true);
        updateGlobalLoading(
          "다운그레이드를 처리하고 있습니다.",
          "요청하신 요금제로 변경을 예약하고 있습니다."
        );
        await scheduleDowngrade({
          subscriptionId,
          targetMembershipLevel: targetLevel,
          targetBillingCycle: selectedPeriod,
          reason,
          userId: loginUser?.id ? String(loginUser.id) : undefined,
        });
        setIsDowngradeModalOpen(false);
        setDowngradeTargetPlan(null);
      } catch (error) {
        logError("다운그레이드 예약 실패", error as Error);
      } finally {
        setDowngradeProcessing(false);
        clearGlobalLoadingSubMessage();
      }
    },
    [
      downgradeTargetPlan,
      ensureActiveSubscriptionId,
      scheduleDowngrade,
      selectedPeriod,
      loginUser?.id,
      updateGlobalLoading,
      clearGlobalLoadingSubMessage,
    ]
  );

  const handleCancelDowngrade = useCallback(async () => {
    const subscriptionId = await ensureActiveSubscriptionId();
    if (!subscriptionId) {
      return;
    }

    try {
      setDowngradeProcessing(true);
      updateGlobalLoading(
        "다운그레이드 예약을 취소하고 있습니다.",
        "예약 정보를 확인하고 있습니다."
      );
      await cancelScheduledDowngrade({
        subscriptionId,
        userId: loginUser?.id ? String(loginUser.id) : undefined,
      });
    } catch (error) {
      logError("다운그레이드 예약 취소 실패", error as Error);
    } finally {
      setDowngradeProcessing(false);
      clearGlobalLoadingSubMessage();
    }
  }, [
    ensureActiveSubscriptionId,
    cancelScheduledDowngrade,
    loginUser?.id,
    updateGlobalLoading,
    clearGlobalLoadingSubMessage,
  ]);

  useEffect(() => {
    selectedPlanRef.current = selectedPlan;
  }, [selectedPlan]);

  useEffect(() => {
    setMembershipPlans(initialMembershipPlans);
    if (initialMembershipPlans.length === 0) {
      setMembershipError("멤버십 정보가 존재하지 않습니다.");
    } else {
      setMembershipError(null);
    }
  }, [initialMembershipPlans]);

  useEffect(() => {
    if (portoneError) {
      toast.error(portoneError);
      clearPortoneError();
    }
  }, [portoneError, clearPortoneError]);

  useEffect(() => {
    if (!loginUser) {
      router.push(
        `/login?redirect=${encodeURIComponent(loginRedirectTarget)}`,
      );
    }
  }, [loginUser, loginRedirectTarget, router]);

  // 초기 구독 상태를 SSR 데이터로 수화하거나 Fallback fetch 수행
  useEffect(() => {
    if (!loginUser || hasHydratedInitialSubscription) {
      return;
    }

    if (initialCurrentSubscription) {
      hydrateCurrentSubscription(initialCurrentSubscription);
      setHasHydratedInitialSubscription(true);
      return;
    }

    const loadInitialData = async () => {
      try {
        await loadCurrentSubscription();
      } catch (error) {
        logError("초기 데이터 로딩 실패:", error as Error);
      } finally {
        setHasHydratedInitialSubscription(true);
      }
    };

    loadInitialData();
  }, [
    hydrateCurrentSubscription,
    initialCurrentSubscription,
    loadCurrentSubscription,
    loginUser,
    hasHydratedInitialSubscription,
  ]);

  useEffect(() => {
    if (membershipPlans.length === 0) {
      return;
    }

    const numericPlanId = planId ? Number(planId) : undefined;
    const isValidPlanId = numericPlanId !== undefined && !Number.isNaN(numericPlanId);
    const currentSelected = selectedPlanRef.current;

    if (isValidPlanId) {
      const plan = membershipPlans.find((p) => p.id === numericPlanId);
      if (plan) {
        if (!currentSelected || plan.id === currentSelected.id) {
          applySelectedPlan(plan, { showToast: false });
        }
        return;
      }

      if (!currentSelected && membershipPlans[0]) {
        applySelectedPlan(membershipPlans[0], { showToast: false });
      }

      if (!missingPlanWarningShownRef.current) {
        toast.error('선택한 요금제를 찾을 수 없습니다. 다른 요금제를 선택해주세요.');
        missingPlanWarningShownRef.current = true;
      }
      return;
    }

    if (!currentSelected && membershipPlans[0]) {
      applySelectedPlan(membershipPlans[0], { showToast: false });
    }
  }, [membershipPlans, planId, applySelectedPlan]);

  useEffect(() => {
    missingPlanWarningShownRef.current = false;
  }, [planId]);

  useEffect(() => {
    if (!selectedPlan) {
      setSelectedPlanDetail(null);
      setPlanDetailError(null);
      setPlanDetailLoading(false);
      return;
    }

    validateSelectedPlan(selectedPlan, { showToast: planValidationToastRef.current });
    planValidationToastRef.current = false;
  }, [selectedPlan, selectedPeriod, validateSelectedPlan]);

  // 구독 상태 체크
  useEffect(() => {
    if (currentSubscription === undefined && (selectedPlanDetail?.currentMembershipId === undefined || selectedPlanDetail?.currentMembershipId === null)) {
      return;
    }

    const inferredPlanPrice =
      Number(
        currentSubscription?.plan?.price ??
          currentSubscription?.plan?.originalPrice ??
          selectedPlanDetail?.currentMembershipPrice ??
          selectedPlanDetail?.currentMembershipPriceMonthly ??
          0
      ) || 0;
    const status = currentSubscription?.status ?? "ACTIVE";
    const isPaidStatus =
      status === "ACTIVE" || status === "PENDING_CANCEL";
    const hasPaidSubscription =
      (currentSubscription && isPaidStatus && inferredPlanPrice > 0) ||
      (!!selectedPlanDetail?.currentMembershipId &&
        (selectedPlanDetail.currentMembershipPriceMonthly ?? 0) >= 0);

    setHasExistingSubscription(hasPaidSubscription);
    setSubscriptionCheckLoading(false);

    if (hasPaidSubscription) {
      logInfo("기존 유료 구독 확인", {
        subscriptionId: currentSubscription?.id,
        planName: currentSubscription?.plan?.name,
        status: currentSubscription?.status,
        price: inferredPlanPrice,
      });
    } else if (currentSubscription) {
      logInfo("무료 또는 비활성 구독 상태", {
        subscriptionId: currentSubscription?.id,
        planName: currentSubscription?.plan?.name,
        status: currentSubscription?.status,
        price: inferredPlanPrice,
      });
    } else {
      logInfo("구독 정보 없음");
    }
  }, [currentSubscription, selectedPlanDetail]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getFinalPrice = () => {
    if (!selectedPlan) return 0;
    return selectedPeriod === 'YEARLY' ? selectedPlan.priceYearly : selectedPlan.price;
  };

  const selectedPeriodLabel = selectedPeriod === 'YEARLY' ? '연간' : '월간';
  const finalPrice = getFinalPrice();

  const formattedSelectedPlanPrice = selectedPlan
    ? `₩${formatPrice(finalPrice)}`
    : null;

  const upgradePaymentLabel = formattedSelectedPlanPrice
    ? `${selectedPeriodLabel} ${formattedSelectedPlanPrice} 금액`
    : "선택한 요금제 금액";

  const upgradeSummaryDescription = formattedSelectedPlanPrice
    ? `${selectedPeriodLabel} ${formattedSelectedPlanPrice} 금액이 청구됩니다.`
    : "업그레이드 요금제 금액이 청구됩니다.";

  const pendingDowngradePlanName = useMemo(() => {
    if (!pendingDowngrade) {
      return null;
    }

    const matched = membershipPlans.find(
      (plan) =>
        (plan.level ?? Number(plan.id)) ===
        pendingDowngrade.targetMembershipLevel
    );

    return matched?.name ?? `레벨 ${pendingDowngrade.targetMembershipLevel}`;
  }, [pendingDowngrade, membershipPlans]);

  const pendingDowngradeEffectiveDateLabel = useMemo(() => {
    if (!pendingDowngrade) {
      return null;
    }

    try {
      return new Date(pendingDowngrade.effectiveDate).toLocaleDateString(
        "ko-KR"
      );
    } catch {
      return pendingDowngrade.effectiveDate;
    }
  }, [pendingDowngrade]);

  const pendingCancelEffectiveDateLabel = useMemo(() => {
    if (!pendingCancel?.effectiveDate) {
      return null;
    }
    try {
      return new Date(pendingCancel.effectiveDate).toLocaleDateString("ko-KR");
    } catch {
      return pendingCancel.effectiveDate;
    }
  }, [pendingCancel]);

  const getPlanDetailItems = (plan: MembershipCatalogItem) => {
    const details: { id: string; description: string }[] = [];

    if (plan.recommendedRevenueHint) {
      details.push({ id: 'hint', description: `추천: ${plan.recommendedRevenueHint}` });
    }

    if (plan.trialAvailable) {
      const trialText = plan.trialDays
        ? `${plan.trialDays}일 무료 체험 제공`
        : '무료 체험 제공';
      details.push({ id: 'trial', description: trialText });
    }

    details.push({ id: 'monthly', description: `월 ₩${formatPrice(plan.price)}` });

    if (plan.priceYearly > 0) {
      const yearlyText = plan.discountPercent > 0
        ? `연 ₩${formatPrice(plan.priceYearly)} (${plan.discountPercent}% 할인)`
        : `연 ₩${formatPrice(plan.priceYearly)}`;
      details.push({ id: 'yearly', description: yearlyText });
    }

    return details;
  };

  const getSubscriptionAction = () => {
    if (!selectedPlan) {
      return { type: 'new', label: '요금제를 선택하세요', disabled: true };
    }

    if (planDetailLoading) {
      return { type: 'checking', label: '요금제 확인 중...', disabled: true };
    }

    if (planDetailError) {
      return { type: 'invalid', label: '구독 불가', disabled: true };
    }

    if (selectedPlanDetail && selectedPlanDetail.canPurchase === false) {
      return { type: 'invalid', label: '구독 불가', disabled: true };
    }

    const inferredCurrentPlanId =
      toStringId(currentSubscription?.plan?.id ?? currentSubscription?.planId) ??
      toStringId(selectedPlanDetail?.currentMembershipId);
    const currentPlanPrice =
      Number(
        currentSubscription?.plan?.price ??
          currentSubscription?.plan?.originalPrice ??
          selectedPlanDetail?.currentMembershipPrice ??
          selectedPlanDetail?.currentMembershipPriceMonthly ??
          selectedPlanDetail?.price ??
          0
      ) || 0;
    const currentStatus = currentSubscription?.status ?? 'ACTIVE';
    const hasPaidSubscription =
      hasExistingSubscription ||
      (!!currentSubscription &&
        (currentStatus === 'ACTIVE' || currentStatus === 'PENDING_CANCEL') &&
        currentPlanPrice > 0);

    const isFreeMembership =
      inferredCurrentPlanId !== null && inferredCurrentPlanId === FREE_MEMBERSHIP_ID;

    if (!inferredCurrentPlanId || isFreeMembership) {
      return { type: 'new', label: '구독하기', disabled: false };
    }

    if (!hasPaidSubscription) {
      return { type: 'new', label: '구독하기', disabled: false };
    }

    if (pendingCancel) {
      return { type: 'cancel_pending', label: '해지 예약 진행 중', disabled: true };
    }

    if (pendingDowngrade) {
      return { type: 'downgrade_cancel', label: '다운그레이드 예약 취소', disabled: false };
    }

    const currentPlanId = inferredCurrentPlanId;
    const newPlanId = toStringId(selectedPlan.id);
    const isSamePlan =
      currentPlanId !== null &&
      newPlanId !== null &&
      currentPlanId === newPlanId;

    if (isSamePlan) {
      const currentCycle =
        normalizeBillingCycle(selectedPlanDetail?.billingCycle) ??
        normalizeBillingCycle(currentSubscription?.period) ??
        normalizeBillingCycle(currentSubscription?.plan?.period);
      const inferredCurrentCycle =
        currentCycle ??
        normalizeBillingCycle(selectedPlanDetail?.billingCycle) ??
        normalizeBillingCycle(
          (selectedPlanDetail as any)?.currentMembershipBillingCycle ?? null,
        );

      if (inferredCurrentCycle === 'MONTHLY' && selectedPeriod === 'YEARLY') {
        if (selectedPlanDetail && selectedPlanDetail.canPurchase === false) {
          return { type: 'invalid', label: '구독 불가', disabled: true };
        }

        return { type: 'upgrade', label: '연간 업그레이드하기', disabled: false };
      }

      return { type: 'same', label: '이미 구독 중', disabled: true };
    }

    // 요금제 비교 (더 간단한 비교 로직)
    const currentPrice = currentPlanPrice;
    const newPrice = selectedPlan.price;

    if (newPrice > currentPrice) {
      return { type: 'upgrade', label: '업그레이드하기', disabled: false };
    } else {
      return { type: 'downgrade', label: '다운그레이드 예약', disabled: false };
    }
  };

  const handleSubscriptionPayment = async () => {
    const action = getSubscriptionAction();
    
    if (action.disabled) {
      if (action.type === 'same') {
        toast.error('이미 동일한 요금제를 구독 중입니다.');
      } else if (action.type === 'checking') {
        toast.error('요금제 정보를 확인하는 중입니다. 잠시 후 다시 시도해주세요.');
      } else if (planDetailError) {
        toast.error(planDetailError);
      } else if (selectedPlanDetail && selectedPlanDetail.canPurchase === false) {
        toast.error(selectedPlanDetail.message || '선택한 요금제로는 결제할 수 없습니다.');
      } else {
        toast.error('선택한 요금제를 진행할 수 없습니다.');
      }
      return;
    }

    if (action.type === 'downgrade') {
      if (!selectedPlan) {
        toast.error('다운그레이드할 요금제를 선택해주세요.');
        return;
      }

      if (pendingDowngrade) {
        toast.error('이미 다운그레이드가 예약되어 있습니다. 예약을 취소한 뒤 다시 시도해주세요.');
        return;
      }

      const activeId = await ensureActiveSubscriptionId();
      if (!activeId) {
        return;
      }

      setDowngradeTargetPlan(selectedPlan);
      setIsDowngradeModalOpen(true);
      return;
    }

    if (action.type === 'downgrade_cancel') {
      const confirmed = window.confirm("예약된 다운그레이드를 취소하시겠습니까?");
      if (!confirmed) {
        return;
      }
      await handleCancelDowngrade();
      return;
    }

    if (action.type === 'upgrade') {
      const confirmed = window.confirm(
        `현재 구독 중인 ${currentSubscription?.plan?.name}에서 ${selectedPlan?.name}으로 업그레이드하시겠습니까?\n\n` +
        `업그레이드 시 등록된 결제 수단으로 ${upgradePaymentLabel}이 청구됩니다.`
      );

      if (!confirmed) {
        return;
      }

      const membershipLevel =
        selectedPlan?.level ?? (selectedPlan ? Number(selectedPlan.id) : undefined);

      if (
        membershipLevel === undefined ||
        membershipLevel === null ||
        Number.isNaN(membershipLevel)
      ) {
        toast.error('업그레이드할 멤버십 정보를 확인할 수 없습니다.');
        return;
      }

      const activeId = await ensureActiveSubscriptionId();
      if (!activeId) {
        return;
      }

      const { operationId } = ensureOperationId({
        action: "upgrade",
        subscriptionId: activeId,
        userId: loginUser?.id,
      });
      let responseHandled = false;

      try {
        updateGlobalLoading(
          "업그레이드를 처리하고 있습니다.",
          "결제 정보를 확인하고 있습니다."
        );
        setIsProcessing(true);
        clearPortoneError();
        setPortoneStatusMessage('업그레이드를 처리하고 있습니다...');

        const upgradeResponse = await PaymentRepository.upgradeSubscription({
          targetMembershipLevel: membershipLevel,
          billingCycle: selectedPeriod,
          paymentMethod: 'CARD',
          operationId,
        });
        responseHandled = true;

        const successMessage =
          upgradeResponse.message ||
          (upgradeResponse.paymentRequested
            ? '업그레이드 결제가 완료되었습니다.'
            : '추가 결제 없이 업그레이드가 완료되었습니다.');

        toast.success(successMessage);

        loadCurrentSubscription().catch((subscriptionError) => {
          logError('업그레이드 후 구독 정보 갱신 실패', subscriptionError as Error);
        });

        router.replace('/track');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '구독 업그레이드에 실패했습니다';
        setPortoneError(message);
        toast.error(message);
        logError('구독 업그레이드 오류', error as Error);
      } finally {
        if (responseHandled) {
          clearOperationId({
            action: "upgrade",
            subscriptionId: activeId,
            userId: loginUser?.id,
          });
        }
        setIsProcessing(false);
        setPortoneStatusMessage(null);
        clearGlobalLoadingSubMessage();
      }

      return;
    }

    logInfo('포트원 V2 정기결제 구독 시작:', { selectedPlan, selectedPeriod, action });
    
    if (!selectedPlan) {
      toast.error('요금제를 선택해주세요.');
      return;
    }

    if (!loginUser?.id || !loginUser.username) {
      toast.error('로그인이 필요합니다.');
      router.replace(`/login?redirect=${encodeURIComponent(loginRedirectTarget)}`);
      return;
    }

    const cardValidationMessage = validateCardForm();
    if (cardValidationMessage) {
      toast.error(cardValidationMessage);
      return;
    }

    let paymentId: string | null = null;
    let issueId: string | null = null;
    let billingKey: string | null = null;

    try {
      updateGlobalLoading("구독을 처리하고 있습니다.");
      setIsProcessing(true);
      clearPortoneError();

      const expectedAmount = getFinalPrice();
      const billingCycle = selectedPeriod === 'YEARLY' ? 'YEARLY' : 'MONTHLY';
      let amount = expectedAmount;
      const orderName = `${selectedPlan.name} (${selectedPeriod === 'MONTHLY' ? '월간' : '연간'} 구독)`;
      const membershipLevel = selectedPlan.level;

      if (membershipLevel === undefined || membershipLevel === null) {
        throw new Error('멤버십 정보를 확인할 수 없습니다');
      }

      setPortoneStatusMessage('결제 준비 중...');
      const preRegisterResponse = await fetch('/api/payments/pre-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          membershipLevel,
          paymentMethod: 'CARD',
          billingCycle,
          couponId: null,
          expectedAmount: amount,
          timezone: clientTimezone || undefined,
          billingTime: defaultBillingTime || undefined,
        }),
      });

      const preRegisterJson: ClientApiResponse<PaymentPreRegisterResponse> = await preRegisterResponse.json();

      if (!preRegisterResponse.ok || !preRegisterJson.success || !preRegisterJson.data) {
        throw new Error(preRegisterJson.error || '결제 준비에 실패했습니다');
      }

      paymentId = preRegisterJson.data.paymentId;

      if (preRegisterJson.data.totalAmount !== expectedAmount) {
        logInfo('결제 준비 금액 조정', {
          expectedAmount,
          validatedAmount: preRegisterJson.data.totalAmount,
        });
      }

      amount = preRegisterJson.data.totalAmount;

      logInfo('결제 준비 완료', {
        paymentId,
        membershipLevel,
        expectedAmount,
        amount,
        currency: preRegisterJson.data.currency,
        status: preRegisterJson.data.status,
        billingCycle: preRegisterJson.data.billingCycle,
        preparedAt: preRegisterJson.data.preparedAt,
      });

      const customerId = `customer_${loginUser.id}`;
      const customerFullName =
        loginUser.name?.trim() ||
        (loginUser.email ? loginUser.email.split('@')[0] : undefined) ||
        '고객';
      const customerNickname = loginUser.nickname?.trim();
      const customerEmail = loginUser.email || `user${loginUser.id}@dplog.kr`;
      const customerPhone =
        (loginUser.phoneNumber || loginUser.tel || '010-0000-0000').replace(/\D/g, '');
      const sanitizedCardNumber = cardForm.number.replace(/\s+/g, '');
      const sanitizedBirth = cardForm.birth.replace(/\D/g, '');
      const expiryMonth = cardForm.expiryMonth.padStart(2, '0');
      const expiryYear = cardForm.expiryYear.padStart(2, '0');

      setPortoneStatusMessage('카드 정보 확인 중...');
      issueId = `issue_${Date.now()}_${Math.random().toString(36).slice(2)}`;

      const issueResponse = await PaymentRepository.issueBillingKeyManually({
        issueId,
        issueName: `${selectedPlan.name} 정기결제`,
        customerId,
        customerName: customerFullName,
        customerEmail,
        customerPhone,
        cardNumber: sanitizedCardNumber,
        expiryMonth,
        expiryYear,
        birthOrBusinessRegistrationNumber: sanitizedBirth,
        passwordTwoDigits: cardForm.passwordTwoDigits,
      });

      billingKey = issueResponse.billingKey;
      const resolvedIssueId = issueResponse.issueId || issueId;
      issueId = resolvedIssueId;

      if (!billingKey) {
        throw new Error('빌링키 발급에 실패했습니다');
      }

      setPortoneStatusMessage('구독 활성화 중...');
      const completeResponse = await fetch('/api/payments/billing-key/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: loginUser.id,
          issueId: resolvedIssueId,
          paymentId,
          productId: selectedPlan.id.toString(),
          billingKey,
          customerId,
          customerName: customerFullName,
          customerNickname,
          customerEmail,
          customerPhone,
          issueResponse: issueResponse.raw || issueResponse,
        }),
      });

      const completeJson: ClientApiResponse<BillingKeyCompleteResponse> = await completeResponse.json();

      if (!completeResponse.ok || !completeJson.success || !completeJson.data) {
        throw new Error(completeJson.error || '구독 활성화에 실패했습니다');
      }

      logInfo('구독 활성화 성공', { subscriptionId: completeJson.data.subscriptionId });
      toast.success('결제가 완료되었습니다!');

      loadCurrentSubscription().catch((subscriptionError) => {
        logError('구독 정보 갱신 실패', subscriptionError as Error);
      });

      resetCardForm();

      router.replace('/track');
    } catch (error) {
      const message = error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다';
      setPortoneError(message);
      logError('포트원 정기결제 처리 오류', error as Error, { paymentId, issueId });

      if (paymentId && issueId) {
        try {
          await fetch('/api/payments/billing-key/fail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              userId: loginUser.id,
              paymentId,
              issueId,
              errorCode: (error as any)?.code || 'UNKNOWN_ERROR',
              errorMessage: message,
              failedAt: new Date().toISOString(),
            }),
          });
        } catch (recordError) {
          logError('빌링키 실패 기록 실패', recordError as Error, { paymentId, issueId });
        }
      }
    } finally {
      setIsProcessing(false);
      setPortoneStatusMessage(null);
      clearGlobalLoadingSubMessage();
    }
  };

  if (membershipError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-primary-50 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <p className="text-gray-700 font-semibold mb-2">멤버십 정보를 불러오지 못했습니다.</p>
              <p className="text-gray-500 text-sm">잠시 후 다시 시도하거나 고객센터에 문의해주세요.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (membershipLoading || subscriptionLoading || subscriptionCheckLoading || !selectedPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-primary-50 pt-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">결제 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const subscriptionAction = getSubscriptionAction();
  const isGlobalLoading = isProcessing || downgradeProcessing;
  const overlayConfig = customLoading(globalLoadingMessage, "lg");
  const overlaySubMessage = portoneStatusMessage ?? globalLoadingSubMessage ?? undefined;
  const isUpgradeAction = subscriptionAction.type === 'upgrade';
  const canSelectYearly = selectedPlan.priceYearly > 0;
  const processingMessage =
    portoneStatusMessage ??
    (isUpgradeAction
      ? "등록된 결제 수단으로 결제를 요청하고 있습니다."
      : "결제 정보를 확인하고 있습니다. 잠시만 기다려주세요.");

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-primary-50 pt-24 pb-24">
      {isGlobalLoading && (
        <GlobalLoadingOverlay
          visible
          config={{ ...overlayConfig, subMessage: overlaySubMessage ?? processingMessage }}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              이전으로
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 주문 정보 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {hasExistingSubscription ? '구독 변경' : '주문 정보'}
              </h2>
              
              {/* 기존 구독 알림 */}
              {hasExistingSubscription && currentSubscription && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="text-blue-600 mr-3 mt-1" size={20} />
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">현재 구독 중</h4>
                      <p className="text-sm text-blue-800">
                        현재 <strong>{currentSubscription.plan?.name}</strong>을 구독 중입니다.
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        다른 요금제를 선택하면 업그레이드 또는 다운그레이드가 진행됩니다.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 요금제 선택 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">요금제 선택</h3>
                <select
                  value={selectedPlan ? selectedPlan.id.toString() : ''}
                  onChange={(e) => {
                    const selectedId = Number(e.target.value);
                if (Number.isNaN(selectedId)) {
                  return;
                }
                const plan = membershipPlans.find((p) => p.id === selectedId);
                if (plan) {
                  applySelectedPlan(plan, { showToast: true });
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">요금제를 선택하세요</option>
              {membershipPlans.map((plan) => (
                <option key={plan.id} value={plan.id.toString()}>
                  {plan.name} - ₩{formatPrice(plan.price)}/월
                </option>
              ))}
            </select>
            {planDetailLoading && (
              <p className="mt-2 text-sm text-blue-600">요금제 정보를 확인하는 중입니다...</p>
            )}
            {planDetailError && (
              <p className="mt-2 text-sm text-red-600">{planDetailError}</p>
            )}
            {!planDetailError && selectedPlanDetail?.message && (
              <p className="mt-2 text-sm text-green-600">{selectedPlanDetail.message}</p>
            )}
          </div>

              {/* 구독 기간 선택 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">구독 기간</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSelectedPeriod('MONTHLY')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPeriod === 'MONTHLY' 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-semibold">월간 결제</div>
                      <div className="text-sm text-gray-600">매월 결제</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      if (canSelectYearly) {
                        setSelectedPeriod('YEARLY');
                      }
                    }}
                    disabled={!canSelectYearly}
                    className={`p-4 rounded-lg border-2 transition-all relative ${
                      !canSelectYearly
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : selectedPeriod === 'YEARLY'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {selectedPlan && canSelectYearly && selectedPlan.discountPercent > 0 && (
                      <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {selectedPlan.discountPercent}% 할인
                      </div>
                    )}
                    <div className="text-center">
                      <div className="font-semibold">연간 결제</div>
                      <div className="text-sm text-gray-600">한번에 1년 결제</div>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* 선택한 요금제 */}
              <div className="border border-gray-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedPlan.name}</h3>
                  {selectedPlan.isPopular && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                      인기
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {getPlanDetailItems(selectedPlan).map((detail) => (
                    <div key={detail.id} className="flex items-center text-sm text-gray-600">
                      <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-wrap">{detail.description}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">
                      {selectedPeriod === 'YEARLY' ? '연간 구독' : '월간 구독'}
                    </span>
                    <div className="text-right">
                      {selectedPeriod === 'YEARLY' && selectedPlan.discountPercent > 0 && (
                        <div className="text-sm text-gray-500 line-through">
                          ₩{formatPrice(selectedPlan.price * 12)}
                        </div>
                      )}
                      <div className="text-xl font-bold text-gray-900">
                        ₩{formatPrice(finalPrice)}
                      </div>
                      {selectedPeriod === 'YEARLY' && (
                        <div className="text-xs text-green-600 font-medium animate-pulse">
                          🎉 {selectedPlan.discountPercent}% 할인 적용!
                        </div>
                      )}
                    </div>
              </div>
            </div>
          </div>
              {pendingCancel && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">구독 해지 예약 상태</p>
                  <p className="mt-1 text-amber-800">
                    {pendingCancelEffectiveDateLabel
                      ? `${pendingCancelEffectiveDateLabel}에 구독이 종료될 예정입니다.`
                      : "구독 해지가 예약되었습니다."}
                  </p>
                  {pendingCancel.reason && (
                    <p className="mt-2 text-xs text-amber-700">
                      사유: {pendingCancel.reason}
                    </p>
                  )}
                </div>
              )}
              {pendingDowngrade && (
                <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">다운그레이드 예약 상태</p>
                      <p className="mt-1 text-amber-800">
                        {pendingDowngradeEffectiveDateLabel
                          ? `${pendingDowngradeEffectiveDateLabel}부터 ${pendingDowngradePlanName ?? "하위 요금제"}가 적용됩니다.`
                          : `${pendingDowngradePlanName ?? "하위 요금제"} 적용이 예약되었습니다.`}
                      </p>
                      {pendingDowngrade.reason && (
                        <p className="mt-2 text-xs text-amber-700">
                          사유: {pendingDowngrade.reason}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleCancelDowngrade}
                      disabled={downgradeProcessing}
                      className="inline-flex items-center justify-center rounded-md border border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {downgradeProcessing ? "취소 처리 중..." : "다운그레이드 예약 취소"}
                    </button>
                  </div>
                </div>
              )}

              {/* 결제 혜택 */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2 text-wrap">🎉 결제 혜택</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {selectedPlan.trialAvailable && (
                    <li className="text-korean">• {selectedPlan.trialDays ? `${selectedPlan.trialDays}일` : ''} 무료 체험으로 먼저 사용해보세요</li>
                  )}
                 
                    <li className="text-green-600 font-medium text-korean">• 연간 구독 시 {selectedPlan.discountPercent}% 할인 혜택을 받으실 수 있습니다!</li>
                
                </ul>
              </div>
            </div>

            {/* 결제 수단 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">결제 수단</h2>

              {/* 안전한 결제 안내 */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <CreditCard className="text-blue-600 mr-3 mt-1" size={20} />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2 text-wrap">안전한 결제</h4>
                    <div className="text-sm text-blue-800 space-y-1">
                      <p className="text-korean">• 안전한 카드 정보 암호화로 보안을 보장합니다</p>
                      <p className="text-korean">• 실시간 결제 승인으로 빠른 처리가 가능합니다</p>
                      <p className="text-korean">• 다양한 카드사 지원으로 편리합니다</p>
                      <p className="text-korean">• 결제 완료 시 즉시 서비스 이용이 가능합니다</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 결제 수단 (카드만 지원) */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 수단</h3>
                <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <CreditCard className="text-blue-600 mr-3" size={20} />
                    <div>
                      <div className="font-medium text-blue-900 text-wrap">신용/체크카드</div>
                      <div className="text-sm text-blue-700 text-wrap">안전하고 빠른 카드 결제</div>
                    </div>
                  </div>
                </div>
              </div>

              {isUpgradeAction && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 text-wrap">
                    등록된 결제 수단으로 {upgradePaymentLabel}이 청구됩니다.
                  </p>
                </div>
              )}

              {/* 카드 정보 입력 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">카드 정보 입력</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm text-gray-700 block mb-1" htmlFor="card-number">
                      카드 번호
                    </label>
                    <input
                      id="card-number"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="0000 0000 0000 0000"
                      value={cardForm.number}
                      onChange={handleCardInputChange('number')}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={isProcessing || isUpgradeAction}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-700 block mb-1" htmlFor="expiry-month">
                        유효기간 (월)
                      </label>
                      <input
                        id="expiry-month"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="cc-exp-month"
                        placeholder="MM"
                        value={cardForm.expiryMonth}
                        onChange={handleCardInputChange('expiryMonth')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={isProcessing || isUpgradeAction}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 block mb-1" htmlFor="expiry-year">
                        유효기간 (년)
                      </label>
                      <input
                        id="expiry-year"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="cc-exp-year"
                        placeholder="YY"
                        value={cardForm.expiryYear}
                        onChange={handleCardInputChange('expiryYear')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={isProcessing || isUpgradeAction}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-700 block mb-1" htmlFor="card-birth">
                        생년월일 / 사업자등록번호
                      </label>
                      <input
                        id="card-birth"
                        type="tel"
                        inputMode="numeric"
                        placeholder="YYMMDD 또는 10자리"
                        value={cardForm.birth}
                        onChange={handleCardInputChange('birth')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        disabled={isProcessing || isUpgradeAction}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700 block mb-1" htmlFor="card-password">
                        비밀번호 앞 2자리
                      </label>
                      <input
                        id="card-password"
                        type="password"
                        inputMode="numeric"
                        placeholder="**"
                        value={cardForm.passwordTwoDigits}
                        onChange={handleCardInputChange('passwordTwoDigits')}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        maxLength={2}
                        disabled={isProcessing || isUpgradeAction}
                      />
                    </div>
                  </div>

                  {!isUpgradeAction && (
                    <p className="text-xs text-gray-500">
                      입력된 정보는 결제에만 사용되며 서버를 통해 안전하게 전송됩니다.
                    </p>
                  )}
                </div>
              </div>


              {/* 보안 정보 */}
              {/* <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Shield size={16} className="text-green-500 mr-2 flex-shrink-0" />
                  <span className="text-wrap">포트원의 안전한 결제 시스템으로 보호됩니다</span>
                </div>
                <div className="text-xs text-gray-500 ml-6">
                  <p className="text-wrap">• PCI-DSS Level 1 인증으로 카드 정보를 안전하게 보호</p>
                  <p className="text-wrap">• 토큰화 기술로 카드 정보를 직접 저장하지 않음</p>
                </div>
              </div> */}

              {/* 최종 결제 금액 */}
              <div className="border-t pt-6 mb-6">
                <div className="flex justify-between items-center text-lg font-bold mb-2">
                  <span>최종 결제 금액</span>
                  <span className="text-blue-600">
                    {formattedSelectedPlanPrice ?? `₩${formatPrice(finalPrice)}`}
                  </span>
                </div>
                {isUpgradeAction ? (
                  <div className="text-sm text-blue-600 text-right text-wrap">
                    {upgradeSummaryDescription}
                  </div>
                ) : (
                  <div className="text-sm text-gray-600 text-right">
                    {selectedPeriodLabel} 구독
                    {selectedPeriod === 'YEARLY' && selectedPlan.priceYearly > 0 && selectedPlan.discountPercent > 0 && (
                      <span className="text-green-600 font-medium ml-2">
                        🎉 연간 {selectedPlan.discountPercent}% 할인!
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* 결제 버튼 */}
              <button
                onClick={handleSubscriptionPayment}
                disabled={isProcessing || downgradeProcessing || subscriptionAction.disabled}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                  isProcessing || downgradeProcessing || subscriptionAction.disabled
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : subscriptionAction.type === 'upgrade'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transform hover:scale-105'
                    : subscriptionAction.type === 'downgrade' 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg transform hover:scale-105'
                    : 'bg-gradient-to-r from-[#25e4ff] to-[#0284c7] text-white hover:shadow-lg transform hover:scale-105'
                }`}
              >
                {isProcessing || downgradeProcessing ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {portoneStatusMessage ||
                      (downgradeProcessing ? '다운그레이드 처리 중...' : '처리 중...')}
                  </div>
                ) : (
                  subscriptionAction.label
                )}
              </button>

              {/* 약관 동의 및 안내 */}
              <div className="mt-4 space-y-2">
                <div className="text-xs text-gray-500 text-center text-wrap">
                  결제 진행 시 <a href="/TermsOfService" className="text-blue-600 underline">이용약관</a> 및 {' '}
                  <a href="/privacyPolicy" className="text-blue-600 underline">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
                </div>
                <div className="text-xs text-gray-400 text-center text-wrap">
                  💳 결제 완료 후 즉시 서비스 이용이 가능합니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      <SubscriptionDowngradeModal
        isOpen={isDowngradeModalOpen}
        isProcessing={downgradeProcessing}
        currentPlanName={currentSubscription?.plan?.name ?? null}
        targetPlanName={
          downgradeTargetPlan?.name ??
          selectedPlan?.name ??
          "선택한 요금제"
        }
        targetBillingCycleLabel={
          selectedPeriod === "YEARLY" ? "연간" : "월간"
        }
        nextBillingDate={currentSubscription?.nextBillingDate ?? null}
        onClose={() => {
          if (!downgradeProcessing) {
            setIsDowngradeModalOpen(false);
            setDowngradeTargetPlan(null);
          }
        }}
        onConfirm={handleDowngradeConfirm}
      />
      </div>
    </div>
  );
}

export default PaymentClientPage;
