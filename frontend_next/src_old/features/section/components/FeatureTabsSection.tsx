"use client";
import React from "react";
import { StickyScroll } from "@/shared/ui/sticky-scroll-reveal";
import Image from "next/image";

const content = [
  {
    title: "All-in-One Solution",
    description:
      "D-PLOG 하나면 충분합니다. 키워드 분석, 순위 추적, 리뷰 관리까지 매장 운영에 필요한 모든 기능을 통합 제공합니다. 복잡한 도구들을 하나로 합쳐 효율성을 극대화하세요.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--cyan-500),var(--emerald-500))] flex items-center justify-center text-white">
        All-in-One Dashboard
      </div>
    ),
  },
  {
    title: "AI 기반 키워드 추천",
    description:
      "우리 매장에 딱 맞는 황금 키워드를 AI가 찾아드립니다. 검색량은 많지만 경쟁은 적은 키워드를 선점하여 노출을 극대화하세요. 데이터 기반의 의사결정으로 광고 효율을 높일 수 있습니다.",
    content: (
      <div className="h-full w-full flex items-center justify-center text-white">
        <Image
          src="/images/logo-symbol.png" // Placeholder or relevant image
          width={300}
          height={300}
          className="h-full w-full object-cover"
          alt="AI Keyword Recommendation"
        />
      </div>
    ),
  },
  {
    title: "실시간 순위 추적",
    description:
      "네이버 플레이스 순위 변동을 실시간으로 추적합니다. 경쟁 매장과의 순위 비교를 통해 우리 매장의 위치를 정확히 파악하고 대응 전략을 수립하세요.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--orange-500),var(--yellow-500))] flex items-center justify-center text-white">
        Real-time Ranking
      </div>
    ),
  },
  {
    title: "리뷰 감성 분석",
    description:
      "고객 리뷰를 AI가 분석하여 긍정/부정 키워드를 추출합니다. 고객의 숨은 니즈를 파악하고 매장 서비스 개선에 활용하세요. 리뷰 관리가 곧 매출로 이어집니다.",
    content: (
      <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--pink-500),var(--indigo-500))] flex items-center justify-center text-white">
        Review Analysis
      </div>
    ),
  },
];

export function FeatureTabsSection() {
  return (
    <div className="p-10 bg-slate-900 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-10 text-white">
        Example: Sticky Scroll Reveal
      </h2>
      <StickyScroll content={content} />
    </div>
  );
}
