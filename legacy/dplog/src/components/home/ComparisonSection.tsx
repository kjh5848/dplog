/**
 * [역할]   경쟁업체와 순위 비교 섹션 컴포넌트
 * [입력]   handleLoginRequired: 로그인 확인 함수
 * [출력]   우리가게 vs 경쟁업체 비교 UI
 * [NOTE]   Pure Component · 이벤트 핸들러 주입
 */

import React from "react";
import { Crown, Users } from "lucide-react";

interface ComparisonSectionProps {
  handleLoginRequired: (redirectPath: string) => void;
}

export default function ComparisonSection({ handleLoginRequired }: ComparisonSectionProps) {
  return (
    <section className="bg-white py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            <span className="bg-gradient-to-r from-[#25e4ff] to-[#0284c7] bg-clip-text text-transparent">
              경쟁업체
            </span>
            와 비교해보세요
          </h2>
          <p className="text-xl text-gray-600">
            전국 어느 지역이든 우리 가게와 경쟁업체의 순위, 리뷰, 평점을
            한눈에 비교
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="enhanced-hover rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
            <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-3">
              {/* 우리 가게 */}
              <div className="enhanced-hover rounded-xl border-2 border-blue-500 bg-white p-6 shadow-lg">
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500">
                    <Crown className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold">우리 가게</h3>
                  <p className="text-sm text-gray-600">서울 강남 맛집카페</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">순위</span>
                    <span className="font-bold text-blue-600">3위</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평점</span>
                    <span className="font-bold">4.8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">리뷰</span>
                    <span className="font-bold">1,247개</span>
                  </div>
                </div>
              </div>

              {/* VS */}
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xl font-bold text-white">
                  VS
                </div>
              </div>

              {/* 경쟁 가게 */}
              <div className="enhanced-hover rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-400">
                    <Users className="text-white" size={24} />
                  </div>
                  <h3 className="text-lg font-bold">경쟁 가게</h3>
                  <p className="text-sm text-gray-600">강남역 카페스타</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">순위</span>
                    <span className="font-bold text-red-600">5위</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평점</span>
                    <span className="font-bold">4.3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">리뷰</span>
                    <span className="font-bold">892개</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => handleLoginRequired("/compare")}
                className="rounded-lg bg-gradient-to-r from-[#25e4ff] to-[#0284c7] px-8 py-3 font-semibold text-white transition-all duration-300 hover:shadow-2xl"
              >
                자세히 비교하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 