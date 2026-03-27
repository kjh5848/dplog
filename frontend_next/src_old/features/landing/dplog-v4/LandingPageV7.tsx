"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const socialProof = ["키움프랜차이즈", "로컬체인", "푸드랩", "마켓스퀘어", "그린샵", "그로스팩토리"];

const bentoFeatures = [
  {
    title: "AI 매출 진단",
    description: "POS, 리뷰, 상권 데이터를 통합해 매출 변수를 실시간으로 분석합니다.",
    size: "wide",
  },
  {
    title: "리뷰 자동 대응",
    description: "부정 리뷰를 감지해 맞춤 답변과 보상 플로우를 제안합니다.",
    size: "tall",
  },
  {
    title: "지원금 매칭",
    description: "조건에 맞는 정책 자금을 자동 추천하고 신청 알림을 제공합니다.",
    size: "normal",
  },
  {
    title: "콘텐츠 팩토리",
    description: "SNS/블로그 콘텐츠를 한 번에 생성하고 발행 일정을 관리합니다.",
    size: "normal",
  },
  {
    title: "캠페인 오케스트레이션",
    description: "쿠폰, 메시지, 배너를 연결해 고객 재방문을 유도합니다.",
    size: "wide",
  },
  {
    title: "성과 리포트",
    description: "주간/월간 성과를 한 화면에서 비교하고 실행 체크리스트를 제공합니다.",
    size: "normal",
  },
];

const faqs = [
  {
    question: "무료 플랜으로도 효과를 볼 수 있나요?",
    answer:
      "무료 플랜에서도 매출 진단과 핵심 지표 요약을 제공합니다. 성장 단계에 맞춰 유료 플랜으로 확장할 수 있습니다.",
  },
  {
    question: "데이터 연동은 얼마나 걸리나요?",
    answer:
      "기본 POS/리뷰 연동은 평균 15분 내 완료됩니다. 추가 데이터는 전담 매니저가 도와드립니다.",
  },
  {
    question: "컨설턴트 상담은 포함되나요?",
    answer:
      "Pro 이상 플랜부터 전담 컨설턴트가 배정되며, 분기별 전략 리포트를 제공합니다.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    description: "초기 매장 검증을 위한 필수 기능",
    monthly: "0",
    annual: "0",
    features: ["기본 매출 진단", "리뷰 요약", "주간 리포트"],
    cta: "무료로 시작",
  },
  {
    name: "Pro",
    description: "성장 단계 매장을 위한 핵심 구독",
    monthly: "59,000",
    annual: "49,000",
    features: ["실시간 알림", "캠페인 자동화", "지원금 매칭", "컨설턴트 1:1"],
    cta: "Pro 시작",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "프랜차이즈/다점포 맞춤 운영",
    monthly: "상담",
    annual: "상담",
    features: ["전담 성공 매니저", "커스텀 대시보드", "API 연동", "우선 지원"],
    cta: "상담 요청",
  },
];

