"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMembershipUIStore } from "@/store/membership/useMembershipUIStore";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import toast from "react-hot-toast";
import {
  Building2,
  Search,
  BarChart,
  CheckCircle,
  Crown,
  Star,
  Zap,
  ArrowRight,
  ChevronDown,
  AlertCircle,
  Link,
  MessageCircle,
  FileText,
} from "lucide-react";
import GlobalLoadingOverlay from "@/src/components/common/loading/GlobalLoadingOverlay";
import { customLoading } from "@/src/utils/loading";
import { featureFlags } from "@/src/constants/featureFlags";

type UsageLimitDisplay = {
  primary: string;
  secondary?: string;
  unit?: "DAILY" | "MONTHLY";
  available?: boolean;
};

type Plan = {
  level: number;
  membershipId: number;
  stage: string;
  name: string;
  revenueHint: string;
  storeLimit: UsageLimitDisplay;
  realtimeKeyword: UsageLimitDisplay;
  keywordLookup: UsageLimitDisplay;
  trackKeyword: UsageLimitDisplay;
  blogLowQuality: UsageLimitDisplay;
  relatedKeyword: UsageLimitDisplay;
  reviewReply: UsageLimitDisplay;
  monthlyPrice: number; // 월 구독가(원). 0은 무료
  popular?: boolean;
  icon: React.ReactNode;
};

const usageDailyEnabled = featureFlags.usageDailyEnabled;

const PLANS: Plan[] = [
  {
    level: 0,
    membershipId: 2,
    stage: "체험",
    name: "무료 체험 (7일 무료 이용)",
    revenueHint: "신규 가입자",
    storeLimit: { primary: "1개/월", unit: "MONTHLY" },
    realtimeKeyword: usageDailyEnabled
      ? { primary: "5회/일", secondary: "≈150회/월", unit: "DAILY" }
      : { primary: "150회/월", unit: "MONTHLY" },
    keywordLookup: usageDailyEnabled
      ? { primary: "5회/일", secondary: "≈150회/월", unit: "DAILY" }
      : { primary: "150회/월", unit: "MONTHLY" },
    trackKeyword: { primary: "3개/월", unit: "MONTHLY" },
    blogLowQuality: usageDailyEnabled
      ? { primary: "5회/일", secondary: "≈150회/월", unit: "DAILY" }
      : { primary: "150회/월", unit: "MONTHLY" },
    relatedKeyword: usageDailyEnabled
      ? { primary: "5회/일", secondary: "≈150회/월", unit: "DAILY" }
      : { primary: "150회/월", unit: "MONTHLY" },
    reviewReply: { primary: "미제공", unit: "DAILY", available: false },
    monthlyPrice: 0,
    icon: <Zap size={28} className="text-yellow-500" />,
  },
  {
    level: 1,
    membershipId: 11,
    stage: "1단계",
    name: "실속 점주",
    revenueHint: "월 매출 500만 원 이하",
    storeLimit: { primary: "1개/월", unit: "MONTHLY" },
    realtimeKeyword: usageDailyEnabled
      ? { primary: "20회/일", secondary: "≈600회/월", unit: "DAILY" }
      : { primary: "600회/월", unit: "MONTHLY" },
    keywordLookup: usageDailyEnabled
      ? { primary: "20회/일", secondary: "≈600회/월", unit: "DAILY" }
      : { primary: "600회/월", unit: "MONTHLY" },
    trackKeyword: { primary: "10개/월", unit: "MONTHLY" },
    blogLowQuality: usageDailyEnabled
      ? { primary: "10회/일", secondary: "≈300회/월", unit: "DAILY" }
      : { primary: "300회/월", unit: "MONTHLY" },
    relatedKeyword: usageDailyEnabled
      ? { primary: "10회/일", secondary: "≈300회/월", unit: "DAILY" }
      : { primary: "300회/월", unit: "MONTHLY" },
    reviewReply: { primary: "미제공", unit: "DAILY", available: false },
    monthlyPrice: 19000,
    popular: true,
    icon: <CheckCircle size={28} className="text-green-600" />,
  },
  {
    level: 2,
    membershipId: 12,
    stage: "2단계",
    name: "성장 오너",
    revenueHint: "월 매출 500만 ~ 1,500만 원",
    storeLimit: { primary: "5개/월", unit: "MONTHLY" },
    realtimeKeyword: usageDailyEnabled
      ? { primary: "60회/일", secondary: "≈1,800회/월", unit: "DAILY" }
      : { primary: "1,800회/월", unit: "MONTHLY" },
    keywordLookup: usageDailyEnabled
      ? { primary: "50회/일", secondary: "≈1,500회/월", unit: "DAILY" }
      : { primary: "1,500회/월", unit: "MONTHLY" },
    trackKeyword: { primary: "30개/월", unit: "MONTHLY" },
    blogLowQuality: usageDailyEnabled
      ? { primary: "30회/일", secondary: "≈900회/월", unit: "DAILY" }
      : { primary: "900회/월", unit: "MONTHLY" },
    relatedKeyword: usageDailyEnabled
      ? { primary: "30회/일", secondary: "≈900회/월", unit: "DAILY" }
      : { primary: "900회/월", unit: "MONTHLY" },
    reviewReply: { primary: "미제공", unit: "DAILY", available: false },
    monthlyPrice: 39000,
    icon: <Star size={28} className="text-indigo-500" />,
  },
  {
    level: 3,
    membershipId: 13,
    stage: "3단계",
    name: "프리미엄 마스터",
    revenueHint: "월 매출 1,500만 원 이상",
    storeLimit: { primary: "무제한", unit: "MONTHLY" },
    realtimeKeyword: usageDailyEnabled
      ? { primary: "무제한", secondary: "일간 한도", unit: "DAILY" }
      : { primary: "무제한", unit: "MONTHLY" },
    keywordLookup: usageDailyEnabled
      ? { primary: "무제한", secondary: "일간 한도", unit: "DAILY" }
      : { primary: "무제한", unit: "MONTHLY" },
    trackKeyword: { primary: "200개/월", unit: "MONTHLY" },
    blogLowQuality: usageDailyEnabled
      ? { primary: "무제한", secondary: "일간 한도", unit: "DAILY" }
      : { primary: "무제한", unit: "MONTHLY" },
    relatedKeyword: usageDailyEnabled
      ? { primary: "무제한", secondary: "일간 한도", unit: "DAILY" }
      : { primary: "무제한", unit: "MONTHLY" },
    reviewReply: usageDailyEnabled
      ? { primary: "무제한", secondary: "리뷰 답글 자동 작성", unit: "DAILY" }
      : { primary: "무제한", unit: "MONTHLY" },
    monthlyPrice: 59000,
    icon: <Crown size={28} className="text-amber-500" />,
  },
];

