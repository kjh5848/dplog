/**
 * [역할]   홈페이지 메인 히어로 섹션 컴포넌트
 * [입력]   -
 * [출력]   타이핑 애니메이션과 3D 목업이 포함된 히어로 UI
 * [NOTE]   Async · 타이핑효과 · 3D변환 애니메이션
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Target, Crown, TrendingUp, BarChart3, Zap } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
  const [typedText, setTypedText] = useState("");
  const fullText = "순위 모르시나요?";

  // 타이핑 애니메이션
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="home"
      className="to-primary-50 bg-particles flex min-h-screen items-center bg-gradient-to-br from-white via-blue-50 pt-24"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="animate-slide-in-left space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl leading-tight font-bold md:text-6xl">
                <span className="text-gray-900">
                  아직도 우리 가게
                </span>
                <br />
                <span className="bg-gradient-to-r from-[#25e4ff] to-[#0284c7] bg-clip-text text-transparent">
                  {typedText}
                  <span className="animate-pulse">|</span>
                </span>
              </h1>
              <p className="stagger-2 word-break-keep text-xl leading-relaxed text-wrap text-gray-600">
                네이버 플레이스에서 우리 가게가 몇 위에 노출되는지
                <br />
                실시간으로 확인하고 매일 추적해보세요!
              </p>
            </div>

            <div className="stagger-3 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/realtime"
                className="btn-pulse flex items-center justify-center rounded-xl bg-gradient-to-r from-[#25e4ff] to-[#0284c7] px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <Target className="mr-2" size={20} />내 순위 확인하기
              </Link>
            </div>
          </div>

          <div className="relative min-h-[600px] flex items-center justify-center">
            {/* 목업 스타일 디바이스 배치 */}
            <div className="relative w-full max-w-4xl mx-auto">
              
              {/* Desktop/Laptop - 중앙 메인 */}
              <div className="relative z-10 animate-slide-in-right">
                <div className="perspective-1000 transform-gpu">
                  {/* 노트북 프레임 */}
                  <div className="bg-gray-800 rounded-2xl p-3 shadow-2xl mx-auto max-w-2xl">
                    {/* 노트북 상단 */}
                    <div className="bg-gray-700 h-2 rounded-t-lg mb-2 relative">
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-0.5 bg-gray-600 rounded"></div>
                    </div>
                    
                    {/* 화면 */}
                    <div className="bg-white rounded-lg overflow-hidden aspect-video relative">
                      {/* 브라우저 헤더 */}
                      <div className="bg-gray-200 p-2 flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="ml-3 bg-white rounded px-2 py-0.5 text-xs text-gray-600 flex-1">
                          map.naver.com/search
                        </div>
                      </div>
                      
                      {/* 네이버 플레이스 이미지 */}
                      <div className="bg-white h-full overflow-hidden">
                        <Image 
                          src="/img/home/desktop_mockup.png" 
                          alt="네이버 플레이스 PC 검색 결과 - 순위 확인 예시"
                          className="w-full h-full object-cover animate-image-zoom-in"
                          fill
                          priority
                        />
                      </div>
                    </div>
                    
                    {/* 노트북 하단 */}
                    <div className="bg-gray-700 h-4 rounded-b-xl mt-2 relative">
                      <div className="absolute left-1/2 bottom-1 transform -translate-x-1/2 w-16 h-1 bg-gray-600 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모바일 - 오른쪽 하단 */}
              <div className="absolute bottom-0 -right-8 z-30 animate-slide-in-bottom"
               >
                <div className="bg-gray-900 rounded-3xl p-2 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="w-48 h-96 bg-white rounded-2xl overflow-hidden">
                    {/* 모바일 실제 이미지 */}
                    <Image 
                      src="/img/home/mobile_mockup.png" 
                      alt="네이버 플레이스 모바일 검색 결과"
                      className="w-full h-full object-cover"
                      width={1000}
                      height={1000}
                    />
                  </div>
                </div>
              </div>

              {/* 성공 뱃지 */}
              <div className="absolute -top-8 left-1/4 z-40 animate-bounce-in" >
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-xl flex items-center transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <Crown size={16} className="mr-2" />
                  순위 분석 완료! 🎉
                </div>
              </div>

              {/* 플로팅 기능 뱃지들 */}
              <div className="absolute top-8 -left-8 z-20 animate-slide-in-right" >
                <div className="bg-white rounded-lg shadow-lg p-3 border border-blue-200 transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="text-blue-600 mr-2" size={16} />
                    <span className="font-semibold text-blue-800">실시간 추적</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-12 -left-12 z-20 animate-slide-in-right" >
                <div className="bg-white rounded-lg shadow-lg p-3 border border-purple-200 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="flex items-center text-sm">
                    <BarChart3 className="text-purple-600 mr-2" size={16} />
                    <span className="font-semibold text-purple-800">순위 리포트</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 