export default function LandingPageV7() {
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");

  const priceLabel = useMemo(
    () => (billing === "annual" ? "연 결제 기준" : "월 결제 기준"),
    [billing]
  );

  return (
    <div className="landing-v7 gemini-root dplog-shell">
      <nav className="landing-v7-nav">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link className="landing-v7-logo" href="/landing/dplog-alt">
            D-PLOG
          </Link>
          <div className="hidden items-center gap-8 text-sm md:flex">
            <a className="hover-text-accent" href="#features">
              기능
            </a>
            <a className="hover-text-accent" href="#pricing">
              요금제
            </a>
            <a className="hover-text-accent" href="#trust">
              신뢰
            </a>
            <a className="hover-text-accent" href="#faq">
              FAQ
            </a>
          </div>
          <Link className="btn btn-primary btn-sm" href="/diagnosis/new">
            무료로 시작하기
          </Link>
        </div>
      </nav>

      <main className="landing-v7-main">
        <section className="landing-v7-hero" id="hero">
          <div className="landing-v7-hero-aurora" aria-hidden="true" />
          <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <span className="landing-v7-pill">B2B SaaS 구독형 운영 플랫폼</span>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">
                소상공인 매출의 답을 찾다
                <span className="block text-accent">D-PLOG 데이터 운영 엔진</span>
              </h1>
              <p className="text-base text-white/70 md:text-lg">
                리뷰, 상권, 매출, 정책자금 데이터를 하나의 워크플로우로 연결합니다. AI가 실행 가능한 전략을
                제안하고, 결과를 다시 학습해 매장을 성장시킵니다.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link className="btn btn-primary btn-lg" href="/diagnosis/new">
                  무료로 시작하기
                </Link>
                <Link className="btn btn-outline btn-lg" href="/success-stories">
                  실제 성과 보기
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {["평균 매출 +18%", "월 3시간 절감", "지원금 매칭 45,000건"].map((item) => (
                  <div key={item} className="landing-v7-metric">
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="landing-v7-hero-card">
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>실시간 성장 대시보드</span>
                <span>{priceLabel}</span>
              </div>
              <div className="landing-v7-hero-chart" aria-hidden="true">
                <div className="landing-v7-chart-bar h-20" />
                <div className="landing-v7-chart-bar h-28" />
                <div className="landing-v7-chart-bar h-16" />
                <div className="landing-v7-chart-bar h-32" />
                <div className="landing-v7-chart-bar h-24" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="landing-v7-kpi">
                  <p className="text-xs text-white/50">이번 달 성장률</p>
                  <p className="text-2xl font-bold text-accent">+22.4%</p>
                </div>
                <div className="landing-v7-kpi">
                  <p className="text-xs text-white/50">신규 고객 유입</p>
                  <p className="text-2xl font-bold text-accent">1,284명</p>
                </div>
                <div className="landing-v7-kpi">
                  <p className="text-xs text-white/50">AI 실행 과제</p>
                  <p className="text-2xl font-bold text-accent">14건</p>
                </div>
                <div className="landing-v7-kpi">
                  <p className="text-xs text-white/50">리뷰 평균 평점</p>
                  <p className="text-2xl font-bold text-accent">4.8점</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-v7-proof" id="trust">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">SOCIAL PROOF</p>
                <h2 className="text-2xl font-bold md:text-3xl">이미 수많은 매장이 D-PLOG와 함께합니다</h2>
              </div>
              <span className="text-sm text-white/50">1,200개 매장 사용 중</span>
            </div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              {socialProof.map((item) => (
                <div key={item} className="landing-v7-proof-logo">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-v7-features" id="features">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">FEATURES</p>
              <h2 className="text-3xl font-bold md:text-4xl">모듈형 벤토 그리드로 확장되는 성장 엔진</h2>
              <p className="text-sm text-white/60 md:text-base">
                기능이 추가되어도 흐름이 깨지지 않는 카드 중심 구조로 설계했습니다.
              </p>
            </div>
            <div className="landing-v7-bento mt-8">
              {bentoFeatures.map((feature) => (
                <article
                  key={feature.title}
                  className={`landing-v7-bento-card landing-v7-bento-card--${feature.size}`}
                >
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-v7-pricing" id="pricing">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="flex flex-col gap-4">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">PRICING</p>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-3xl font-bold md:text-4xl">구독형 요금제로 바로 시작하세요</h2>
                <div className="landing-v7-toggle" role="tablist" aria-label="결제 주기 선택">
                  <button
                    type="button"
                    aria-pressed={billing === "monthly"}
                    className={billing === "monthly" ? "is-active" : ""}
                    onClick={() => setBilling("monthly")}
                  >
                    월 결제
                  </button>
                  <button
                    type="button"
                    aria-pressed={billing === "annual"}
                    className={billing === "annual" ? "is-active" : ""}
                    onClick={() => setBilling("annual")}
                  >
                    연 결제
                    <span className="landing-v7-discount">20% 할인</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {pricingTiers.map((tier) => (
                <article
                  key={tier.name}
                  className={`landing-v7-pricing-card${tier.popular ? " is-popular" : ""}`}
                >
                  {tier.popular ? <span className="landing-v7-badge">Most Popular</span> : null}
                  <h3 className="text-xl font-semibold">{tier.name}</h3>
                  <p className="mt-2 text-sm text-white/60">{tier.description}</p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-white">
                      {billing === "annual" ? tier.annual : tier.monthly}
                    </span>
                    <span className="ml-2 text-sm text-white/50">/ 월</span>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-white/70">
                    {tier.features.map((item) => (
                      <li key={item} className="landing-v7-bullet">
                        <span className="landing-v7-bullet-dot" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className={`btn ${tier.popular ? "btn-primary" : "btn-outline"} mt-6 w-full`}>
                    {tier.cta}
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-v7-faq" id="faq">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">FAQ</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">자주 묻는 질문</h2>
            </div>
            <div className="mt-8 grid gap-4">
              {faqs.map((item) => (
                <details key={item.question} className="landing-v7-faq-item">
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-v7-final">
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">READY</p>
              <h2 className="mt-3 text-3xl font-bold md:text-4xl">오늘부터 매장 운영을 자동화하세요</h2>
              <p className="mt-3 text-sm text-white/60">
                무료 진단만으로도 개선 포인트를 확인할 수 있습니다. 지금 시작하세요.
              </p>
            </div>
            <Link className="btn btn-primary btn-lg" href="/diagnosis/new">
              무료 진단 시작
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-v7-footer">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <Link className="landing-v7-logo" href="/landing/dplog-alt">
            D-PLOG
          </Link>
          <p className="text-xs text-white/50">2026 D-PLOG. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
