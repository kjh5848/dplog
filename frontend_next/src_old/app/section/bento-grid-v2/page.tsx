"use client";

import { BentoGridV2, BentoCardV2 } from "@/shared/ui/bento-grid-v2";
import { BarChart3, Search, Globe, CalendarDays, Bell } from "lucide-react";

const features = [
  {
    Icon: BarChart3,
    name: "실시간 순위 분석",
    description: "네이버 플레이스 순위를 실시간으로 추적하고 변동 추이를 한눈에 확인합니다.",
    href: "#",
    cta: "자세히 보기",
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3",
  },
  {
    Icon: Search,
    name: "AI 키워드 추천",
    description: "AI가 매장에 최적화된 검색 키워드를 분석하고 추천합니다.",
    href: "#",
    cta: "자세히 보기",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3",
  },
  {
    Icon: Globe,
    name: "경쟁 업체 분석",
    description: "주변 경쟁 매장의 전략을 파악하고 차별화 포인트를 제안합니다.",
    href: "#",
    cta: "자세히 보기",
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4",
  },
  {
    Icon: CalendarDays,
    name: "주간 미션 가이드",
    description: "매주 실행 가능한 최적화 미션으로 꾸준한 성장을 돕습니다.",
    href: "#",
    cta: "자세히 보기",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2",
  },
  {
    Icon: Bell,
    name: "알림 & 리포트",
    description: "순위 변동, 리뷰 알림 등 중요한 변화를 실시간으로 알려드립니다.",
    href: "#",
    cta: "자세히 보기",
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4",
  },
];

export default function BentoGridV2Page() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <BentoGridV2 className="lg:grid-rows-3 max-w-5xl">
        {features.map((feature) => (
          <BentoCardV2 key={feature.name} {...feature} />
        ))}
      </BentoGridV2>
    </div>
  );
}
