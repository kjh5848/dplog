// components/TestimonialSection.tsx
"use client";

import React, { useEffect, useRef } from "react";
import { Star, Users } from "lucide-react";
import CountUp from "react-countup";

/* -------------------------------------------------------------------------- */
/*  1) 공통 타입 & 훅                                                          */
/* -------------------------------------------------------------------------- */

interface CountUpController {
  count: number;
  setIsVisible: (v: boolean) => void; // 카운트업 훅(또는 Zustand 등)에서 전달
}

/** 뷰포트에 들어오면 setIsVisible(true) 호출해주는 IntersectionObserver 훅 */
function useInViewCount(
  setIsVisible: (v: boolean) => void,
  options: IntersectionObserverInit = { threshold: 0.3 },
) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true); // → 숫자 애니메이션 시작
        obs.disconnect();
      }
    }, options);

    obs.observe(el);
    return () => obs.disconnect();
  }, [setIsVisible, options]);

  return ref;
}

/* -------------------------------------------------------------------------- */
/*  2) 섹션 컴포넌트                                                           */
/* -------------------------------------------------------------------------- */

interface TestimonialSectionProps {
  userCount: CountUpController;
  reviewCount?: CountUpController; // 향후 확장용
  ratingCount?: CountUpController; // 향후 확장용
}

export default function TestimonialSection({
  userCount,
}: TestimonialSectionProps) {
  // ――― 숫자 카운트업 트리거 ref
  const userRef = useInViewCount(userCount.setIsVisible);

  // ――― 더미 후기 데이터
  const testimonials = [
    {
      name: "김사장님",
      business: "서울 강남 카페",
      review:
        "강남역 카페로 검색했을 때 3개월 만에 1위까지 올라갔어요! 매일 순위 확인하니까 언제 떨어지는지도 바로 알 수 있어서 대응이 빨라졌습니다.",
      initial: "김",
      color: "from-blue-500 to-blue-600",
    },
    {
      name: "박원장님",
      business: "대구 중구 미용실",
      review:
        "대구 중구 미용실로 검색 순위가 경쟁이 너무 치열했는데, 경쟁업체와 비교 기능이 정말 유용해요. 우리가 어디서 밀리는지 한눈에 보여서 마케팅 전략 세우기 좋습니다.",
      initial: "박",
      color: "from-green-500 to-green-600",
    },
    {
      name: "이대표님",
      business: "울산 남구 돈까스집",
      review:
        "울산 남구 돈까스로 검색 시 매일 아침 9시에 오는 리포트 메일 덕분에 순위 관리가 습관이 되었어요. 손님도 늘고 매출도 올랐습니다!",
      initial: "이",
      color: "from-purple-500 to-purple-600",
    },
  ];

  /* --------------------------- 실제 UI 렌더링 --------------------------- */

  return (
    <section className="bg-gradient-to-br from-green-50 to-emerald-50 py-24">
      <div className="container mx-auto px-4">
        {/* 헤드라인 & 통계 */}
        <div className="scroll-animate mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            {/* 숫자 부분 ― IntersectionObserver ref 연결! */}
            <span
              ref={userRef}
              className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
            >
              <CountUp
                end={userCount.count}
                duration={1.5}
                useEasing
                enableScrollSpy={false} // 우리가 직접 트리거
              />
              명 이상
            </span>{" "}
            이 이미 사용 중
          </h2>

          <div className="flex items-center justify-center space-x-8 text-lg">
            <div className="animate-fade-in-scale stagger-1 flex items-center">
              <Star className="mr-2 animate-pulse text-yellow-500" size={20} />
              <span className="font-semibold">4.9점</span>
              <span className="ml-1 text-gray-600">평균 만족도</span>
            </div>
            <div className="animate-fade-in-scale stagger-2 flex items-center">
              <Users className="mr-2 animate-pulse text-blue-500" size={20} />
              <span className="font-semibold">
                {/* 같은 숫자 재활용 */}
                <CountUp
                  end={userCount.count}
                  duration={1.5}
                  useEasing
                  enableScrollSpy={false}
                  start={0}
                />
                +
              </span>
              <span className="ml-1 text-gray-600">사용자</span>
            </div>
          </div>
        </div>

        {/* 후기 카드들 */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className={`enhanced-hover scroll-animate animate-card-hover rounded-xl bg-white p-6 shadow-lg stagger-${
                i + 1
              }`}
            >
              <div className="mb-4 flex items-center">
                <div
                  className={`h-12 w-12 bg-gradient-to-r ${t.color} animate-floating flex items-center justify-center rounded-full font-bold text-white`}
                >
                  {t.initial}
                </div>
                <div className="ml-4">
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.business}</div>
                </div>
              </div>

              {/* 별점 */}
              <div className="mb-3 flex">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className="animate-pulse text-yellow-500"
                    size={16}
                    fill="currentColor"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  />
                ))}
              </div>

              {/* 후기 텍스트 */}
              <p className="text-gray-700 italic">"{t.review}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
