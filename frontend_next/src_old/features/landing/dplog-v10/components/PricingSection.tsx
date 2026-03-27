'use client';

import React from 'react';
import { Pricing } from '@/shared/ui/pricing';

const dplogPlans = [
  {
    name: "FREE",
    price: "0",
    yearlyPrice: "0",
    period: "무료",
    features: [
      "실시간 순위 조회",
      "기본 진단 리포트",
      "모바일 앱 접근",
    ],
    description: "부담 없이 내 가게 순위를 확인해보세요.",
    buttonText: "무료로 시작하기",
    href: "/sign-up",
    isPopular: false,
  },
  {
    name: "STANDARD",
    price: "4.9",
    yearlyPrice: "3.92",
    period: "월",
    features: [
      "매일 순위 자동 추적",
      "심층 분석 리포트",
      "경쟁 업체 분석",
      "우선순위 액션 플랜",
      "AI 콘텐츠 생성",
      "주간 미션 가이드",
    ],
    description: "지속적인 관리와 개선이 필요한 매장에 추천합니다.",
    buttonText: "30일 무료 체험",
    href: "/sign-up",
    isPopular: true,
  },
  {
    name: "ENTERPRISE",
    price: "0",
    yearlyPrice: "0",
    period: "문의",
    features: [
      "Standard 플랜 전체 포함",
      "매장 무제한 등록",
      "전담 매니저 배정",
      "오프라인 컨설팅",
      "맞춤형 대시보드",
      "SLA 보장",
    ],
    description: "다수 매장 관리 및 전문 컨설팅이 필요한 기업용.",
    buttonText: "영업팀 문의",
    href: "/contact",
    isPopular: false,
  },
];

export const PricingSection = () => {
  return (
    <section className="py-24 px-4 bg-white dark:bg-background-dark">
      <Pricing
        plans={dplogPlans}
        title="매장 규모에 딱 맞는 요금제"
        description={`합리적인 가격으로 시작하고, 성장에 맞춰 업그레이드하세요.\n모든 요금제에는 실시간 진단과 AI 분석이 포함됩니다.`}
      />
    </section>
  );
};
