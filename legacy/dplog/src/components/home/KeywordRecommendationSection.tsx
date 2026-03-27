/**
 * [역할]   연관 키워드 추천 섹션 컴포넌트
 * [입력]   handleLoginRequired: 로그인 확인 함수
 * [출력]   키워드 추천 및 추적 추가 UI
 * [NOTE]   Pure Component · 이벤트 핸들러 주입
 */

import React from "react";

interface KeywordRecommendationSectionProps {
  handleLoginRequired: (redirectPath: string) => void;
}

export default function KeywordRecommendationSection({ handleLoginRequired }: KeywordRecommendationSectionProps) {
  const keywords = [
    "서울 강남 맛집",
    "부산 해운대 카페",
    "대구 동성로 치킨",
    "대전 둔산동 국밥",
    "울산 삼산동 돈까스",
    "광주 충장로 파스타",
    "인천 송도 일식",
    "수원 영통 중식",
    "전주 한옥마을 맛집",
    "청주 상당구 피자",
    "천안 신부동 족발",
    "포항 북구 회집",
    "창원 성산구 브런치",
    "제주 제주시 흑돼지",
    "춘천 교동 닭갈비",
    "목포 하당 홍어",
    "서울 홍대 카페",
    "부산 해운대 횟집",
    "대구 수성구 파스타",
    "대전 유성구 스시",
    "울산 남구 갈비",
    "광주 서구 분식",
    "인천 부평 중국집",
    "경기 성남 태국음식",
  ];

  return (
    <section className="bg-particles bg-gradient-to-br from-purple-50 to-pink-50 py-24">
      <div className="container mx-auto px-4">
        <div className="scroll-animate mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            <span className="animate-glow-pulse bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              연관 키워드
            </span>{" "}
            추천
          </h2>
          <p className="text-xl text-gray-600">
            더 많은 고객이 찾을 수 있는 키워드를 제안해드려요
          </p>
        </div>

        <div className="scroll-animate mx-auto max-w-4xl">
          <div className="enhanced-hover rounded-2xl bg-white p-8 shadow-lg">
            <div className="mb-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                전국 주요 지역 맛집 키워드 추천
              </h3>
              <div className="flex flex-wrap gap-3">
                {keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className={`enhanced-hover animate-fade-in-scale cursor-pointer rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-sm font-medium text-purple-800 transition-all duration-300 hover:shadow-md stagger-${(index % 5) + 1}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>

            <div className="animate-slide-in-bottom border-t pt-6">
              <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div>
                  <h4 className="font-semibold text-gray-900">
                    관심있는 키워드가 있나요?
                  </h4>
                  <p className="text-sm text-gray-600">
                    클릭해서 추적 키워드로 추가해보세요
                  </p>
                </div>
                <button
                  onClick={() => handleLoginRequired("/keywords")}
                  className="btn-pulse enhanced-hover rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-lg"
                >
                  추적 키워드로 추가
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 