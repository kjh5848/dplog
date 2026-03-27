/**
 * [역할]   순위 추적 기능 설명 섹션 컴포넌트
 * [입력]   -
 * [출력]   순위 추적 기능 설명과 그래프 예시 UI
 * [NOTE]   Pure Component · 애니메이션 포함
 */

import React from "react";
import { BarChart3, TrendingUp, Zap } from "lucide-react";

export default function RankTrackingSection() {
  return (
    <section className="bg-particles bg-gradient-to-br from-blue-50 to-indigo-50 py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div className="scroll-animate space-y-8">
            <div>
              <h2 className="mb-6 text-4xl font-bold text-gray-900">
                매일 순위를 <br />
                <span className="bg-gradient-to-r from-[#25e4ff] to-[#0284c7] bg-clip-text text-transparent">
                  체크해드려요
                </span>
              </h2>
              <p className="word-break-keep mb-8 text-xl leading-relaxed text-wrap text-gray-600">
                매일 자동으로 순위를 확인하여 우리 가게의 노출 순위 변화를
                추적합니다. 경쟁업체보다 앞서 나가세요!
              </p>
            </div>

            <div className="space-y-4">
              <div className="enhanced-hover animate-slide-in-left stagger-1 flex items-center rounded-lg bg-white p-4 shadow-sm">
                <div className="mr-4 rounded-lg bg-blue-100 p-3">
                  <BarChart3 className="text-blue-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-wrap text-gray-900">
                    블로그, 방문자, 저장수
                  </h4>
                  <p className="word-break-keep text-sm text-wrap text-gray-600">
                    매일 변화하는 리뷰수를 확인하세요.
                  </p>
                </div>
              </div>

              <div className="enhanced-hover animate-slide-in-left stagger-2 flex items-center rounded-lg bg-white p-4 shadow-sm">
                <div className="mr-4 rounded-lg bg-green-100 p-3">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    주간/월간 리포트
                  </h4>
                  <p className="text-sm text-gray-600">
                    상세한 순위 변화 분석 리포트
                  </p>
                </div>
              </div>
            </div>

            <div className="enhanced-hover animate-glow-pulse rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
              <div className="mb-2 flex items-center">
                <Zap className="mr-2 animate-pulse" size={20} />
                <span className="font-semibold">매일 오후 13시</span>
              </div>
              <p>📩 순위 정보를 업데이트 합니다</p>
            </div>
          </div>

          <div className="scroll-animate relative">
            <div className="enhanced-hover animate-floating rounded-2xl bg-white p-8 shadow-2xl">
              <h3 className="mb-6 text-lg font-bold text-gray-900">
                순위 변화 그래프
              </h3>
              <div className="space-y-4">
                {/* 그래프 예시 - 애니메이션 강화 */}
                {[
                  {
                    day: "월",
                    width: "60%",
                    rank: "5위",
                    color: "bg-blue-500",
                  },
                  {
                    day: "화",
                    width: "80%",
                    rank: "3위",
                    color: "bg-green-500",
                  },
                  {
                    day: "수",
                    width: "70%",
                    rank: "4위",
                    color: "bg-yellow-500",
                  },
                  {
                    day: "목",
                    width: "90%",
                    rank: "2위",
                    color: "bg-blue-500",
                  },
                  {
                    day: "금",
                    width: "100%",
                    rank: "1위",
                    color: "bg-green-600",
                  },
                ].map((item, index) => (
                  <div
                    key={item.day}
                    className="animate-slide-in-bottom flex items-center justify-between"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <span className="text-sm text-gray-600">{item.day}</span>
                    <div className="mx-4 h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                        style={{
                          width: item.width,
                          animationDelay: `${index * 0.2}s`,
                        }}
                      ></div>
                    </div>
                    <span
                      className={`text-sm font-semibold ${item.rank === "1위" ? "text-green-600" : ""}`}
                    >
                      {item.rank}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 