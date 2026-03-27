/**
 * [역할]   홈페이지 메인 컴포넌트
 * [입력]   -
 * [출력]   전체 홈페이지 섹션들을 조합한 페이지
 * [NOTE]   Async · 컴포넌트 조합 · 로그인 체크
 */

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/provider/StoreProvider";
import { useCountUp } from "@/src/hooks/useCountUp";
import { useScrollAnimation } from "@/src/hooks/useScrollAnimation";

// 홈페이지 섹션 컴포넌트들
import HeroSection from "@/src/components/home/HeroSection";
import RealtimeSearchSection from "@/src/components/home/RealtimeSearchSection";
import RankTrackingSection from "@/src/components/home/RankTrackingSection";
import ComparisonSection from "@/src/components/home/ComparisonSection";
import KeywordRecommendationSection from "@/src/components/home/KeywordRecommendationSection";
import MembershipSection from "@/src/components/home/MembershipSection";
import TestimonialSection from "@/src/components/home/TestimonialSection";  
import CTASection from "@/src/components/home/CTASection";
import RealtimeRankSection from "@/src/components/home/RealtimeRankSection";
import RealtimeRankSectionV2 from "@/src/components/home/RealtimeRankSectionV2";

export default function Home() {
  const router = useRouter();
  const { loginUser } = useAuthStore();
  
  // 카운트업 훅들
  const userCount = useCountUp(1300);

  // 스크롤 애니메이션 초기화
  useScrollAnimation();

  // 로그인 체크 함수
  const handleLoginRequired = (redirectPath: string) => {
    if (!loginUser) {
      router.push(`/login?redirect=${redirectPath}`);
      return;
    }
    router.push(redirectPath);
  };

  return (
    <>
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. 실시간 순위 조회 */}
      <RealtimeRankSectionV2 />

      {/* 3. 순위 추적 기능 설명 */}
      <RankTrackingSection />

      {/* 4. 경쟁업체 비교 */}
      <ComparisonSection handleLoginRequired={handleLoginRequired} />

      {/* 5. 연관 키워드 추천 */}
      <KeywordRecommendationSection handleLoginRequired={handleLoginRequired} />

      {/* 6. 요금제 */}
      <MembershipSection />

      {/* 7. 사용자 후기 */}
      <TestimonialSection userCount={userCount} />

      {/* 8. 최종 CTA */}
      <CTASection />
    </>
  );
} 