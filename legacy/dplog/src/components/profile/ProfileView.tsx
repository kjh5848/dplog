"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  Camera,
  Crown,
  CreditCard,
} from "lucide-react";
import { logError } from "@/src/utils/logger";
import {
  useProfileStore,
  profileUtils,
} from "@/src/viewModel/profile/nplaceProfileViewModel";
import {
  MembershipHistoryItem,
  MembershipHistoryPageInfo,
  MembershipProfileSummaryData,
  MembershipProfileSummaryResponse,
  MembershipUsageMetric,
} from "@/types/membership";
import { useAuthGuard, useAuthStatus } from "@/src/utils/auth";
import { loadingUtils } from "@/src/utils/loading";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import { useRouter, useSearchParams } from "next/navigation";
import { usePriceViewModel } from "@/src/viewModel/price/usePriceViewModel";
import { toast } from "react-hot-toast";
import PaymentRepository from "@/src/model/PaymentRepository";
import { SubscriptionCancelReasonCode } from "@/src/types/payment";
import SubscriptionCancelModal from "@/src/features/subscription/components/SubscriptionCancelModal";
import { getServiceSortDisplayRule } from "@/src/constants/serviceSortDisplayRules";

import Image from "next/image";

const HISTORY_PAGE_SIZE = 10;