export default function MembershipPage() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [processingLevel, setProcessingLevel] = useState<number | null>(null);
  const [processingMessage, setProcessingMessage] = useState<string | null>(
    null,
  );

  const { loginUser } = useAuthStore();
  const selectedPeriod = useMembershipUIStore((s) => s.selectedPeriod);
  const setSelectedPeriod = useMembershipUIStore((s) => s.setSelectedPeriod);
  const overlayConfig = useMemo(
    () => customLoading("요금제를 준비하고 있습니다.", "md"),
    [],
  );

  const handleSubscribe = async (plan: Plan) => {
    if (processingLevel !== null) {
      return;
    }

    const redirectTarget =
      plan.membershipId === 2 ? "/track" : `/payment?planId=${plan.membershipId}&period=${selectedPeriod}`;

    try {
      if (!loginUser) {
        toast.error("로그인이 필요합니다.");
        router.push(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
        return;
      }

      setProcessingLevel(plan.membershipId);
      setProcessingMessage(
        plan.membershipId === 2
          ? "무료 체험을 준비하고 있습니다."
          : "결제 화면으로 이동 중입니다.",
      );

      // ✅ 무료 요금제인 경우 결제페이지로 이동하지 않음
      if (plan.membershipId === 2) {
        // (선택) 무료 체험 API 호출 — 실제 가입 처리

        toast.success("무료 체험이 시작되었습니다!");
        router.push("/track");
        return;
      }

      // ✅ 유료 플랜만 결제페이지 이동
      toast.success("결제 화면으로 이동합니다.");
      router.push(redirectTarget);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "결제 화면으로 이동하지 못했습니다.";
      toast.error(message);
    } finally {
      setProcessingLevel(null);
      setProcessingMessage(null);
    }
  };

  const formatPrice = (price: number) =>
    price === 0 ? "무료" : `₩${new Intl.NumberFormat("ko-KR").format(price)}`;

  const getYearlyPrice = (monthlyPrice: number) =>
    Math.floor(monthlyPrice * 12 * 0.8); // 20% 할인

  const getDisplayPrice = (monthlyPrice: number) =>
    selectedPeriod === "YEARLY"
      ? Math.floor(getYearlyPrice(monthlyPrice) / 12)
      : monthlyPrice;

  const renderUsageLimit = (limit: UsageLimitDisplay) => (
    <div className="ml-1 flex flex-col">
      <span
        className={`font-semibold ${
          limit.available === false ? "text-gray-500" : "text-blue-600"
        }`}
      >
        {limit.primary}
      </span>
      {limit.secondary && (
        <span className="text-xs text-gray-500">{limit.secondary}</span>
      )}
    </div>
  );

  const FAQS = [
    {
      question: "요금제 변경이 가능한가요?",
      answer:
        "네, 언제든지 요금제 변경이 가능합니다. 업그레이드 시 즉시 적용되며, 다운그레이드는 다음 결제일부터 적용됩니다.",
    },
    {
      question: "환불 정책은 어떻게 되나요?",
      answer:
        "구독 후 7일 이내에는 100% 환불이 가능합니다. 이후에는 사용 기간을 제외하고 부분 환불됩니다.",
    },
    {
      question: "데이터는 얼마나 자주 업데이트되나요?",
      answer:
        "실시간 데이터는 즉시 반영되며, 추적 데이터는 매일 자동으로 수집됩니다.",
    },
    {
      question: "무료 체험 기간이 있나요?",
      answer:
        "모든 요금제에 7일 무료 체험이 제공됩니다. 체험 중 언제든 취소 가능합니다.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 pt-45">
      {processingLevel !== null && (
        <GlobalLoadingOverlay
          visible
          config={{
            ...overlayConfig,
            subMessage: processingMessage ?? undefined,
          }}
        />
      )}
      {/* 배경 원형 글로우 */}
      {/* <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-200 rounded-full blur-3xl opacity-20"></div> */}
      <div className="absolute top-0 left-1/2 h-[600px] w-[600px] max-w-full -translate-x-1/2 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="mb-20 text-center">
          <h1 className="mb-6 text-5xl font-extrabold text-gray-900">
            성장 단계별{" "}
            <span className="bg-gradient-to-r from-[#25e4ff] to-[#0284c7] bg-clip-text text-transparent">
              맞춤 멤버십
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            사장님의 상황에 딱 맞는 플랜을 선택해보세요
          </p>
        </div>

        {/* 기간 선택 토글 */}
        <div className="my-8 flex justify-center">
          <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-lg">
            <button
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                selectedPeriod === "MONTHLY"
                  ? "bg-gradient-to-r from-[#25e4ff] to-[#0284c7] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setSelectedPeriod("MONTHLY")}
            >
              월간 결제
            </button>
            <button
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all ${
                selectedPeriod === "YEARLY"
                  ? "bg-gradient-to-r from-[#25e4ff] to-[#0284c7] text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setSelectedPeriod("YEARLY")}
            >
              연간 결제{" "}
              <span className="ml-1 text-xs text-blue-100">(20% 할인)</span>
            </button>
          </div>
        </div>

        {/* 플랜 카드 */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border-2 p-8 shadow-xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl ${
                plan.popular
                  ? "border-blue-500 bg-gradient-to-b from-white to-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 right-6 rotate-3 bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-md">
                  추천 플랜
                </span>
              )}

              <div className="mb-4 flex justify-center">{plan.icon}</div>
              <h3 className="mb-2 text-center text-xl font-bold text-gray-900">
                {plan.stage} · {plan.name}
              </h3>
              <p className="mb-4 text-center text-sm text-gray-500">
                {plan.revenueHint}
              </p>

              <div className="mb-6 text-center text-3xl font-extrabold text-blue-600">
                {formatPrice(getDisplayPrice(plan.monthlyPrice))}
              </div>

              <div className="mb-6 p-2">
                <h3 className="mb-4 text-center text-xl font-bold text-gray-900">
                  포함 기능
                </h3>

                <ul className="space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">업체 수:</span>
                    {renderUsageLimit(plan.storeLimit)}
                  </li>
                  <li className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">실시간 키워드:</span>
                    {renderUsageLimit(plan.realtimeKeyword)}
                  </li>
                  <li className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">키워드 조회:</span>
                    {renderUsageLimit(plan.keywordLookup)}
                  </li>
                  <li className="flex items-center gap-2">
                    <BarChart className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">키워드 추적:</span>
                    {renderUsageLimit(plan.trackKeyword)}
                  </li>
                  <li className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">저품질 조회:</span>
                    {renderUsageLimit(plan.blogLowQuality)}
                  </li>
                  <li className="flex items-center gap-2">
                    <Link className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">연관검색어:</span>
                    {renderUsageLimit(plan.relatedKeyword)}
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">리뷰 답글:</span>
                    {renderUsageLimit(plan.reviewReply)}
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSubscribe(plan)}
                disabled={processingLevel === plan.level}
                className={`mt-auto w-full rounded-lg py-3 font-semibold transition-transform ${
                  plan.popular
                    ? "bg-gradient-to-r from-[#25e4ff] to-[#0284c7] text-white hover:scale-105"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                } ${
                  processingLevel === plan.level
                    ? "cursor-not-allowed opacity-60"
                    : ""
                }`}
              >
                {processingLevel === plan.level ? (
                  "확인 중..."
                ) : plan.monthlyPrice === 0 ? (
                  "무료로 시작하기"
                ) : (
                  <>
                    구독하기 <ArrowRight size={16} className="ml-2 inline" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mx-auto mt-24 max-w-3xl">
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
            자주 묻는 질문
          </h2>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 bg-white shadow-md transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-gray-900"
                >
                  {faq.question}
                  <ChevronDown
                    className={`ml-2 h-5 w-5 transition-transform ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="animate-fadeIn px-6 pb-4 text-sm text-gray-600">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-28 pb-28 text-center">
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl bg-gradient-to-r from-[#25e4ff] to-[#0284c7] p-10 text-white shadow-2xl">
            <div className="absolute top-0 -left-10 h-full w-1 rotate-12 bg-white/30"></div>
            <h2 className="mb-4 text-3xl font-bold">아직 망설이시나요?</h2>
            <p className="mb-6 text-lg text-blue-100">
              7일 무료 체험으로 모든 기능을 경험해보세요
            </p>
            <button
              onClick={() => router.push("/login")}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-blue-600 shadow-lg transition-all hover:scale-105"
            >
              <Zap size={20} /> 무료 체험 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
