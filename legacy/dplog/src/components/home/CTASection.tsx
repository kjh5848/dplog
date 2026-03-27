/**
 * [역할]   최종 행동 유도 섹션 컴포넌트
 * [입력]   -
 * [출력]   CTA 버튼들과 메시지가 포함된 UI
 * [NOTE]   Pure Component · 그라데이션 배경
 */

import React from "react";
import Link from "next/link";
import { Target, Crown } from "lucide-react";

export default function CTASection() {
  return (
    <section className="animate-gradient-shift bg-particles bg-gradient-to-r from-[#25e4ff] to-[#0284c7] py-24">
      <div className="container mx-auto px-4 text-center">
        <div className="scroll-animate mx-auto max-w-4xl space-y-8">
          <h2 className="animate-slide-in-bottom mb-6 text-4xl font-bold text-white md:text-5xl">
            오늘부터 우리 가게도
            <br />
            <span className="animate-pulse text-yellow-300">
              노출 시작해보세요!
            </span>
          </h2>

          <p className="animate-fade-in-scale stagger-2 mb-8 text-xl leading-relaxed text-blue-100">
            경쟁업체가 먼저 시작하기 전에, 지금 바로 우리 가게 순위를 확인하고
            <br />
            체계적인 순위 관리를 시작해보세요
          </p>

          <div className="animate-slide-in-bottom stagger-3 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              href="#realtime"
              className="btn-pulse flex transform items-center rounded-xl bg-white px-8 py-4 text-lg font-bold text-blue-600 transition-all duration-300 hover:scale-110 hover:shadow-2xl"
            >
              <Target className="mr-2" size={20} />
              무료로 순위 확인하기
            </Link>
            <Link
              href="#pricing"
              className="enhanced-hover flex items-center rounded-xl border-2 border-white px-8 py-4 text-lg font-bold text-white transition-all duration-300 hover:bg-white hover:text-blue-600"
            >
              <Crown className="mr-2" size={20} />
              요금제 비교하기
            </Link>
          </div>

          {/* <div className="text-blue-100 text-sm animate-pulse">
            ✨ 첫 3회 순위 확인은 무료입니다
          </div> */}
        </div>
      </div>
    </section>
  );
} 