export default function ProfileView() {
  const { profile, error, setProfile, updateProfile, setLoading, setError } =
    useProfileStore();
  const { loginUser } = useAuthStatus();
  const { isLoading, isGuest, isAuthenticated, isLogoutPending } =
    useAuthGuard();
  const {
    currentSubscription,
    pendingDowngrade,
    pendingCancel,
    getSubscriptionStatus,
    scheduleCancel,
    cancelScheduledCancel,
    cancelScheduledDowngrade,
  } = usePriceViewModel();
  const router = useRouter();
  const searchParams = useSearchParams();
  const authConfig = useMemo(() => loadingUtils.userAuth(), []);
  const logoutConfig = useMemo(() => loadingUtils.logoutAuth(), []);
  const guestConfig = useMemo(() => loadingUtils.loginRedirect(), []);

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileSummary, setProfileSummary] =
    useState<MembershipProfileSummaryData | null>(null);
  const [historyItems, setHistoryItems] = useState<MembershipHistoryItem[]>([]);
  const [historyPageInfo, setHistoryPageInfo] =
    useState<MembershipHistoryPageInfo | null>(null);
  const [membershipsLoading, setMembershipsLoading] = useState(false);
  const [historyAppending, setHistoryAppending] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [paymentHistoryLoading, setPaymentHistoryLoading] = useState(false);
  const [paymentHistoryError, setPaymentHistoryError] = useState<string | null>(
    null,
  );
  const hasLoadedSummaryRef = useRef(false);
  const hasLoadedPaymentHistoryRef = useRef(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    company: "",
    department: "",
    naverId: "",
    naverPassword: "",
  });
  const [isDowngradeProcessing, setIsDowngradeProcessing] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelProcessing, setIsCancelProcessing] = useState(false);
  const [isCancelTargetLoading, setIsCancelTargetLoading] = useState(false);
  const [cancelSubscriptionId, setCancelSubscriptionId] = useState<
    string | null
  >(null);
  const [isCancelUndoProcessing, setIsCancelUndoProcessing] = useState(false);

  // URL 파라미터에서 탭 설정
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && ["profile", "subscription"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // 로그인 사용자 정보로 프로필 초기화
  useEffect(() => {
    if (loginUser && !profile) {
      const displayName =
        (loginUser as any).nickname ||
        (loginUser as any).name ||
        loginUser.username ||
        loginUser.userName ||
        "사용자";
      const avatar =
        (loginUser as any).profileImage ||
        (loginUser as any).profileImageUrl ||
        (loginUser as any).thumbnailImageUrl ||
        "";
      const userProfile = {
        id: String(loginUser.id || "user-001"),
        username: displayName,
        email: loginUser.email || "user@example.com",
        authority: loginUser.authority || loginUser.roleList || ["USER"],
        createdAt: loginUser.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profileImage: avatar,
        phoneNumber: loginUser.phoneNumber || "",
        company: loginUser.company || "",
        department: loginUser.department || "",
        provider: (loginUser as any).provider || "LOCAL",
        providerId: (loginUser as any).providerId,
        naverId: "",
        naverPassword: "",
      };
      setProfile(userProfile);
    }
  }, [loginUser, profile, setProfile]);

  // 게스트 사용자 처리
  useEffect(() => {
    if (isGuest && !isLogoutPending) {
      toast.error("로그인 후 이용해주세요.", {
        id: "guest-redirect",
        duration: 3000,
      });
      router.push("/login");
    }
  }, [isGuest, isLogoutPending, router]);

  useEffect(() => {
    hasLoadedSummaryRef.current = false;
    setProfileSummary(null);
    setHistoryItems([]);
    setHistoryPageInfo(null);
    setMembershipsLoading(false);
    setHistoryAppending(false);
    setSummaryError(null);
    setPaymentHistoryLoading(false);
    setPaymentHistoryError(null);
    hasLoadedPaymentHistoryRef.current = false;
  }, [loginUser?.id]);

  const fetchProfileSummary = useCallback(
    async (options: { cursor?: string | null; append?: boolean } = {}) => {
      if (!loginUser?.id) {
        return;
      }

      const { cursor = null, append = false } = options;

      if (append) {
        if (!cursor) {
          return;
        }
        setHistoryAppending(true);
      } else {
        setMembershipsLoading(true);
        setSummaryError(null);
        setPaymentHistoryLoading(true);
        setPaymentHistoryError(null);
      }

      try {
        const params = new URLSearchParams();
        params.set("historyLimit", String(HISTORY_PAGE_SIZE));
        if (cursor) {
          params.set("historyCursor", cursor);
        }

        const response = await fetch(
          `/api/membership/profile-summary${params.toString() ? `?${params.toString()}` : ""}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );
        const body: MembershipProfileSummaryResponse = await response.json();

        if (!response.ok || body.code !== 0 || !body.data) {
          throw new Error(
            body.message || "멤버십 요약 정보를 가져오지 못했습니다.",
          );
        }

        const data: MembershipProfileSummaryData = body.data;

        setProfileSummary((prev) => {
          if (!append) {
            return data;
          }

          const accumulatedHistory = [
            ...(prev?.history ?? []),
            ...(data.history ?? []),
          ];

          return {
            ...data,
            history: accumulatedHistory,
          };
        });

        setHistoryItems((prev) =>
          append ? [...prev, ...data.history] : data.history,
        );
        setHistoryPageInfo(data.historyPageInfo ?? null);
        setSummaryError(null);
        setPaymentHistoryError(null);
        hasLoadedPaymentHistoryRef.current = true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "멤버십 요약 정보를 가져오지 못했습니다.";
        setSummaryError(message);
        setPaymentHistoryError(message);
        toast.error(message);
      } finally {
        if (append) {
          setHistoryAppending(false);
        } else {
          setMembershipsLoading(false);
          setPaymentHistoryLoading(false);
        }
      }
    },
    [loginUser?.id],
  );

  const handleLoadMoreHistory = useCallback(() => {
    if (!historyPageInfo?.hasNextPage || !historyPageInfo.nextCursor) {
      return;
    }
    fetchProfileSummary({ cursor: historyPageInfo.nextCursor, append: true });
  }, [historyPageInfo, fetchProfileSummary]);

  // 구독 탭이 활성화될 때 멤버십/결제 정보 및 구독 상태 로드
  useEffect(() => {
    if (activeTab !== "subscription" || !loginUser?.id) {
      return;
    }

    if (!hasLoadedSummaryRef.current || !hasLoadedPaymentHistoryRef.current) {
      fetchProfileSummary();
      hasLoadedSummaryRef.current = true;
      hasLoadedPaymentHistoryRef.current = true;
    }

    getSubscriptionStatus(String(loginUser.id));
  }, [activeTab, loginUser?.id, getSubscriptionStatus, fetchProfileSummary]);

  // 편집 모드 시작
  const handleEditStart = () => {
    if (profile) {
      setEditForm({
        username: profile.username,
        email: profile.email || "",
        phoneNumber: profile.phoneNumber || "",
        company: profile.company || "",
        department: profile.department || "",
        naverId: profile.naverId || "",
        naverPassword: profile.naverPassword || "",
      });
      setIsEditing(true);
    }
  };

  // 편집 취소
  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({
      username: "",
      email: "",
      phoneNumber: "",
      company: "",
      department: "",
      naverId: "",
      naverPassword: "",
    });
  };

  // 프로필 저장
  const handleSave = async () => {
    if (!profile) return;

    // 유효성 검사
    if (!editForm.username.trim()) {
      setError("사용자명은 필수입니다.");

      return;
    }

    if (!profileUtils.validateEmail(editForm.email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    if (
      editForm.phoneNumber &&
      !profileUtils.validatePhoneNumber(editForm.phoneNumber)
    ) {
      setError("올바른 전화번호 형식을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 실제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000));

      updateProfile(editForm);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("프로필 업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 멤버십 상태 한글 변환
  const getMembershipStatusText = (status: string) => {
    switch (status) {
      case "ACTIVATE":
        return "활성";
      case "EXPIRED":
        return "만료";
      case "STOP":
        return "중지";
      case "READY":
        return "준비중";
      default:
        return status;
    }
  };

  // 멤버십 상태 스타일
  const getMembershipStatusStyle = (status: string) => {
    switch (status) {
      case "ACTIVATE":
        return "bg-green-100 text-green-800";
      case "EXPIRED":
        return "bg-red-100 text-red-800";
      case "STOP":
        return "bg-yellow-100 text-yellow-800";
      case "READY":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUsageLabel = (key: string) => {
    const rule = getServiceSortDisplayRule(key);
    if (rule) {
      return rule.label;
    }
    return key.replace(/^extras\./, "");
  };

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("ko-KR").format(value);

  const formatCurrency = (value: number) =>
    `₩${new Intl.NumberFormat("ko-KR").format(value)}`;

  const formatUsageMetric = (
    metric: MembershipUsageMetric,
  ): {
    primary: string;
    caption?: string;
  } => {
    const captionSegments: string[] = [];

    if (metric.periodType === "DAILY") {
      captionSegments.push("오늘 기준");
    } else if (metric.periodType === "MONTHLY") {
      captionSegments.push("이번 달 기준");
    }

    if (metric.periodKey) {
      captionSegments.push(metric.periodKey);
    }

    const caption =
      captionSegments.length > 0 ? captionSegments.join(" · ") : undefined;

    if (metric.limit === null) {
      return {
        primary: `${formatNumber(metric.used)} / 무제한`,
        caption: caption ?? "무제한 이용 가능",
      };
    }

    if (metric.limit === 0 && metric.used === 0) {
      return {
        primary: "데이터 없음",
        caption,
      };
    }

    return {
      primary: `${formatNumber(metric.used)} / ${formatNumber(metric.limit)}`,
      caption,
    };
  };

  const sortUsageItems = (items: UsageMetricItem[]) =>
    [...items].sort((a, b) => {
      const aReview = a.labelKey === "reviewReplies";
      const bReview = b.labelKey === "reviewReplies";
      if (aReview === bReview) {
        return 0;
      }
      return aReview ? 1 : -1;
    });

  const renderUsageCard = ({ key, labelKey, metric }: UsageMetricItem) => {
    const formatted = formatUsageMetric(metric);
    const isReviewReplies = labelKey === "reviewReplies";
    const canUseReviewReplies =
      typeof subscriptionPlanName === "string" &&
      /마스터|master/i.test(subscriptionPlanName);

    if (isReviewReplies && !canUseReviewReplies) {
      return (
        <div
          key={key}
          className="space-y-2 rounded-lg border border-rose-200 bg-rose-50 p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-rose-800">리뷰답글 AI</p>
            <span className="rounded-full bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700">
              마스터 전용
            </span>
          </div>
          <p className="text-sm text-rose-700">
            리뷰답글 AI는 마스터 요금제에서 이용할 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => router.push("/payment?planId=13&period=YEARLY")}
            className="w-full rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            마스터 요금제로 업그레이드
          </button>
        </div>
      );
    }

    return (
      <div
        key={key}
        className="rounded-lg border border-gray-200 bg-white/60 p-4"
      >
        <div className="flex items-center justify-between">
          <p className="mb-1 text-sm text-gray-600">{getUsageLabel(labelKey)}</p>
          {metric.limit === null && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
              무제한
            </span>
          )}
        </div>
        <p className="text-lg font-semibold text-gray-900">
          {formatted.primary}
        </p>
        {formatted.caption && (
          <p className="mt-1 text-xs text-gray-500">{formatted.caption}</p>
        )}
      </div>
    );
  };

  const getPaymentStatusBadge = (
    status: string,
  ): { label: string; className: string } => {
    switch (status) {
      case "DONE":
      case "COMPLETED":
        return { label: "결제 완료", className: "bg-green-100 text-green-700" };
      case "PENDING":
        return {
          label: "결제 대기",
          className: "bg-yellow-100 text-yellow-700",
        };
      case "CANCELLED":
      case "FAILED":
        return { label: "결제 취소", className: "bg-red-100 text-red-700" };
      default:
        return { label: status, className: "bg-gray-100 text-gray-700" };
    }
  };

  const currentMembership = profileSummary?.current ?? null;
  const usageSnapshot = profileSummary?.usage ?? null;

  const paymentHistoryList = useMemo(() => {
    return profileSummary?.payments?.slice(0, 3) ?? [];
  }, [profileSummary?.payments]);

  const handleRefreshProfileSummary = useCallback(() => {
    hasLoadedSummaryRef.current = false;
    hasLoadedPaymentHistoryRef.current = false;
    fetchProfileSummary();
  }, [fetchProfileSummary]);

  const handleCancelDowngradeSchedule = useCallback(async () => {
    try {
      setIsDowngradeProcessing(true);
      const status = await PaymentRepository.getSubscriptionStatus();

      if (!status.hasActiveSubscription || status.subscriptions.length === 0) {
        toast.error("다운그레이드를 취소할 활성 구독이 없습니다.");
        return;
      }

      const active =
        status.subscriptions.find((item) => item.status === "ACTIVE") ??
        status.subscriptions[0];

      if (!active?.subscriptionId) {
        toast.error("구독 정보를 찾지 못했습니다.");
        return;
      }

      await cancelScheduledDowngrade({
        subscriptionId: active.subscriptionId,
        userId: loginUser?.id ? String(loginUser.id) : undefined,
      });

      if (loginUser?.id) {
        await getSubscriptionStatus(String(loginUser.id));
      }
      fetchProfileSummary();
    } catch (error) {
      logError("다운그레이드 예약 취소 실패", error as Error);
    } finally {
      setIsDowngradeProcessing(false);
    }
  }, [
    cancelScheduledDowngrade,
    fetchProfileSummary,
    getSubscriptionStatus,
    loginUser?.id,
  ]);

  type UsageMetricItem = {
    key: string;
    labelKey: string;
    metric: MembershipUsageMetric;
  };

  const usageMetrics = useMemo<UsageMetricItem[]>(() => {
    if (!usageSnapshot) {
      return [];
    }

    const result: UsageMetricItem[] = [];

    Object.entries(usageSnapshot).forEach(([key, value]) => {
      if (!value) {
        return;
      }

      if (key === "extras" && typeof value === "object" && value !== null) {
        Object.entries(
          value as Record<string, MembershipUsageMetric | undefined>,
        ).forEach(([extraKey, extraMetric]) => {
          if (!extraMetric) {
            return;
          }
          result.push({
            key: `extras.${extraKey}`,
            labelKey: extraKey,
            metric: extraMetric,
          });
        });
        return;
      }

      if (typeof value === "object" && "used" in (value as any)) {
        result.push({
          key,
          labelKey: key,
          metric: value as MembershipUsageMetric,
        });
      }
    });

    return result;
  }, [usageSnapshot]);

  const usageMetricsByPeriod = useMemo(() => {
    const monthly: UsageMetricItem[] = [];
    const daily: UsageMetricItem[] = [];

    usageMetrics.forEach((item) => {
      const rule = getServiceSortDisplayRule(item.labelKey);
      const periodType =
        item.metric.periodType ?? rule?.limitUnit ?? "MONTHLY";
      if (periodType === "DAILY") {
        daily.push(item);
      } else {
        monthly.push(item);
      }
    });

    return { monthly, daily };
  }, [usageMetrics]);

  const fetchCancelableSubscriptionId = useCallback(async () => {
    setIsCancelTargetLoading(true);
    try {
      const status = await PaymentRepository.getSubscriptionStatus();

      if (!status.hasActiveSubscription || status.subscriptions.length === 0) {
        setCancelSubscriptionId(null);
        toast.error("현재 활성 구독이 없습니다.");
        setIsCancelModalOpen(false);
        return;
      }

      const active =
        status.subscriptions.find(
          (item) =>
            item.status === "ACTIVE" || item.status === "PENDING_CANCEL",
        ) ?? status.subscriptions[0];

      if (!active?.subscriptionId) {
        setCancelSubscriptionId(null);
        toast.error("해지할 구독 정보를 찾지 못했습니다.");
        setIsCancelModalOpen(false);
        return;
      }

      setCancelSubscriptionId(active.subscriptionId);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "구독 정보를 불러오지 못했습니다.";
      logError("구독 해지 대상 조회 실패", error as Error);
      toast.error(message);
      setCancelSubscriptionId(null);
      setIsCancelModalOpen(false);
    } finally {
      setIsCancelTargetLoading(false);
    }
  }, []);

  const handleOpenCancelModal = useCallback(() => {
    setIsCancelModalOpen(true);
  }, []);

  const handleCloseCancelModal = useCallback(() => {
    if (isCancelProcessing) {
      return;
    }
    setIsCancelModalOpen(false);
    setIsCancelProcessing(false);
    setCancelSubscriptionId(null);
  }, [isCancelProcessing]);

  const handleConfirmCancel = useCallback(
    async ({
      reasonCode,
      reasonDetail,
    }: {
      reasonCode: SubscriptionCancelReasonCode;
      reasonDetail?: string;
    }) => {
      if (!cancelSubscriptionId) {
        toast.error(
          "해지할 구독 정보를 찾지 못했습니다. 새로고침 후 다시 시도해주세요.",
        );
        return;
      }

      setIsCancelProcessing(true);
      try {
        await scheduleCancel({
          subscriptionId: cancelSubscriptionId,
          reasonCode,
          reasonDetail,
          userId: loginUser?.id ? String(loginUser.id) : undefined,
        });

        await getSubscriptionStatus(String(loginUser?.id ?? ""));
        await fetchProfileSummary();
        handleCloseCancelModal();
      } catch (error) {
        logError("구독 해지 예약 실패", error as Error, {
          subscriptionId: cancelSubscriptionId,
        });
      } finally {
        setIsCancelProcessing(false);
      }
    },
    [
      cancelSubscriptionId,
      scheduleCancel,
      fetchProfileSummary,
      getSubscriptionStatus,
      handleCloseCancelModal,
      loginUser?.id,
    ],
  );

  const handleCancelScheduledCancel = useCallback(async () => {
    try {
      setIsCancelUndoProcessing(true);
      const status = await PaymentRepository.getSubscriptionStatus();

      if (!status.hasActiveSubscription || status.subscriptions.length === 0) {
        toast.error("해지 예약을 취소할 활성 구독이 없습니다.");
        return;
      }

      const active =
        status.subscriptions.find(
          (item) =>
            item.status === "ACTIVE" || item.status === "PENDING_CANCEL",
        ) ?? status.subscriptions[0];

      if (!active?.subscriptionId) {
        toast.error("구독 정보를 찾지 못했습니다.");
        return;
      }

      await cancelScheduledCancel({
        subscriptionId: active.subscriptionId,
        userId: loginUser?.id ? String(loginUser.id) : undefined,
      });

      await getSubscriptionStatus(String(loginUser?.id ?? ""));
      fetchProfileSummary();
    } catch (error) {
      logError("구독 해지 예약 취소 실패", error as Error);
    } finally {
      setIsCancelUndoProcessing(false);
    }
  }, [
    cancelScheduledCancel,
    fetchProfileSummary,
    getSubscriptionStatus,
    loginUser?.id,
  ]);

  useEffect(() => {
    if (isCancelModalOpen) {
      fetchCancelableSubscriptionId();
    } else {
      setCancelSubscriptionId(null);
    }
  }, [isCancelModalOpen, fetchCancelableSubscriptionId]);

  const pendingDowngradePlanName = useMemo(() => {
    if (!pendingDowngrade) {
      return null;
    }
    return `레벨 ${pendingDowngrade.targetMembershipLevel}`;
  }, [pendingDowngrade]);

  const pendingDowngradeEffectiveDateLabel = useMemo(() => {
    if (!pendingDowngrade) {
      return null;
    }
    try {
      return new Date(pendingDowngrade.effectiveDate).toLocaleDateString(
        "ko-KR",
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

  const resolvedMembershipId = useMemo(() => {
    if (typeof currentMembership?.membershipId === "number") {
      return currentMembership.membershipId;
    }
    const rawPlanId =
      currentSubscription?.plan?.id ?? currentSubscription?.planId ?? null;
    if (typeof rawPlanId === "number") {
      return rawPlanId;
    }
    if (typeof rawPlanId === "string") {
      const parsed = Number(rawPlanId);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }, [currentMembership?.membershipId, currentSubscription]);

  const isPaidSubscription = useMemo(() => {
    if (resolvedMembershipId !== null) {
      return resolvedMembershipId !== 2;
    }
    const planPrice =
      currentSubscription?.plan?.price ??
      currentSubscription?.plan?.originalPrice ??
      null;
    const amount = currentSubscription?.amount ?? null;
    const numericPlanPrice =
      typeof planPrice === "number"
        ? planPrice
        : planPrice
          ? Number(planPrice)
          : null;
    const numericAmount =
      typeof amount === "number" ? amount : amount ? Number(amount) : null;

    const resolved = numericPlanPrice ?? numericAmount ?? 0;
    return resolved > 0;
  }, [currentSubscription, resolvedMembershipId]);

  const hasActiveSubscription = Boolean(
    currentSubscription || currentMembership,
  );
  const subscriptionPlanName =
    currentMembership?.membershipName ??
    currentSubscription?.plan?.name ??
    "현재 구독";
  const normalizedPlanName = (
    currentMembership?.membershipName ??
    currentSubscription?.plan?.name ??
    ""
  )
    .trim()
    .toLowerCase();
  const isFreeMembershipPlan = useMemo(() => {
    if (resolvedMembershipId !== null) {
      return resolvedMembershipId === 2;
    }
    return (
      normalizedPlanName.length > 0 &&
      (normalizedPlanName === "free" ||
        normalizedPlanName.includes("free") ||
        normalizedPlanName.includes("프리"))
    );
  }, [normalizedPlanName, resolvedMembershipId]);
  const subscriptionCycleLabel = (() => {
    const cycle =
      currentMembership?.billingCycle ??
      (currentSubscription?.period
        ? currentSubscription.period === "YEARLY"
          ? "YEARLY"
          : "MONTHLY"
        : null);

    if (!cycle) {
      return "구독 정보 확인 중...";
    }

    return cycle === "YEARLY" ? "연간 구독" : "월간 구독";
  })();
  const subscriptionStatusLabel = (() => {
    if (currentSubscription) {
      if (currentSubscription.status === "ACTIVE") {
        return "활성";
      }
      if (currentSubscription.status === "PENDING_CANCEL") {
        return "해지 예정";
      }
      return currentSubscription.status;
    }
    return currentMembership ? "활성" : "비활성";
  })();
  const subscriptionStatusClass =
    subscriptionStatusLabel === "활성"
      ? "bg-green-100 text-green-800"
      : subscriptionStatusLabel === "해지 예정"
        ? "bg-amber-100 text-amber-800"
        : "bg-gray-100 text-gray-800";
  const shouldShowCancelButton = isPaidSubscription && !isFreeMembershipPlan;
  const nextBillingDate =
    pendingCancel?.effectiveDate ||
    currentSubscription?.nextBillingDate ||
    currentMembership?.endDate ||
    currentSubscription?.endDate ||
    null;
  const remainingDaysLabel =
    typeof currentMembership?.remainingDays === "number" && isPaidSubscription
      ? `${currentMembership.remainingDays}일 남음`
      : null;


  // 로딩 상태 처리
  if (isLoading) {
    const config = isLogoutPending ? logoutConfig : authConfig;
    const subMessage = isLogoutPending
      ? "로그아웃을 처리하고 있습니다."
      : "사용자 인증을 확인하고 있습니다.";
    return (
      <GlobalLoadingOverlay visible config={{ ...config, subMessage }} />
    );
  }

  // 게스트 사용자 처리
  if (isGuest) {
    return (
      <GlobalLoadingOverlay
        visible
        config={{
          ...guestConfig,
          subMessage: "로그인 페이지로 이동합니다.",
        }}
      />
    );
  }

  // 프로필 정보 로딩 중
  if (!profile) {
    return (
      <div className="flex h-64 min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-500">프로필 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }


  return (
    <>
      <div className="mx-auto min-h-screen max-w-4xl space-y-6 p-4 md:p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
            내 정보
          </h1>
          {!isEditing && activeTab === "profile" && (
            <button
              onClick={handleEditStart}
              className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-700 transition-colors hover:bg-blue-100"
            >
              <Edit3 size={16} />
              편집
            </button>
          )}
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                프로필 정보
              </div>
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                activeTab === "subscription"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Crown size={16} />
                구독 정보
              </div>
            </button>
          </nav>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <X size={16} />
              {error}
            </div>
          </div>
        )}

        {/* 프로필 탭 콘텐츠 */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* 프로필 카드 */}
            <div className="lg:col-span-1">
              <div className="card-primary p-6">
                <div className="text-center">
                  {/* 프로필 이미지 */}
                  <div className="relative mx-auto mb-4 flex items-center justify-center">
                    <div className="from-rank-primary to-rank-secondary flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-r md:h-32 md:w-32">
                      {profile.profileImage ? (
                        <Image
                          src={profile.profileImage}
                          alt="프로필"
                          width={128}
                          height={128}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={40} className="text-white" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute right-0 bottom-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200 bg-white shadow-lg hover:bg-gray-50">
                        <Camera size={16} className="text-gray-600" />
                      </button>
                    )}
                  </div>

                  {/* 기본 정보 */}
                  <h2 className="mb-2 text-xl font-bold text-gray-900">
                    {profile.username}
                  </h2>
                  {/* 로그인 방식 배지 */}
                  <div className="mb-2 flex items-center justify-center">
                    {profile.provider === "KAKAO" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                        카카오 로그인
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        일반 로그인
                      </span>
                    )}
                  </div>
                  <div className="mb-4 flex flex-wrap justify-center gap-2">
                    {profile.authority.map((auth, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                      >
                        <Shield size={12} />
                        {profileUtils.getAuthorityDisplayName(auth)}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    최근 로그인:{" "}
                    {profile.createdAt
                      ? profileUtils.formatDate(profile.createdAt)
                      : "알 수 없음"}
                  </p>
                </div>
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="lg:col-span-2">
              <div className="card-secondary p-6">
                <h3 className="mb-6 text-lg font-semibold text-gray-900">
                  상세 정보
                </h3>

                <div className="space-y-6">
                  {/* 사용자명 */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <User size={16} />
                      사용자명
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) =>
                          setEditForm({ ...editForm, username: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="사용자명을 입력하세요"
                      />
                    ) : (
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-900">
                        {profile.username}
                      </p>
                    )}
                  </div>

                  {/* 이메일 */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Mail size={16} />
                      이메일
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className={`w-full rounded-lg border px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${profile.provider === "KAKAO" ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-500" : "border-gray-300"}`}
                          placeholder="이메일을 입력하세요"
                          disabled={profile.provider === "KAKAO"}
                        />
                        {profile.provider === "KAKAO" && (
                          <p className="mt-1 text-xs text-gray-500">
                            카카오에서 관리되는 정보입니다.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-900">
                        {profile.email}
                      </p>
                    )}
                  </div>

                  {/* 네이버 계정 정보 */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        네이버 아이디
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.naverId}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              naverId: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          placeholder="네이버 아이디"
                          autoComplete="username"
                        />
                      ) : (
                        <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-900">
                          {profile.naverId ? profile.naverId : "미입력"}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        네이버 비밀번호
                      </label>
                      {isEditing ? (
                        <input
                          type="password"
                          value={editForm.naverPassword}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              naverPassword: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                          placeholder="네이버 비밀번호"
                          autoComplete="current-password"
                        />
                      ) : (
                        <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-900">
                          {profile.naverPassword ? "저장됨" : "미입력"}
                        </p>
                      )}
                      {!isEditing && profile.naverPassword && (
                        <p className="mt-1 text-xs text-gray-500">
                          보안을 위해 비밀번호는 표시하지 않습니다.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 전화번호 */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Phone size={16} />
                      전화번호
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editForm.phoneNumber}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            phoneNumber: e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                        placeholder="전화번호를 입력하세요"
                      />
                    ) : (
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-900">
                        {profile.phoneNumber || "등록되지 않음"}
                      </p>
                    )}
                  </div>

                  {/* 마지막 로그인 */}
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Calendar size={16} />
                      마지막 로그인
                    </label>
                    <p className="rounded-lg bg-gray-50 px-3 py-2 text-gray-900">
                      {profileUtils.formatDate(profile.lastLoginAt)}
                    </p>
                  </div>
                </div>

                {/* 편집 모드 버튼 */}
                {isEditing && (
                  <div className="mt-8 flex gap-3 border-t border-gray-200 pt-6">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      ) : (
                        <Save size={16} />
                      )}
                      {isLoading ? "저장 중..." : "저장"}
                    </button>
                    <button
                      onClick={handleEditCancel}
                      disabled={isLoading}
                      className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                    >
                      <X size={16} />
                      취소
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 구독 탭 콘텐츠 */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            {/* 구독 헤더 */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">구독 관리</h2>
              <button
                onClick={() => router.push("/membership")}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              >
                <CreditCard size={16} />새 구독하기
              </button>
            </div>

            {/* 현재 구독 상태 표시 */}
            {hasActiveSubscription && (
              <div className="mb-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <Crown className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subscriptionPlanName}
                      </h3>
                      <p className="text-sm text-blue-600">
                        {subscriptionCycleLabel}
                      </p>
                      {remainingDaysLabel && isPaidSubscription && (
                        <p className="mt-1 text-xs text-gray-500">
                          {remainingDaysLabel}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${subscriptionStatusClass}`}
                  >
                    {subscriptionStatusLabel}
                  </span>
                </div>

                {isPaidSubscription && (
                  <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                    <div className="rounded-lg bg-white/50 p-3">
                      <p className="mb-1 text-gray-600">다음 결제일</p>
                      <p className="font-semibold text-gray-900">
                        {nextBillingDate
                          ? new Date(nextBillingDate).toLocaleDateString(
                              "ko-KR",
                            )
                          : "-"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/50 p-3">
                      <p className="mb-1 text-gray-600">남은 기간</p>
                      <p className="font-semibold text-gray-900">
                        {isPaidSubscription ? (remainingDaysLabel ?? "-") : "-"}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/50 p-3">
                      <p className="mb-1 text-gray-600">자동결제</p>
                      <p className="font-semibold text-gray-900">
                        {currentSubscription
                          ? currentSubscription.autoRenewal
                            ? "활성"
                            : "비활성"
                          : "-"}
                      </p>
                    </div>
                  </div>
                )}

                {pendingCancel && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
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
                      <button
                        type="button"
                        onClick={handleCancelScheduledCancel}
                        disabled={isCancelUndoProcessing}
                        className="inline-flex items-center justify-center rounded-md border border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isCancelUndoProcessing
                          ? "취소 처리 중..."
                          : "해지 예약 취소"}
                      </button>
                    </div>
                  </div>
                )}

                {pendingDowngrade && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
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
                        onClick={handleCancelDowngradeSchedule}
                        disabled={isDowngradeProcessing}
                        className="inline-flex items-center justify-center rounded-md border border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDowngradeProcessing
                          ? "취소 처리 중..."
                          : "다운그레이드 예약 취소"}
                      </button>
                    </div>
                  </div>
                )}
                {/* 현재 구독 정보 표시 */}
                {currentMembership && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold">현재 구독 정보</p>
                        <p className="mt-1 text-xs text-blue-700">
                          {currentMembership.startDate} ~{" "}
                          {currentMembership.endDate}
                        </p>
                        <p className="mt-1 text-xs text-blue-700">
                          남은 기간: {currentMembership.remainingDays}일
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => router.push("/membership")}
                        className="inline-flex items-center justify-center rounded-md border border-blue-400 bg-white px-4 py-2 text-sm font-medium text-blue-800 hover:bg-blue-100"
                      >
                        요금제 변경
                      </button>
                    </div>
                  </div>
                )}
                {shouldShowCancelButton && (
                  <div className="mt-4 flex flex-wrap gap-3 border-t border-blue-200 pt-4">
                    <button
                      type="button"
                      onClick={handleOpenCancelModal}
                      disabled={
                        pendingCancel !== null ||
                        isCancelProcessing ||
                        isCancelTargetLoading
                      }
                      className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      구독 해지하기
                    </button>
                  </div>
                )}
              </div>
            )}

            {usageMetrics.length > 0 && (
              <div className="card-secondary p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  사용량 요약
                </h3>

                {usageMetricsByPeriod.monthly.length > 0 && (
                  <div className="mb-6">
                    <div className="mb-2 text-sm font-semibold text-gray-700">
                      월간 한도 (월별 누적)
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {sortUsageItems(usageMetricsByPeriod.monthly).map(
                        (item) => renderUsageCard(item),
                      )}
                    </div>
                  </div>
                )}

                {usageMetricsByPeriod.daily.length > 0 && (
                  <div>
                    <div className="mb-2 text-sm font-semibold text-gray-700">
                      일간 한도 (당일 리셋)
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {sortUsageItems(usageMetricsByPeriod.daily).map((item) =>
                        renderUsageCard(item),
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 구독 정보 카드 */}
            <div className="card-secondary p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                구독 히스토리
              </h3>

              {summaryError && !membershipsLoading && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {summaryError}
                </div>
              )}

              {membershipsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">
                    구독 정보를 불러오는 중...
                  </span>
                </div>
              ) : historyItems.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {historyItems.map((membership, index) => (
                      <div
                      key={`${membership.membershipId}-${membership.startDate}-${membership.endDate}-${index}`}
                        className="rounded-lg border border-gray-200 p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Crown className="text-yellow-500" size={20} />
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {membership.membershipName}
                              </h4>
                              {membership.billingCycle && (
                                <p className="text-xs text-gray-500">
                                  {membership.billingCycle === "YEARLY"
                                    ? "연간 구독"
                                    : "월간 구독"}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-medium ${getMembershipStatusStyle(membership.membershipState)}`}
                          >
                            {getMembershipStatusText(
                              membership.membershipState,
                            )}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-4 text-sm text-gray-600 md:grid-cols-2">
                          <div>
                            <span className="font-medium">시작일:</span>{" "}
                            {new Date(membership.startDate).toLocaleDateString(
                              "ko-KR",
                            )}
                          </div>
                          <div>
                            <span className="font-medium">종료일:</span>{" "}
                            {new Date(membership.endDate).toLocaleDateString(
                              "ko-KR",
                            )}
                          </div>
                        </div>

                        {membership.membershipState === "ACTIVATE" && (
                          <div className="mt-3 rounded-lg bg-green-50 p-3">
                            <p className="text-sm text-green-800">
                              🎉 현재 활성 상태입니다. 서비스를 이용하실 수
                              있습니다.
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {historyPageInfo?.hasNextPage &&
                    historyPageInfo.nextCursor && (
                      <div className="mt-6 text-center">
                        <button
                          onClick={handleLoadMoreHistory}
                          disabled={historyAppending}
                          className="inline-flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {historyAppending ? (
                            <>
                              <span className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600" />
                              로딩 중...
                            </>
                          ) : (
                            "더 보기"
                          )}
                        </button>
                      </div>
                    )}
                </>
              ) : (
                <div className="py-12 text-center">
                  <Crown className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-medium text-gray-900">
                    구독 중인 서비스가 없습니다
                  </h3>
                  <p className="mb-6 text-gray-600">
                    다양한 요금제를 확인하고 서비스를 시작해보세요.
                  </p>
                  <button
                    onClick={() => router.push("/payment")}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700"
                  >
                    <CreditCard size={18} />
                    요금제 보기
                  </button>
                </div>
              )}
            </div>

            {/* 결제 기록 */}
            <div className="card-secondary p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  결제 기록
                </h3>
                <button
                  onClick={handleRefreshProfileSummary}
                  disabled={paymentHistoryLoading}
                  className="text-sm text-blue-600 transition-colors hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paymentHistoryLoading ? "불러오는 중..." : "새로고침"}
                </button>
              </div>

              {paymentHistoryError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {paymentHistoryError}
                </div>
              )}

              {paymentHistoryLoading && paymentHistoryList.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-gray-500">
                  <span className="mr-2 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600" />
                  결제 기록을 불러오는 중입니다...
                </div>
              ) : paymentHistoryList.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistoryList.map((payment) => {
                    const statusBadge = getPaymentStatusBadge(
                      payment.status ?? "UNKNOWN",
                    );

                    return (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {payment.planName || payment.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payment.paidAt
                                ? new Date(payment.paidAt).toLocaleString(
                                    "ko-KR",
                                  )
                                : "결제일 정보 없음"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {payment.paymentMethod || "결제 수단 미상"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(payment.amount)}
                          </p>
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${statusBadge.className}`}
                          >
                            {statusBadge.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {profileSummary?.payments &&
                    profileSummary.payments.length >
                      paymentHistoryList.length && (
                      <div className="py-2 text-center text-xs text-gray-500">
                        더 많은 결제 기록은 결제 내역 페이지에서 확인할 수
                        있습니다.
                      </div>
                    )}
                </div>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  <p className="mb-2 font-medium text-gray-700">
                    결제 기록이 없습니다.
                  </p>
                  <p className="text-sm">
                    첫 결제를 진행하면 이곳에서 확인할 수 있어요.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <SubscriptionCancelModal
        isOpen={isCancelModalOpen}
        isProcessing={isCancelProcessing || isCancelTargetLoading}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
}
