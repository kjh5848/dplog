/**
 * [역할]   실시간 키워드 검색 섹션 컴포넌트
 * [입력]   -
 * [출력]   HeroRealtimeSearch를 포함한 섹션 UI
 * [NOTE]   Pure Component · 단일 책임 원칙
 */

import React from "react";
import HeroRealtimeSearch from "./HeroRealtimeSearch";

export default function RealtimeSearchSection() {
  return (
    <section id="realtime" className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="scroll-animate mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            지금 바로{" "}
            <span className="animate-glow-pulse bg-gradient-to-r from-[#25e4ff] to-[#0284c7] bg-clip-text text-transparent">
              순위 확인
            </span>
          </h2>
          <p className="word-break-keep text-xl text-wrap text-gray-600">
            키워드와 가게명을 입력하면 실시간 순위를 확인할 수 있습니다
          </p>
        </div>

        {/* 실시간 검색 폼 */}
        <div className="scroll-animate">
          <HeroRealtimeSearch />
        </div>
      </div>
    </section>
  );
} 