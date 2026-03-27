/**
 * [역할]   요금제 구독 플랜 섹션 컴포넌트
 * [입력]   -
 * [출력]   4개 요금제 플랜 카드 UI
 * [NOTE]   Pure Component · 반응형 그리드
 */

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

const PLANS = [
  {
    stage: "A",
    name: "스몰",
    revenueHint: "소규모 매장에 적합",
    features: {
      storeLimit: 1,
      realtimeKeyword: 10,
      trackKeyword: 50,
      blogLowQuality: 0,
      relatedKeyword: 10,
      reviewReply: 0,
    },
    priceMonthly: 10000,
    priceYearly: 100000,
  },
  {
    stage: "B",
    name: "스탠다드",
    revenueHint: "중소규모 매장에 적합",
    features: {
      storeLimit: 3,
      realtimeKeyword: 50,
      trackKeyword: 200,
      blogLowQuality: 100,
      relatedKeyword: 50,
      reviewReply: 10,
    },
    priceMonthly: 20000,
    priceYearly: 200000,
  },
  {
    stage: "C",
    name: "라지",
    revenueHint: "중대형 매장에 적합",
    features: {
      storeLimit: 10,
      realtimeKeyword: 100,
      trackKeyword: 500,
      blogLowQuality: 300,
      relatedKeyword: 100,
      reviewReply: 30,
    },
    priceMonthly: 36000,
    priceYearly: 360000,
  },
  {
    stage: "D",
    name: "엔터프라이즈",
    revenueHint: "대규모 매장에 적합",
    features: {
      storeLimit: 30,
      realtimeKeyword: 300,
      trackKeyword: 1000,
      blogLowQuality: 1000,
      relatedKeyword: 300,
      reviewReply: 100,
    },
    priceMonthly: 56000,
    priceYearly: 560000,
  },
];

export default function MembershipSection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const formatPrice = (price: number) => `₩${price.toLocaleString()}`;

  return (
    <section id="pricing" className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="scroll-animate mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            우리 가게에 딱 맞는{" "}
            <span className="animate-glow-pulse bg-gradient-to-r from-[#25e4ff] to-[#0284c7] bg-clip-text text-transparent">
              요금제
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            필요한 만큼만 선택하고 바로 시작하세요
          </p>
          <div className="mt-6 flex justify-center space-x-4">
            <button
              className={`rounded-lg px-4 py-2 font-semibold transition-colors duration-300 ${
                billingCycle === "monthly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setBillingCycle("monthly")}
            >
              월간 결제
            </button>
            <button
              className={`rounded-lg px-4 py-2 font-semibold transition-colors duration-300 ${
                billingCycle === "yearly"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setBillingCycle("yearly")}
            >
              연간 결제
            </button>
          </div>
        </div>

        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan, index) => (
            <div
              key={plan.stage}
              className={`enhanced-hover scroll-animate animate-fade-in-scale stagger-${index + 1} flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl`}
            >
              <div className="mb-4 flex items-center justify-center space-x-2">
                <div className="rounded-full bg-blue-500 px-3 py-1 text-sm font-semibold text-white">
                  {plan.stage}단계
                </div>
                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              </div>
              <p className="mb-4 text-center text-gray-600">{plan.revenueHint}</p>
              <ul className="mb-8 flex-1 space-y-3 text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>매장 등록 {plan.features.storeLimit}개</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>실시간 키워드 {plan.features.realtimeKeyword}개</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>키워드 추적 {plan.features.trackKeyword}개</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>블로그 저품질 {plan.features.blogLowQuality}개</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>연관 키워드 {plan.features.relatedKeyword}개</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle size={16} className="mr-3 text-green-500" />
                  <span>리뷰 답글 {plan.features.reviewReply}개</span>
                </li>
              </ul>
              <div className="mb-6 text-center text-3xl font-bold text-gray-900">
                {billingCycle === "monthly"
                  ? formatPrice(plan.priceMonthly)
                  : formatPrice(plan.priceYearly)}
                <span className="text-lg font-normal text-gray-600">
                  {billingCycle === "monthly" ? " /월" : " /년"}
                </span>
              </div>
              <Link href="/membership">
                <button className="mt-auto w-full rounded-lg bg-gradient-to-r from-[#25e4ff] to-[#0284c7] py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg">
                  구독하기
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}